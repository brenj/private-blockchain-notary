const bitcoinMessage = require('bitcoinjs-message');
const express = require('express');
const moment = require('moment');

const Blockchain = require('../models/blockchain.js');
const middlewares = require('../middlewares');
const starRequestData = require('../models/starRequestData.js');

const router = express.Router();
const starBlockchain = new Blockchain();

const MAX_STORY_LENGTH = 500; // bytes
const VALIDATION_WINDOW_SECS = 300;

const getErrorResponse = message => ({ error: true, message });

router.post('/requestValidation', (req, res, next) => {
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
    .catch(error => next(`Error: ${error}`));
});

router.post('/message-signature/validate', (req, res, next) => {
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
    .catch(error => next(`Error: ${error}`));
});

router.post('/block', (req, res, next) => {
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
      // if (!data.requestValidated) {
      //   res.status(403).json(
      //     getErrorResponse('Address not validated to register star'));
      //   return;
      // }

      const encodedStory = Buffer.from(star.story, 'ascii').toString('hex');
      star.story = encodedStory;
      starBlockchain.addBlock({ address, star })
        .then(block => res.status(201).json({ block }))
        .catch(error => next(`Error: ${error}`));
    })
    .then(() => starRequestData.deleteStarRequest(address))
    .catch(error => next(`Error: ${error}`));
});

router.get('/block/:height(\\d+)', middlewares.heightToInt, (req, res, next) => {
  const requestedHeight = req.params.height;

  starBlockchain.getLastBlockHeight()
    .then((lastBlockHeight) => {
      if (requestedHeight < 0 || requestedHeight > lastBlockHeight) {
        res.status(400).json(getErrorResponse(
          `Invalid block (${requestedHeight}) requested`));
        return;
      }

      starBlockchain.getBlock(requestedHeight)
        .then((block) => {
          const decodedStory = Buffer.from(
            block.body.star.story, 'hex').toString();
          const decodedBlock = block;
          decodedBlock.body.star.story = decodedStory;

          res.status(200).json({ block: decodedBlock });
        });
    })
    .catch(error => next(`ERROR: ${error}`));
});

module.exports = router;
