require('dotenv').config();
const { Pool } = require('pg');

const run = async () => {
  const clientFrom = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'booking_service',
    port: process.env.DB_PORT,
  });

  const connectFrom = await clientFrom.connect();

  // bank account
  await connectFrom.query(`ALTER TABLE trip ADD weight_start numeric`);
  await connectFrom.query(`ALTER TABLE trip ADD weight_end numeric`);

  clientFrom.end();
  console.log('Finished');
  return true;
};

run();
