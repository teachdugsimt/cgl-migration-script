require('dotenv').config();
const { Pool } = require('pg');
const sql = require('sql');
const cryptoRandomString = require('./crypto-random-string');

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

const sqlSequence = `SELECT t.oid::regclass AS table_name,
  a.attname AS column_name,
  s.relname AS sequence_name
FROM pg_class AS t
JOIN pg_attribute AS a
  ON a.attrelid = t.oid
JOIN pg_depend AS d
  ON d.refobjid = t.oid
AND d.refobjsubid = a.attnum
JOIN pg_class AS s
  ON s.oid = d.objid
WHERE d.classid = 'pg_catalog.pg_class'::regclass
  AND d.refclassid = 'pg_catalog.pg_class'::regclass
  AND t.relkind IN ('r', 'P')
  AND s.relkind = 'S'`;

const sqlCreateNewTblUserProfile = `CREATE TABLE user_profile (
	id bigserial,
	confirmation_token VARCHAR(100),
	email VARCHAR(100),
	phone_number VARCHAR(20),
	fullname VARCHAR (120),
	enabled BOOLEAN DEFAULT TRUE,
	user_type SMALLINT,
	avatar VARCHAR(255),
	device_token VARCHAR(255),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	created_by VARCHAR (120),
	updated_by VARCHAR (120)
);`;

const sqlCreateNewTblAddress = `CREATE TABLE address (
	id bigserial,
	user_id INTEGER NOT NULL,
	phone_number_contact VARCHAR(20),
	address_no VARCHAR (20),
	moo VARCHAR (3),
	soi VARCHAR (50),
	road VARCHAR (30),
	district_province_id VARCHAR (6),
	zip_code VARCHAR (5),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	created_by VARCHAR (120),
	updated_by VARCHAR (120)
);`;

const sqlCreateNewTblUserRole = `CREATE TABLE user_role (
	id bigserial,
	user_id INTEGER,
	role_id INTEGER
);`;

const sqlCreateNewTblRole = `CREATE TABLE role (
  id bigserial,
  fullname varchar(255),
  name varchar(255),
  version int4 NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	created_by VARCHAR (120),
	updated_by VARCHAR (120),
  is_deleted bool NOT NULL DEFAULT false
);`;

const sqlInsertRole = `INSERT INTO role(fullname, name, version, created_by)
VALUES ('Admin', 'ROLE_ADMIN', 0, 'system'),
('Customer Service', 'ROLE_CUSTOMER_SERVICE', 0, 'system'),
('Driver', 'ROLE_DRIVER', 0, 'system'),
('Member', 'ROLE_MEMBER', 0, 'system');`;

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

  await connectTo.query(sqlCreateNewTblUserProfile);
  await connectTo.query(sqlCreateNewTblAddress);
  await connectTo.query(sqlCreateNewTblUserRole);
  await connectTo.query(sqlCreateNewTblRole);
  await connectTo.query(sqlInsertRole);

  const { rows: dtbUser } = await connectFrom.query(`
    SELECT * FROM dtb_user ORDER BY id;
  `);

  // const { rows: dtbUserRole } = await connectTo.query(`
  //   SELECT DISTINCT(user_id), ARRAY_AGG(role_id) AS roles FROM dtb_user_role GROUP BY user_id;
  // `);

  const newUser = dtbUser.map((user) => {
    const confirmationToken = cryptoRandomString.default({ length: 64, type: 'alphanumeric' });
    return {
      id: user.id,
      confirmation_token: confirmationToken,
      email: user.email,
      phone_number: user.phone_number,
      fullname: user.fullname,
      enabled: user.enabled,
      user_type: user.user_type,
      avatar: user.avatar,
      device_token: user.device_token,
      created_by: 'system',
    };
  });

  // const newUserRole = dtbUserRole.map((ur) => ({
  //   user_id: ur.user_id,
  //   role_id: ur.roles[0] === 1 ? 1 : 4,
  // }));

  const rowQueryUser = UserProfileModel.insert(newUser).toQuery();
  await connectTo.query(rowQueryUser);

  // const rowQueryUserRole = UserRoleActionModel.insert(newUserRole).toQuery();
  // await connectTo.query(rowQueryUserRole);

  const dbSchema = await connectTo.query(sqlSequence);
  await Promise.all(
    dbSchema.rows.map(async (schema) => {
      await connectTo.query(
        `SELECT setval('${schema.sequence_name}', (SELECT MAX("${schema.column_name}") FROM "${schema.table_name}"))`
      );
    })
  );

  console.log('Finished!!');

  return true;
};

