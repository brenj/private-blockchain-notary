const level = require('level');

const dbPath = './chain-data.db';
const db = level(dbPath);

function addLevelDBData(key, value) {
  return new Promise((resolve, reject) => {
    db.put(key, value, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

function getLevelDBData(key) {
  return new Promise((resolve, reject) => {
    db.get(key, (error, value) => {
      if (error) {
        reject(error);
      } else {
        resolve(value);
      }
    });
  });
}

function addDataToLevelDB(value) {
  let index = 0;

  return new Promise((resolve, reject) => {
    db.createReadStream()
      .on('data', () => {
        index += 1;
      })
      .on('error', (error) => {
        reject(error);
      })
      .on('close', () => {
        addLevelDBData(index, value);
        resolve();
      });
  });
}

function getLastBlockHeight() {
  let height = -1;

  return new Promise((resolve, reject) => {
    db.createKeyStream()
      .on('data', () => {
        height += 1;
      })
      .on('error', (error) => {
        reject(error);
      })
      .on('close', () => {
        resolve(height);
      });
  });
}

function getChainData() {
  const chainData = [];

  return new Promise((resolve, reject) => {
    db.createValueStream()
      .on('data', (block) => {
        chainData.push(block);
      })
      .on('error', (error) => {
        reject(error);
      })
      .on('close', () => {
        resolve(chainData);
      });
  });
}

function getBlocksByAddress(address) {
  const blocks = [];

  return new Promise((resolve, reject) => {
    db.createValueStream()
      .on('data', (blockData) => {
        const block = JSON.parse(blockData);
        if (block.body.address === address) {
          blocks.push(block);
        }
      })
      .on('error', (error) => {
        reject(error);
      })
      .on('close', () => {
        resolve(blocks);
      });
  });
}

function getBlockByHash(hash) {
  let blockFound = false;

  return new Promise((resolve, reject) => {
    db.createValueStream()
      .on('data', (blockData) => {
        const block = JSON.parse(blockData);
        if (block.hash === hash) {
          blockFound = true;
          resolve(block);
        }
      })
      .on('error', (error) => {
        reject(error);
      })
      .on('close', () => {
        if (!blockFound) {
          resolve({});
        }
      });
  });
}

module.exports = {
  addDataToLevelDB,
  addLevelDBData,
  getBlockByHash,
  getBlocksByAddress,
  getChainData,
  getLastBlockHeight,
  getLevelDBData,
};
