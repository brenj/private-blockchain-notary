const bitcoinMessage = require('bitcoinjs-message');
const express = require('express');
const moment = require('moment');

const Blockchain = require('./blockchain.js');
const starRequestData = require('./starRequestData.js');

const app = express();
const starBlockchain = new Blockchain();

const EMPTY_HEIGHT = -1;
const PORT = 8000;
const VALIDATION_WINDOW_SECS = 300;
const UNKNOWN_ERROR_MSG = 'Something bad happened ಥ_ಥ, see server logs';

const getBlockResponse = block => ({ error: false, block });
const getErrorResponse = message => ({ error: true, message });

const convertHeightToInt = (req, res, next) => {
  req.params.height = parseInt(req.params.height, 10);
  next();
};

app.use(express.json());

app.post('/requestValidation', (req, res) => {
  const { address } = req.body;

  if (!address) {
    res.status(400).json(getErrorResponse('No address provided'));
    return;
  }

  const requestTimestamp = moment().format('X');
  const requestData = { requestTimestamp, requestValidated: false };

  starRequestData.putStarRequest(address, requestData)
    .then(() => {
      res.status(200).json({
        address,
        requestTimestamp,
        message: `${address}:${requestTimestamp}:starRegistry`,
        validationWindow: VALIDATION_WINDOW_SECS,
      });
    })
    .catch(() => {
      res.status(500).json(getErrorResponse(UNKNOWN_ERROR_MSG));
    });
});

app.post('/message-signature/validate', (req, res) => {
  const { address, signature } = req.body;

  if (!address || !signature) {
    res.status(400).json(getErrorResponse('Missing required parameters'));
    return;
  }

  let signatureVerified = false;

  starRequestData.getStarRequest(address)
    .then((data) => {
      const currentTimestamp = moment().unix();
      const requestTimestamp = parseInt(data.requestTimestamp, 10);
      const validationTimeLeft = currentTimestamp - requestTimestamp;

      if (validationTimeLeft <= VALIDATION_WINDOW_SECS) {
        const message = `${address}:${requestTimestamp}:starRegistry`;
        signatureVerified = bitcoinMessage.verify(
          message, address, signature);
        const statusCode = signatureVerified ? 200 : 403;

        res.status(statusCode).json({
          registerStar: signatureVerified,
          status: {
            address,
            requestTimestamp,
            message,
            validationWindow: VALIDATION_WINDOW_SECS - validationTimeLeft,
            messageSignature: signatureVerified ? 'valid' : 'invalid',
          },
        });
      } else {
        res.status(400).json(getErrorResponse('Validation window expired'));
      }

      return Promise.all([data, signatureVerified]);
    })
    .then(([data, requestValidated]) => {
      starRequestData.putStarRequest(address, { ...data, requestValidated });
    })
    .catch(() => {
      res.status(500).json(getErrorResponse(UNKNOWN_ERROR_MSG));
    });
});

app.post('/block', (req, res) => {
  const { address, star } = req.body;

  if (!address || !star) {
    res.status(400).json(getErrorResponse('Missing required parameters'));
    return;
  }

  if (Buffer.byteLength(star.story, 'ascii') > 500) {
    res.status(400).json(
      getErrorResponse('Star story must be 250 words or less'));
    return;
  }

  const encodedStory = Buffer.from(star.story, 'ascii').toString('hex');
  star.story = encodedStory;
  starBlockchain.addBlock({ address, star })
    .then(block => res.status(201).json(getBlockResponse(block)))
    .catch(() => {
      res.status(500).json(getErrorResponse(UNKNOWN_ERROR_MSG));
    });
});

// app.get('/block/:height(\\d+)', convertHeightToInt, (req, res, next) => {
//   const requestedHeight = req.params.height;

//   starBlockchain.getLastBlockHeight()
//     .then((lastBlockHeight) => {
//       if (lastBlockHeight === EMPTY_HEIGHT) {
//         const emptyBlockchainMessage = 'Blockchain is empty';
//         res.status(404).json(getErrorResponse(emptyBlockchainMessage));
//         next(`ERROR: ${emptyBlockchainMessage}`);
//       } else if (requestedHeight < 0 || requestedHeight > lastBlockHeight) {
//         const invalidBlockMessage = (
//           `Invalid block (${requestedHeight}) requested`);
//         res.status(400).json(getErrorResponse(invalidBlockMessage));
//         next(`ERROR: ${invalidBlockMessage}`);
//       } else {
//         return starBlockchain.getBlock(requestedHeight)
//           .then(block => res.status(200).json(getBlockResponse(block)));
//       }
//     })
//     .catch((error) => {
//       res.status(500).json(getErrorResponse(UNKNOWN_ERROR_MSG));
//       next(`ERROR: ${error}`);
//     });
// });

// app.post('/block', (req, res, next) => {
//   const { body } = req.body;

//   if (body === undefined) {
//     const noBlockDataMessage = 'No block data provided';
//     res.status(400).json(getErrorResponse(noBlockDataMessage));
//     next(`ERROR: ${noBlockDataMessage}`);
//   } else {
//     starBlockchain.addBlock(body)
//       .then(block => res.status(201).json(getBlockResponse(block)))
//       .catch((error) => {
//         res.status(500).json(getErrorResponse(UNKNOWN_ERROR_MSG));
//         next(`ERROR: ${error}`);
//       });
//   }
// });

app.listen(PORT, () => console.log(`App listening on port ${PORT}`));
