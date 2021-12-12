require('dotenv').config();
const mmtz = require('moment-timezone');
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

  await connectFrom.query('ALTER TABLE trip ALTER COLUMN booking_id DROP NOT NULL;');

  await connectFrom.query(`ALTER TABLE trip ADD start_date DATE`);

  console.log('Finished !!');
};

run();
