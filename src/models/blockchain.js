const Block = require('./block.js');
const blockchainData = require('./blockchainData.js');

const GENESIS_BLOCK = {
  body:
   { address: '19AAjaTUbRjQCMuVczepkoPswiZRhjtg31',
     star:
      { dec: '-26° 29\' 24.9',
        ra: '16h 29m 1.0s',
        story: '47656E6573697320426C6F636B',
      },
   },
  height: 0,
  previousBlockHash: '',
  time: '1539023948',
  hash: 'cf0d39b631ecfde41feb7599ef06fbbffe47197eaff949547698d8ef04af9b6d',
};

class Blockchain {
  constructor() {
    this.api = blockchainData;

    // Create genesis block if it doesn't exist
    this.getLastBlockHeight().then((height) => {
      if (height === -1) {
        this.api.addDataToLevelDB(JSON.stringify(GENESIS_BLOCK))
          .catch((error) => {
            console.log(`ERROR: Failed to create genesis block: ${error}`);
            process.exit(1);
          });
      }
    });
  }

  addBlock(blockData) {
    return new Promise((resolve, reject) => {
      this.getLastBlockHeight().then((height) => {
        this.getBlock(height).then((block) => {
          const newBlock = new Block(blockData, height + 1, block.hash);
          newBlock.hash = newBlock.getBlockHash();

          this.api.addDataToLevelDB(JSON.stringify(newBlock))
            .then(() => resolve(newBlock))
            .catch(error => reject(error));
        });
      });
    });
  }

  getLastBlockHeight() {
    return this.api.getLastBlockHeight();
  }

  getBlock(blockHeight) {
    return new Promise((resolve, reject) => {
      this.api.getLevelDBData(blockHeight)
        .then(rawBlockData => JSON.parse(rawBlockData))
        .then((blockData) => {
          // Why doesn't spread operator work here?
          const block = new Block(
            blockData.body, blockData.height,
            blockData.previousBlockHash, blockData.time, blockData.hash);
          resolve(block);
        })
        .catch(error => reject(error));
    });
  }

  validateBlockData(block) {
    // Create original block (no hash) for comparison
    const blockToValidate = new Block(
      block.body, block.height, block.previousBlockHash, block.time);

    return blockToValidate.getBlockHash() === block.hash;
  }

  validateBlock(blockHeight) {
    return new Promise((resolve, reject) => {
      this.getBlock(blockHeight)
        .then(block => resolve(this.validateBlockData(block)))
        .catch(error => reject(error));
    });
  }

  validateChain() {
    return new Promise((resolve, reject) => {
      this.api.getChainData()
        .then((chainData) => {
          const chain = chainData.map((rawBlockData) => {
            const blockData = JSON.parse(rawBlockData);
            return new Block(
              blockData.body, blockData.height,
              blockData.previousBlockHash, blockData.time, blockData.hash);
          });

          const hasAllValidBlocks = chain.every(block => (
            this.validateBlockData(block)
          ));

          chain.sort((a, b) => a.height - b.height);
          const hasAllValidPrevHashes = chain.every((block, index) => {
            if (index < chain.length - 1) {
              const blockHash = block.hash;
              const previousHash = chain[index + 1].previousBlockHash;
              return blockHash === previousHash;
            } else {
              // Skip last block
              return true;
            }
          });

          resolve(hasAllValidBlocks && hasAllValidPrevHashes);
        })
        .catch(error => reject(error));
    });
  }
}

module.exports = Blockchain;