run();

/*
typeorm-model-generator -h cgl-dev-db.ccyrpfjhgi1v.ap-southeast-1.rds.amazonaws.com -d user_service -p 5432 -u postgres -x "\".9^Piv-.KlzZhZm.MU7vXZU7yE9I-4\"" -e postgres -o . -s public

eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJhdF9oYXNoIjoiUFlCOGliM3BjR3ZZRGl1WmhTZkRpdyIsInN1YiI6IjUzOTMwMzE1LTJjZTQtNGE1My05NjAwLTdhMjQ3Mzc4MDQzZSIsImNvZ25pdG86Z3JvdXBzIjpbImNnbC1zMy1yZWFkLW9ubHkiXSwiZW1haWxfdmVyaWZpZWQiOnRydWUsInJvbGVzIjoiQWRtaW58RHJpdmVyIiwiY29nbml0bzpwcmVmZXJyZWRfcm9sZSI6ImFybjphd3M6aWFtOjo5MTE1OTc0OTM1Nzc6cm9sZS9jZ2wtczMtcmVhZC1vbmx5LXRlc3QiLCJpc3MiOiJodHRwczovL2NvZ25pdG8taWRwLmFwLXNvdXRoZWFzdC0xLmFtYXpvbmF3cy5jb20vYXAtc291dGhlYXN0LTFfeXVTS1RZS3dNIiwiY29nbml0bzp1c2VybmFtZSI6InVzZXIwMDEiLCJ1c2VySWQiOiIxN0VaUTBaMU0iLCJjb2duaXRvOnJvbGVzIjpbImFybjphd3M6aWFtOjo5MTE1OTc0OTM1Nzc6cm9sZS9jZ2wtczMtcmVhZC1vbmx5LXRlc3QiXSwiYXVkIjoiMzIxZmRxbmExZzBzMzE5MG5rZGU0ajRxaWYiLCJldmVudF9pZCI6Ijk4YmE0OWIwLTc3M2UtNGNiZi1hMWVlLWMwZDFmNmVkZDgwZSIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNjIzMzk1OTAzLCJleHAiOm51bGwsImlhdCI6MTYyMzM5NTkwM30.yV3HTdjM_qEOvDAqRFa81oJq6igsYOtJ3jc47AwjRUlGSoKuCWOKzHSYt2Dve6z01_Z9xSITWMk4Nyw5ERtEDg

admin
customer service
driver
member

1. move-dtb_user-to-user_profile
2. clear-dummy-user
3. backup-user-id
4. clear-duplicate-user
5. initial-user
6. initial-resource-action
// [fisrt run only dev] initial-sub-district [run ครั้งเดียวตอน dev ที่เหลือใช้ clone จากข้อ 7]
// [fisrt run only dev] update-district-name [run ครั้งเดียวตอน dev ที่เหลือใช้ clone จากข้อ 7]
7. clone-master-data
8. create-new-user-by-command
9. add-column-status-to-user [option]
10. add-column-user-doc
11. move-dtb-job
12. add-full-text-search-and-view-list-job
// run booking service ของ Art
13. replace-view-job
14. move-dtb-favorite-job
15. move-dtb-history
16. update-job-status
17. update-shipment-status
18. update-user-id-into-job
19. update-user-id-into-shipment
20. update-user-id-into-favorite-job
21. update-user-id-into-job-history-call
22. update-user-id-into-truck-history-call
23. alter-column-public-as-cgl-into-job
24. replace-view-job-with-public-as-clg
25. add-term-of-service

*/
