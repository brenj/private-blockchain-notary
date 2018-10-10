const level = require('level');
const moment = require('moment');

const config = require('../../config.js');

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
      if (error && error.name === 'NotFoundError') {
        // App will handle this case
        resolve(undefined);
      } else if (error) {
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

function getExpiredRequests() {
  const expiredRequests = [];

  return new Promise((resolve, reject) => {
    db.createReadStream()
      .on('data', (data) => {
        const starRequest = JSON.parse(data.value);

        if (!starRequest.requestValidated) {
          const currentTimestamp = moment().unix();
          const requestTimestamp = parseInt(starRequest.requestTimestamp, 10);
          const validationTimeLeft = currentTimestamp - requestTimestamp;

          if (validationTimeLeft > config.VALIDATION_WINDOW_SECS) {
            expiredRequests.push(data.key);
          }
        }
      })
      .on('error', (error) => {
        reject(error);
      })
      .on('close', () => {
        resolve(expiredRequests);
      });
  });
}

function pruneExpiredRequests() {
  getExpiredRequests()
    .then((expiredRequests) => {
      const operations = expiredRequests.map(expiredRequest => (
        { type: 'del', key: expiredRequest }));
      db.batch(operations);
    });
}

module.exports = {
  getStarRequest,
  pruneExpiredRequests,
  putStarRequest,
  deleteStarRequest,
};
