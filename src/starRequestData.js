const level = require('level');

const dbPath = './star-requests.db';
const db = level(dbPath);

function putStarRequest(key, value) {
  return new Promise((resolve, reject) => {
    db.put(key, JSON.stringify(value), (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

function getStarRequest(key) {
  return new Promise((resolve, reject) => {
    db.get(key, (error, value) => {
      if (error) {
        reject(error);
      } else {
        resolve(JSON.parse(value));
      }
    });
  });
}

function deleteStarRequest(key) {
  return new Promise((resolve, reject) => {
    db.del(key, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

function getChainData() {
  return new Promise((resolve, reject) => {
    db.createReadStream()
      .on('data', (data) => {
        console.log(data.key, '=', data.value);
      })
      .on('error', (error) => {
        reject(error);
      })
      .on('close', () => {
        resolve();
      });
  });
}

module.exports = {
  putStarRequest,
  getStarRequest,
};

// putStarRequest('12345', {test: 'data'});
// getStarRequest('12345').then((value) => console.log(value));
// deleteStarRequest('12345');
// getChainData().then(() => console.log('done'))
