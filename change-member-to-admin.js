require('dotenv').config();
const AWS = require('aws-sdk');
const { Pool } = require('pg');
const Hashids = require('hashids/cjs');
const cryptoRandomString = require('./crypto-random-string');

const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
const documentClient = new AWS.DynamoDB.DocumentClient();

const hashids = new Hashids('secretkeyforcargolinkproject', 8, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890');

const createNewUserIntoDynamo = async (originalUsername, newUsername, password) => {
  const params = {
    TableName: 'cgl_user',
    Key: {
      username: originalUsername,
    },
  };
  const { Item: userDetailBackup } = await documentClient.get(params).promise();
  if (userDetailBackup) {
    await documentClient.delete(params).promise();
    const newUser = {
      TableName: 'cgl_user',
      Item: {
        // ...userDetailBackup,
        username: newUsername,
        password: password,
        phoneNumber: originalUsername,
      },
    };
    return documentClient.put(newUser).promise();
  }
  throw new Error('User not found');
};

const createUser = async (username, password, userId) => {
  const params = {
    UserPoolId: process.env.USER_POOL_ID,
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
    UserPoolId: process.env.USER_POOL_ID,
    Username: username,
    Password: password,
    Permanent: true,
  };
  return cognitoidentityserviceprovider.adminSetUserPassword(params).promise();
};

const deleteUser = async (username) => {
  const paramsForDeleteUser = {
    UserPoolId: process.env.USER_POOL_ID,
    Username: username,
  };
  await cognitoidentityserviceprovider.adminDeleteUser(paramsForDeleteUser).promise();
};

const createNewUserIntoCognito = async (userId, phoneNumber, email, password) => {
  await deleteUser(phoneNumber);
  await createUser(email, password, userId);
  await setUserPassword(email, password);
};

const generatePassword = (length) => {
  return cryptoRandomString.default({ length: length, type: 'base64' });
};

const run = async (originalUsername, newUsername) => {
  const client = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'user_service',
    port: process.env.DB_PORT,
  });

  const connect = await client.connect();

  const { rows: user } = await connect.query(
    `SELECT id FROM user_profile WHERE phone_number = '${originalUsername}' LIMIT 1;`
  );

  const password = generatePassword(12);

  await createNewUserIntoDynamo(originalUsername, newUsername, password);
  await createNewUserIntoCognito(hashids.encode(user[0].id), originalUsername, newUsername, password);

  await connect.query(`INSERT INTO user_role(user_id, role_id) VALUES(${user[0].id}, 1)`);
  await connect.query(`UPDATE user_profile SET email = '${newUsername}' WHERE phone_number = '${originalUsername}'`);

  console.log('Finished !!');
  return true;
};

run('+66955947304', 'chayada.e@cargolink.co.th');

// 1452
// +66944659393
// 0102020078df3d01bbb3673c83f5369ebc15f97c85faff208b12f68c3bc6801e1415a1cd9901d6f8c263cda1699c80c492462736066a0000006a306806092a864886f70d010706a05b3059020100305406092a864886f70d010701301e060960864801650304012e3011040c1f4d42d3e799c7bac4812bbe02011080270afe08f336157707b0034e7485070d03483b33ba52f82d352e30bd4f997c208c5cc0ff7de0c867
