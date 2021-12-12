require('dotenv').config();
const AWS = require('aws-sdk');
const Hashids = require('hashids/cjs');
const { Pool } = require('pg');
const cryptoRandomString = require('./crypto-random-string');
const _ = require('lodash');
const sql = require('sql');

const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
const documentClient = new AWS.DynamoDB.DocumentClient();
const kms = new AWS.KMS();
const hashids = new Hashids('secretkeyforcargolinkproject', 8, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890');

const UserPoolId = process.env.USER_POOL_ID;
const ClientApp = process.env.APP_CLIENT;
const kmsKey = process.env.KMS_MASTER_KEY;

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

const bulkInsert = async (data) => {
  const params = {
    RequestItems: {
      cgl_user: data,
    },
  };
  return documentClient.batchWrite(params).promise();
};

const run = async () => {
  const clientTo = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'user_service',
    port: process.env.DB_PORT,
  });

  const connectTo = await clientTo.connect();

  // CASE: ADMIN role_id = 1
  const { rows: userAdmin } = await connectTo.query(`
    SELECT 
      u.id,
      u.email,
      u.phone_number
    FROM
      user_profile u
    WHERE
      u.id IN (1,3,4)
    ORDER BY u.id;
  `);

  // CASE: role_id != null
  const { rows: userMember } = await connectTo.query(`
    SELECT 
      u.id,
      u.email,
      u.phone_number
    FROM
      user_profile u
    WHERE
      u.id NOT IN (1,3,4)
    ORDER BY u.id;
  `);

  const userAdminWithId = [];
  const userMemberWithId = [];
  const userWithRole = [];

  const userAdminData = await Promise.all(
    userAdmin.map(async (admin) => {
      const password = generatePassword(12);
      const passwordEncrypted = await encryptByKms(password);
      const item = {
        username: admin.email,
        password: password,
        ...(admin.email === 'tmg@gmail.com' ? { phoneNumber: '+66811111112' } : undefined),
      };
      userAdminWithId.push({
        id: admin.id,
        userId: hashids.encode(admin.id),
        ...item,
      });
      userWithRole.push({
        user_id: +admin.id,
        role_id: 1,
      });
      return {
        PutRequest: {
          Item: { ...item, password: passwordEncrypted },
        },
      };
    })
  );

  const userMemberData = await Promise.all(
    userMember.map(async (member) => {
      const password = generatePassword(12);
      const passwordEncrypted = await encryptByKms(password);
      const item = {
        username: member.phone_number,
        password: password,
      };
      userMemberWithId.push({
        id: member.id,
        userId: hashids.encode(member.id),
        ...item,
      });
      userWithRole.push({
        user_id: +member.id,
        role_id: 4,
      });
      return {
        PutRequest: {
          Item: { ...item, password: passwordEncrypted },
        },
      };
    })
  );

  const userIntoDynamo = [...userAdminData, ...userMemberData];
  const userIntoCognito = [...userAdminWithId, ...userMemberWithId];

  const lengthOfUser = Math.floor(userIntoDynamo.length / 24);

  const userIntoDynamoChunks = Array.from({ length: lengthOfUser }, (_) => []);
  userIntoDynamo.forEach((value, index) => userIntoDynamoChunks[index % userIntoDynamoChunks.length].push(value));

  const userIntoCognitoChunks = Array.from({ length: lengthOfUser }, (_) => []);
  userIntoCognito.forEach((value, index) => userIntoCognitoChunks[index % userIntoCognitoChunks.length].push(value));

  // console.log('JSON.stringify(userIntoDynamoChunks) :>> ', JSON.stringify(userIntoDynamoChunks));
  // console.log('JSON.stringify(userIntoCognitoChunks) :>> ', JSON.stringify(userIntoCognitoChunks));

  await Promise.all(
    // userIntoDynamoChunks.map(async (attr) => {
    //   return bulkInsert(attr);
    // })

    userIntoDynamoChunks.map(async (attr, index) => {
      setTimeout(async () => {
        console.log('attr.length :>> ', attr.length);
        console.log('index :>> ', index);
        return await bulkInsert(attr);
      }, 1000 * index);
    })
  );

  let i = 0;

  async function insertIntoCognito(data) {
    setTimeout(async () => {
      await Promise.all(
        data[i].map(async (user) => {
          await createUser(user.username, user.password, user.userId);
          await setUserPassword(user.username, user.password);
          return true;
        })
      );
      console.log('loop count :>>', i);
      i++;
      if (i < data.length) {
        return insertIntoCognito(data);
      }
      console.log('loop end');

      const rowQueryUserRole = UserRoleActionModel.insert(userWithRole).toQuery();
      await connectTo.query(rowQueryUserRole);

      console.log('Finished!!');
    }, 2000);
  }

  await insertIntoCognito(userIntoCognitoChunks);

  // await new ObjectsToCsv(convertUserIntoCognitoToCSV).toDisk('./test.csv', { allColumns: true });
};

run();
