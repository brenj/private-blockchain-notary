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

app.post('/requestValidation', (req, res, next) => {
  const { address } = req.body;

  if (!address) {
    const noAddressMessage = 'No address provided';
    res.status(400).json(getErrorResponse(noAddressMessage));
    next(`ERROR: ${noAddressMessage}`);
  } else {
    const requestTimestamp = moment().format('X');
    const requestData = { requestTimestamp, hasStarRegistered: false };

    starRequestData.addStarRequest(address, requestData)
      .then(() => {
        res.status(200).json({
          address,
          requestTimestamp,
          message: `${address}:${requestTimestamp}:starRegistry`,
          validationWindow: VALIDATION_WINDOW_SECS,
        });
      })
      .catch((error) => {
        res.status(500).json(getErrorResponse(UNKNOWN_ERROR_MSG));
        next(`ERROR: ${error}`);
      });
  }
});

app.post('/message-signature/validate', (req, res, next) => {
  const { address, signature } = req.body;

  if (!address || !signature) {
    const missingParametersMessage = 'Required parameters not provided';
    res.status(400).json(getErrorResponse(missingParametersMessage));
    next(`ERROR: ${missingParametersMessage}`);
  }

  starRequestData.getStarRequest(address)
    .then((data) => {
      const currentTimestamp = moment().unix();
      const requestTimestamp = parseInt(data.requestTimestamp, 10);
      const validationTimeLeft = currentTimestamp - requestTimestamp;

      if (validationTimeLeft <= VALIDATION_WINDOW_SECS) {
        const message = `${address}:${requestTimestamp}:starRegistry`;
        const signatureVerified = bitcoinMessage.verify(
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
        const validationWindowMessage = 'Validation window expired';
        res.status(400).json(getErrorResponse(validationWindowMessage));
        next(`ERROR: ${validationWindowMessage}`);
      }
    })
    .catch((error) => {
      res.status(500).json(getErrorResponse(UNKNOWN_ERROR_MSG));
      next(`ERROR: ${error}`);
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
