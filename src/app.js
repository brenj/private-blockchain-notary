const bitcoinMessage = require('bitcoinjs-message');
const express = require('express');
const moment = require('moment');
const Blockchain = require('./blockchain.js');

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
    const requestTimeStamp = moment().unix().toString();
    res.status(200).json({
      address,
      requestTimeStamp,
      message: `${address}:${requestTimeStamp}:starRegistry`,
      validationWindow: VALIDATION_WINDOW_SECS,
    });
  }
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
