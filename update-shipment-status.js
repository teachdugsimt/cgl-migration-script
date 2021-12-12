require('dotenv').config();
const { Pool } = require('pg');

const host = process.env.DB_HOST;
const pgPassword = process.env.DB_PASSWORD;

const sqlAddTemporaryStatus = `ALTER TABLE shipment ADD COLUMN temp_status enum_job_status DEFAULT 'NEW'`;

const sqlUpdateStatusNew = `UPDATE shipment SET temp_status = 'NEW'`;

const sqlDropColumnStatus = `ALTER TABLE shipment RENAME COLUMN status to temp_status_backup`;

const sqlDropNullStatus = `ALTER TABLE shipment ALTER COLUMN temp_status_backup DROP NOT NULL`;

const sqlRenameColumnStatus = `ALTER TABLE shipment RENAME COLUMN temp_status TO status`;

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
  await connectTo.query(sqlUpdateStatusNew);
  await connectTo.query(sqlDropColumnStatus);
  await connectTo.query(sqlDropNullStatus);
  await connectTo.query(sqlRenameColumnStatus);

  console.log('Finished');
  return true;
};

run();
