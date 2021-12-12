require('dotenv').config();
const { Pool } = require('pg');
const sql = require('sql');

const sqlForCreateStatusEnum = `CREATE TYPE enum_user_status AS ENUM ('ACTIVE', 'INACTIVE');`;

const sqlForCreateDocStatusEnum = `CREATE TYPE enum_user_document_status AS ENUM ('NO_DOCUMENT', 'WAIT_FOR_VERIFIED', 'VERIFIED', 'REJECTED');`;

const sqlForCreateLegalTypeEnum = `CREATE TYPE enum_legal_type AS ENUM ('INDIVIDUAL', 'JURISTIC');`;

const sqlForAlterStatus = `ALTER TABLE user_profile
ADD status enum_user_status NOT NULL DEFAULT 'ACTIVE'`;

const sqlForAlterDocStatus = `ALTER TABLE user_profile
ADD document_status enum_user_document_status NOT NULL DEFAULT 'NO_DOCUMENT'`;

const sqlForAlterLegalType = `ALTER TABLE user_profile
ADD legal_type enum_legal_type NOT NULL DEFAULT 'INDIVIDUAL'`;

const run = async () => {
  const client = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'user_service',
    port: process.env.DB_PORT,
  });

  const connect = await client.connect();

  await connect.query(sqlForCreateStatusEnum);
  await connect.query(sqlForCreateDocStatusEnum);
  await connect.query(sqlForAlterStatus);
  await connect.query(sqlForAlterDocStatus);
  await connect.query(sqlForCreateLegalTypeEnum);
  await connect.query(sqlForAlterLegalType);

  console.log('Finished !!');
};

run();
