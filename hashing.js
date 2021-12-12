const Hashids = require('hashids/cjs');
const crypto = require('crypto');
const hashids = new Hashids('secretkeyforcargolinkproject', 8, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890');

const id = hashids.encode(635);

console.log('Encode :>> ', id);

// console.log('Decode :>> ', hashids.decode('RZDRR0KX'));
// console.log('Decode :>> ', hashids.decode('EZQWG0Z1'));
// console.log('Decode :>> ', hashids.decode('K8MQ490K'));
console.log('Decode :>> ', hashids.decode('DLGRENZX'));
console.log('Decode :>> ', hashids.decode('15Z3XLPG'));

console.log(hashids.encode(21));
console.log(hashids.encode(505));
// console.log(hashids.encode(3));
// console.log(hashids.encode(4));
// console.log(hashids.encode(611));
// console.log(hashids.encode(652));
// console.log(hashids.encode(582));
// console.log(hashids.encode(656));
// console.log(hashids.encode([1, 651]));

// const name = 'braitsch';
// const hash = crypto.createHash('SHA256').update(name).digest('hex');
// console.log(hash);

// const ciphers = crypto.getHashes();
// // console.log('ciphers :>> ', crypto.getHashes());
// ciphers.map((alg) => {
//   console.log(crypto.createHash(alg).update(name).digest('hex'));
// });
