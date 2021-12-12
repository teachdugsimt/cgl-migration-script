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
  const clientFrom = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_LEGACY,
    port: process.env.DB_PORT,
  });

  const clientTo = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'user_service',
    port: process.env.DB_PORT,
  });

  const connectFrom = await clientFrom.connect();
  const connectTo = await clientTo.connect();

  // CASE: ADMIN role_id = 1
  const { rows: userAdmin } = await connectFrom.query(`
    SELECT 
      u.id,
      u.email,
      u.phone_number,
    FROM
      user_profile u
    WHERE
      u.id IN (1,3,4);
  `);

  // CASE: role_id != null
  const { rows: userRoleNotNull } = await connectFrom.query(`
    SELECT u.id, u.phone_number, ur.role_id
    FROM user_profile u
      LEFT JOIN dtb_user_role ur ON ur.user_id = u.id
    WHERE
      ur.role_id IS NOT NULL
      AND u.phone_number IS NOT NULL
    ORDER BY phone_number;
  `);

  // CASE: role_id = null
  const { rows: userRoleNull } = await connectFrom.query(`
    SELECT 
      DISTINCT (u.phone_number),
      COUNT(id) AS count,
      ARRAY_AGG(u.id) AS ids
    FROM
      user_profile u
      LEFT JOIN dtb_user_role ur ON ur.user_id = u.id
    WHERE
      ur.role_id IS NULL
      AND u.phone_number IS NOT NULL
    GROUP BY
      u.phone_number;
  `);

  const userGrouped = _.mapValues(_.groupBy(userRoleNotNull, 'phone_number'), (clist) =>
    clist.map((user) => _.omit(user, 'phone_number'))
  );

  const userAdminWithId = [];
  const userRoleNotNullUnique = [];
  const userRoleNotNullUniqueWithId = [];
  const userRoleNullUniqueWithId = [];

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
      return {
        PutRequest: {
          Item: { ...item, password: passwordEncrypted },
        },
      };
    })
  );

  for (const key in userGrouped) {
    const dataWithKey = userGrouped[key];
    const password = generatePassword(12);
    let objectResult = {};
    if (dataWithKey.length > 1) {
      let objGrouped = {};
      for (const attr of dataWithKey) {
        if (attr.role_id === 2) {
          objGrouped.shipper = attr;
        } else if (attr.role_id === 3) {
          objGrouped.carrier = attr;
        } else {
          objGrouped.other = attr;
        }
      }

      if (objGrouped.carrier) {
        objectResult = {
          id: objGrouped.carrier.id,
          userId: hashids.encode(objGrouped.carrier.id),
          username: key,
          password: password,
        };
      } else if (objGrouped.shipper) {
        objectResult = {
          id: objGrouped.shipper.id,
          userId: hashids.encode(objGrouped.shipper.id),
          username: key,
          password: password,
        };
      } else {
        objectResult = {
          id: objGrouped.other.id,
          userId: hashids.encode(objGrouped.other.id),
          username: key,
          password: password,
        };
      }
    } else {
      objectResult = {
        id: dataWithKey[0].id,
        userId: hashids.encode(dataWithKey[0].id),
        username: key,
        password: password,
      };
    }

    userRoleNotNullUniqueWithId.push(objectResult);
    const newObjectResult = JSON.parse(JSON.stringify(objectResult));
    delete newObjectResult.id;
    delete newObjectResult.userId;
    newObjectResult.password = await encryptByKms(password);
    userRoleNotNullUnique.push({
      PutRequest: {
        Item: newObjectResult,
      },
    });
  }

  const userRoleNullUnique = await Promise.all(
    userRoleNull.map(async (user) => {
      let item = {};
      let id = null;
      const password = generatePassword(12);
      const passwordEncrypted = await encryptByKms(password);
      if (user.count > 1) {
        const { rows: userUnique } = await connectFrom.query(`
          SELECT
            DISTINCT(u.phone_number),
            u.id
          FROM
            user_profile u
            LEFT JOIN dtb_user_role ur ON ur.user_id = u.id
            LEFT JOIN dtb_order o ON o.shipper_id = u.id
            LEFT JOIN dtb_truck t ON t.carrier_id = u.id
          WHERE
            u.phone_number = '${user.phone_number}'
            AND (o.shipper_id IS NOT NULL OR t.carrier_id IS NOT NULL)
      `);
        if (userUnique.length) {
          id = userUnique[0].id;
          item.username = userUnique[0].phone_number;
          item.password = password;
        } else {
          id = user.ids[0];
          item.username = user.phone_number;
          item.password = password;
        }
      } else {
        id = user.ids[0];
        item.username = user.phone_number;
        item.password = password;
      }
      userRoleNullUniqueWithId.push({
        id: id,
        userId: hashids.encode(id),
        ...item,
      });
      return {
        PutRequest: {
          Item: { ...item, password: passwordEncrypted },
        },
      };
    })
  );

  const userIntoDynamo = [...userAdminData, ...userRoleNotNullUnique, ...userRoleNullUnique];
  const userIntoCognito = [...userAdminWithId, ...userRoleNotNullUniqueWithId, ...userRoleNullUniqueWithId];

  const userIntoDynamoUnique = _.uniqBy(userIntoDynamo, (e) => {
    return e.PutRequest.Item.username;
  });
  const userIntoCognitoUnique = _.uniqBy(userIntoCognito, 'username');

  const lengthOfUser = Math.floor(userIntoDynamoUnique.length / 24);

  const userIntoDynamoChunks = Array.from({ length: lengthOfUser }, (_) => []);
  userIntoDynamoUnique.forEach((value, index) => userIntoDynamoChunks[index % userIntoDynamoChunks.length].push(value));

  const userIntoCognitoChunks = Array.from({ length: lengthOfUser }, (_) => []);
  userIntoCognitoUnique.forEach((value, index) =>
    userIntoCognitoChunks[index % userIntoCognitoChunks.length].push(value)
  );

  // console.log('JSON.stringify(userIntoCognitoChunks) :>> ', JSON.stringify(userIntoCognitoChunks));

  await Promise.all(
    userIntoDynamoChunks.map(async (attr) => {
      return await bulkInsert(attr);
    })
  );

  let i = 0;
  let userIds = [];

  async function insertIntoCognito(data) {
    setTimeout(async () => {
      await Promise.all(
        data[i].map(async (user) => {
          userIds.push(user.id);
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
      console.log('userIds :>> ', userIds);
      await connectTo.query(`DELETE FROM user_profile WHERE id NOT IN (${userIds})`);

      const { rows: userJoinWithRole } = await connectTo.query(`SELECT
      DISTINCT (u.id),
        ARRAY_AGG(ur.role_id) AS roles
      FROM
        user_profile u
      LEFT JOIN dtb_user_role ur
      ON ur.user_id = u.id
      GROUP BY
        u.id;`);

      const newUserRole = userJoinWithRole.map((ur) => ({
        user_id: ur.id,
        role_id: ur.roles && ur.roles[0] && ur.roles[0] === 1 ? 1 : 4,
      }));

      const rowQueryUserRole = UserRoleActionModel.insert(newUserRole).toQuery();
      await connectTo.query(rowQueryUserRole);

      console.log('Finished!!');
    }, 1500);
  }

  await insertIntoCognito(userIntoCognitoChunks);

  // await new ObjectsToCsv(convertUserIntoCognitoToCSV).toDisk('./test.csv', { allColumns: true });
};

run();

'+66995613196',
  '+66805575655',
  '+66964260153',
  '+66924128883',
  '+66941198028',
  '+66926910336',
  '+66807568180',
  '+66650713829',
  '+66944659393',
  '+66889478959',
  '+66988243893',
  '+66933151280',
  '+66922699004',
  '+66951216161',
  '+66871448574',
  '+66956200191',
  '+66648134957',
  '+66988073303',
  '+66851600291',
  '+66955219997',
  '+66994921728',
  '+66965913250',
  '+66844733482',
  '+66987164713',
  '+66950281328',
  '+66879624082',
  '+66830400872',
  '+66828857871',
  '+66625362444',
  '+66988272389',
  '+66838146367',
  '+66908251966',
  '+66878514817',
  '+66819718820',
  '+66817229809',
  '+66927651912',
  '+66994953726',
  '+66963131345',
  '+66614138158',
  '+66895609074',
  '+66639804857',
  '+66616658024',
  '+66966890098',
  '+66640928008',
  '+66989479791',
  '+66860996855',
  '+66942512582',
  '+66833733251',
  '+66957042385',
  '+66876996094',
  '+66616514944',
  '+66632361884',
  '+66945679596',
  '+66867885713',
  '+66890783833',
  '+66901402042',
  '+66926130892',
  '+66622964259',
  '+66878819563',
  '+66825615477',
  '+66802126801',
  '+66614189329',
  '+66811948624',
  '+66809972106',
  '+66852097641',
  '+66882861429',
  '+66925644552',
  '+66871347058',
  '+66898953850',
  '+66951841469',
  '+66937740498',
  '+66982246416',
  '+66830407627',
  '+66850533065',
  '+66660734449',
  '+66957025796',
  '+66883612003',
  '+66847128690',
  '+66656493988',
  '+66814022760',
  '+66955523272',
  '+66932835224',
  '+66968549777',
  '+66615562553',
  '+66929284201',
  '+66635936708',
  '+66988135930',
  '+66927081513',
  '+66858360307',
  '+66910299871',
  '+66903682285',
  '+66970360109',
  '+66614346596',
  '+66614105517',
  '+66856072016',
  '+66930364902',
  '+66655477435',
  '+66875838171',
  '+66649319914',
  '+66922959613',
  '+66817227604',
  '+66636298959',
  '+66989070860',
  '+66927143090',
  '+66927865258',
  '+66917384381',
  '+66927597712',
  '+66613059636',
  '+66969783217',
  '+66905135690',
  '+66631743475',
  '+66648752848',
  '+66613943977',
  '+66633926236',
  '+66915392222',
  '+66929818252',
  '+66938642371',
  '+66801619675',
  '+66904636599',
  '+66615453916',
  '+66936411144',
  '+66853207432',
  '+66928842018',
  '+66657133839',
  '+66861110674',
  '+66907789886',
  '+66987432390',
  '+66819861281',
  '+66652626440',
  '+66922768311',
  '+66842392783',
  '+66955036320',
  '+66856891511',
  '+66958566538',
  '+66848945522',
  '+66870330822',
  '+66655783329',
  '+66623640161',
  '+66808047698',
  '+66954463468',
  '+66610524757',
  '+66891782569',
  '+66917513216',
  '+66961464737',
  '+66980271486',
  '+66927573366',
  '+66932703647',
  '+66845582898';
