require('dotenv').config();
const { Pool } = require('pg');

const sqlCreateUserTypeEnum = `CREATE TYPE enum_user_type AS ENUM ('SHIPPER', 'CARRIER', 'BOTH');`;

const sqlDropColumnUserType = `ALTER TABLE user_profile DROP COLUMN user_type;`;

const sqlAddNewUserTypeWithEnum = `ALTER TABLE user_profile ADD user_type enum_user_type;`;

const sqlAddAttachCodeCitizenId = `ALTER TABLE user_profile ADD attach_code_citizen_id VARCHAR(255);`;

// nonprod = dtb_term_of_service_seq
// preprod = term_of_service_id_seq
// prod = term_of_service_id_seq
const sqlUpdateMaxSeqToS = `SELECT setval('term_of_service_id_seq', (SELECT MAX(id) FROM term_of_service));`;

const sqlAddNewTypeIntoTermOfService = `ALTER TABLE term_of_service ADD type VARCHAR(20)`;

const sqlCreateTermOfServicePartner = `INSERT INTO term_of_service (version_number, data, is_active, version, created_user, is_deleted, type)
VALUES ('0.0.1', '<p>Hello world</p>', TRUE, 0, 'system', FALSE, 'PARTNER');`;

const run = async () => {
  const client = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'user_service',
    port: process.env.DB_PORT,
  });

  const connect = await client.connect();

  await connect.query(sqlCreateUserTypeEnum);
  await connect.query(sqlDropColumnUserType);
  await connect.query(sqlAddNewUserTypeWithEnum);
  await connect.query(sqlAddAttachCodeCitizenId);
  await connect.query(sqlUpdateMaxSeqToS);
  await connect.query(sqlAddNewTypeIntoTermOfService);
  await connect.query(sqlCreateTermOfServicePartner);

  console.log('Finished !!');
};

run();
