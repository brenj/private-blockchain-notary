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

const MAX_STORY_LENGTH = 500; // bytes
const PORT = 8000;
const PRUNE_REQUESTS_TIMEOUT = 900000; // 15 minutes
const REQUIRED_STAR_PROPS = ['dec', 'ra'];
const VALIDATION_WINDOW_SECS = 300; // 5 minutes

module.exports = {
  GENESIS_BLOCK,
  MAX_STORY_LENGTH,
  PORT,
  PRUNE_REQUESTS_TIMEOUT,
  REQUIRED_STAR_PROPS,
  VALIDATION_WINDOW_SECS,
};
