const NodeRSA = require('node-rsa');
const fs = require('fs');
// const key = new NodeRSA({b: 512});
const key = new NodeRSA().generateKeyPair();

const publicKey = key.exportKey('pkcs1-public-pem');
const privateKey = key.exportKey('pkcs1-private-pem');

const text = JSON.stringify({
    'firstName': 'Ayodeji',
    'lastName': 'Akinola',
});

const encrypted = key.encrypt(text, 'base64');
console.log('encrypted: ', encrypted);
const decrypted = key.decrypt(encrypted, 'utf8');
console.log('decrypted: ', JSON.parse(decrypted));


// write public key
fs.openSync('keys/public.pem', 'w');
fs.writeFileSync('keys/public.pem', publicKey, 'utf8');


// write public key
fs.openSync('keys/private.pem', 'w');
fs.writeFileSync('keys/private.pem', privateKey, 'utf8');


// var crypto = require("crypto");
// var address = crypto.randomBytes(20).toString('hex');

// console.log(address);