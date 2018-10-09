const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');

const keyPair = bitcoin.ECPair.fromWIF('Kxr9tQED9H44gCmp6HAdmemAzU3n84H3dGkuWTKvE23JgHMW8gct'); //valid
// const keyPair = bitcoin.ECPair.fromWIF('5HueCGU8rMjxEXxiPuD5BDku4MkFqeZyd4dZ1jvhTVqvbTLvyTJ'); //invalid

const privateKey = keyPair.d.toBuffer(32)
const address = '19AAjaTUbRjQCMuVczepkoPswiZRhjtg31'

# Update timestamp to match timestamp received from API
const message = '19AAjaTUbRjQCMuVczepkoPswiZRhjtg31:1539113592:starRegistry';
const signature = bitcoinMessage.sign(message, privateKey, keyPair.compressed)

console.log(signature.toString('base64'))
console.log(bitcoinMessage.verify(message, address, signature))
