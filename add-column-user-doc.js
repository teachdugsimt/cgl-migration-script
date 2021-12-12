require('dotenv').config();
const { Pool } = require('pg');

const sqlForAlterStatus = `ALTER TABLE user_profile
ADD document jsonb DEFAULT NULL`;

const run = async () => {
  const client = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'user_service',
    port: process.env.DB_PORT,
  });

  const connect = await client.connect();

  await connect.query(sqlForAlterStatus);

  console.log('Finished !!');
};

run();
