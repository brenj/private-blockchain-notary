const moment = require('moment');
const SHA256 = require('crypto-js/sha256');

class Block {
  constructor(
    body, height = 0, previousBlockHash = '', time = '', hash = '') {
    this.body = body;
    this.height = height;
    this.previousBlockHash = previousBlockHash;
    this.time = time || moment().unix().toString();
    this.hash = hash || '';
  }

  getBlockHash() {
    return SHA256(JSON.stringify(this)).toString();
  }
}

module.exports = Block;
