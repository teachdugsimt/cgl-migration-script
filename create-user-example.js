const AWS = require('aws-sdk');
const Hashids = require('hashids/cjs');
const { Pool } = require('pg');
const cryptoRandomString = require('./crypto-random-string');
const sql = require('sql');

const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
const documentClient = new AWS.DynamoDB.DocumentClient();
const kms = new AWS.KMS();
const hashids = new Hashids('secretkeyforcargolinkproject', 8, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890');

const UserPoolId = process.env.USER_POOL_ID;
const ClientApp = process.env.APP_CLIENT;
const kmsKey = 'arn:aws:kms:ap-southeast-1:029707422715:key/f3f1a976-a2f4-4fb0-a4db-a7d0cbd59f4b';

const UserProfileModel = sql.define({
  name: 'user_profile',
  columns: [
    'id',
    'confirmation_token',
    'email',
    'phone_number',
    'fullname',
    'enabled',
    'user_type',
    'avatar',
    'device_token',
    'created_at',
    'updated_at',
    'created_by',
    'updated_by',
  ],
});

const UserRoleActionModel = sql.define({
  name: 'user_role',
  columns: ['id', 'user_id', 'role_id'],
});

const createUser = async (username, password, userId) => {
  const params = {
    UserPoolId: UserPoolId,
    Username: username,
    TemporaryPassword: password,
    MessageAction: 'SUPPRESS',
    UserAttributes: [
      {
        Name: 'custom:userId',
        Value: userId,
      },
    ],
  };
  return cognitoidentityserviceprovider.adminCreateUser(params).promise();
};

const setUserPassword = async (username, password) => {
  const params = {
    UserPoolId: UserPoolId,
    Username: username,
    Password: password,
    Permanent: true,
  };
  return cognitoidentityserviceprovider.adminSetUserPassword(params).promise();
};

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

const createUserIntoDynamo = async (username, password) => {
  const params = {
    TableName: 'user_service',
    Item: {
      username,
      password,
    },
  };

  return documentClient.put(params).promise();
};

const run = async (username, phoneNumber, name) => {
  const client = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'user_service',
    port: process.env.DB_PORT,
  });

  const connect = await client.connect();

  // const username = 'kittichai.s@infiltech.org';
  const password = generatePassword(12);

  const myUser = [
    {
      confirmation_token: cryptoRandomString.default({ length: 64, type: 'alphanumeric' }),
      email: username,
      phone_number: phoneNumber,
      fullname: name,
      created_by: 'system',
    },
  ];

  const rowQueryUser = UserProfileModel.insert(myUser).toQuery();
  await connect.query(rowQueryUser);

  const { rows: seq } = await connect.query('SELECT last_value FROM user_profile_id_seq;');
  const userId = +seq[0].last_value;

  const myRole = [
    {
      user_id: userId,
      role_id: 1,
    },
  ];

  const rowQueryUserRole = UserRoleActionModel.insert(myRole).toQuery();
  await connect.query(rowQueryUserRole);

  await createUserIntoDynamo(username, password);

  await createUser(username, password, hashids.encode(userId));
  await setUserPassword(username, password);

  console.log('Finished!!');

  return true;
};

run('admin.test@cargolink.co.th', '+0822222222', 'Admin Test');
