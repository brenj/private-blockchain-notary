const express = require('express');

const blockchainData = require('../models/blockchainData.js');
const helpers = require('../helpers');

const router = express.Router();

router.get('/address::address', (req, res, next) => {
  const { address } = req.params;

  blockchainData.getBlocksByAddress(address)
    .then((blocks) => {
      // Decode star story
      const decodedBlocks = blocks.map((block) => {
        const updatedBlock = block;
        updatedBlock.body.star.story = helpers.dehexify(
          block.body.star.story);
        return updatedBlock;
      });

      res.status(200).json(decodedBlocks);
    })
    .catch(error => next(`Error: ${error}`));
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
      const decodedBlock = block;
      decodedBlock.body.star.story = helpers.dehexify(block.body.star.story);

      res.status(200).json(decodedBlock);
    })
    .catch(error => next(`Error: ${error}`));
});

module.exports = router;
