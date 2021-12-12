require('dotenv').config();
const { Pool } = require('pg');

const sqlSetUniquePhoneNumber =
  'ALTER TABLE user_profile ADD CONSTRAINT constraint_phone_number UNIQUE (phone_number);';

const run = async () => {
  const client = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'user_service',
    port: process.env.DB_PORT,
  });

  const connect = await client.connect();

  await connect.query(sqlSetUniquePhoneNumber);

  console.log('Finished !!');
};

run();
