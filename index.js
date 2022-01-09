'use-strict';

const { encode, decode, hexTo8Bit } = require('./des');

const key = '13345FF2137CDFF1';
const text = '00000000000000EF';

console.log(`Key: ${key}`);
console.log(`Text: ${text}`);

console.log();

console.log('Encryption:\n');

const enc = encode(hexTo8Bit(text), hexTo8Bit(key));

console.log(`Cipher text: ${enc}\n`);

console.log('Decryption:\n');
console.log(`Plain text: ${decode(hexTo8Bit(enc), hexTo8Bit(key))}`);
