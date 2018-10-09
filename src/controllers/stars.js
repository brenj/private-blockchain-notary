const express = require('express');

const blockchainData = require('../blockchainData.js');

const router = express.Router();
const getErrorResponse = message => ({ error: true, message });
const UNKNOWN_ERROR_MSG = 'Something bad happened ಥ_ಥ, see server logs';

router.get('/address::address', (req, res, next) => {
  const { address } = req.params;

  blockchainData.getBlocksByAddress(address)
    .then((blocks) => {
      // Decode star story
      const decodedBlocks = blocks.map((block) => {
        const updatedBlock = block;
        const decodedStory = Buffer.from(
          block.body.star.story, 'hex').toString();
        updatedBlock.body.star.story = decodedStory;
        return updatedBlock;
      });

      res.status(200).json(decodedBlocks);
    })
    .catch((error) => {
      res.status(500).json(getErrorResponse(UNKNOWN_ERROR_MSG));
      next(`Error: ${error}`);
    });
});

router.get('/hash::hash', (req, res, next) => {
  const { hash } = req.params;

  blockchainData.getBlockByHash(hash)
    .then((block) => {
      // Block was not found
      if (!('body' in block)) {
        res.status(200).json({});
        return;
      }

      // Decode star story
      const decodedStory = Buffer.from(
        block.body.star.story, 'hex').toString();
      const decodedBlock = block;
      decodedBlock.body.star.story = decodedStory;

      res.status(200).json(decodedBlock);
    })
    .catch((error) => {
      res.status(500).json(getErrorResponse(UNKNOWN_ERROR_MSG));
      next(`Error: ${error}`);
    });
});

module.exports = router;
