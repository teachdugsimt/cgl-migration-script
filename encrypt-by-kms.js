require('dotenv').config();
const AWS = require('aws-sdk');
const cryptoRandomString = require('./crypto-random-string');

const kms = new AWS.KMS();

const kmsKey = process.env.KMS_MASTER_KEY;

const generatePassword = (length) => {
  return cryptoRandomString.default({ length: length, type: 'base64' });
};

const encryptByKms = async (source) => {
  const params = {
    KeyId: kmsKey,
    Plaintext: source,
  };
  const { CiphertextBlob } = await kms.encrypt(params).promise();
  return CiphertextBlob.toString('hex');
};

const run = async () => {
  const password = generatePassword(12);
  console.log(await encryptByKms(password));
};

run();
