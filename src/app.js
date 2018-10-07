const bitcoinMessage = require('bitcoinjs-message');
const express = require('express');
const moment = require('moment');

const Blockchain = require('./blockchain.js');
const blockchainData = require('./blockchainData.js');
const starRequestData = require('./starRequestData.js');

const app = express();
const starBlockchain = new Blockchain();

const MAX_STORY_LENGTH = 500; // bytes
const PORT = 8000;
const UNKNOWN_ERROR_MSG = 'Something bad happened ಥ_ಥ, see server logs';
const VALIDATION_WINDOW_SECS = 300;

const getBlockResponse = block => ({ error: false, block });
const getErrorResponse = message => ({ error: true, message });

app.use(express.json());

app.post('/requestValidation', (req, res, next) => {
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
    .catch((error) => {
      res.status(500).json(getErrorResponse(UNKNOWN_ERROR_MSG));
      next(`Error: ${error}`);
    });
});

app.post('/message-signature/validate', (req, res, next) => {
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
    .catch((error) => {
      res.status(500).json(getErrorResponse(UNKNOWN_ERROR_MSG));
      next(`Error: ${error}`);
    });
});

app.post('/block', (req, res, next) => {
  const { address, star } = req.body;

  if (!address || !star) {
    res.status(400).json(getErrorResponse('Missing required parameters'));
    return;
  }

  if (Buffer.byteLength(star.story, 'ascii') > MAX_STORY_LENGTH) {
    res.status(400).json(
      getErrorResponse('Star story must be 250 words or less'));
    return;
  }

  starRequestData.getStarRequest(address)
    .then((data) => {
      if (!data.requestValidated) {
        res.status(403).json(
          getErrorResponse('Address not validated to register star'));
        return;
      }

      const encodedStory = Buffer.from(star.story, 'ascii').toString('hex');
      star.story = encodedStory;
      starBlockchain.addBlock({ address, star })
        .then(block => res.status(201).json(getBlockResponse(block)))
        .catch((error) => {
          res.status(500).json(getErrorResponse(UNKNOWN_ERROR_MSG));
          next(`Error: ${error}`);
        });
    })
    .then(() => starRequestData.deleteStarRequest(address))
    .catch((error) => {
      res.status(500).json(getErrorResponse(UNKNOWN_ERROR_MSG));
      next(`Error: ${error}`);
    });
});

app.listen(PORT, () => console.log(`App listening on port ${PORT}`));
