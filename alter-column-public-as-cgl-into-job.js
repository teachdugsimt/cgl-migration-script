require('dotenv').config();
const { Pool } = require('pg');

const host = process.env.DB_HOST;
const pgPassword = process.env.DB_PASSWORD;

const sqlAddTemporaryStatus = `ALTER TABLE job ADD COLUMN public_as_cgl BOOLEAN NOT NULL DEFAULT false`;

const run = async () => {
  const clientTo = new Pool({
    host: host,
    user: process.env.DB_USERNAME,
    password: pgPassword,
    database: 'job_service',
    port: process.env.DB_PORT,
  });

  const connectTo = await clientTo.connect();

  await connectTo.query(sqlAddTemporaryStatus);

  console.log('Finished');
  return true;
};

run();
