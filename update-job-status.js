require('dotenv').config();
const { Pool } = require('pg');
const sql = require('sql');

const host = process.env.DB_HOST;
const pgPassword = process.env.DB_PASSWORD;

const sqlForCreateStatusEnum = `CREATE TYPE enum_job_status AS ENUM ('NEW', 'INPROGRESS', 'CANCELLED', 'DONE', 'EXPIRED');`;

const sqlAddTemporaryStatus = `ALTER TABLE job ADD COLUMN temp_status enum_job_status DEFAULT 'NEW'`;

const sqlUpdateStatusNew = `UPDATE job SET temp_status = 'NEW' WHERE status IN (0, 1) AND valid_until > CURRENT_TIMESTAMP`;

const sqlUpdateStatusInprogrress = `UPDATE job SET temp_status = 'INPROGRESS' WHERE status IN (3) AND valid_until > CURRENT_TIMESTAMP`;

const sqlUpdateStatusCancel = `UPDATE job SET temp_status = 'CANCELLED' WHERE status IN (8)`;

const sqlUpdateStatusDone = `UPDATE job SET temp_status = 'DONE' WHERE status IN (7)`;

const sqlUpdateStatusExpired = `UPDATE job SET temp_status = 'EXPIRED' WHERE status IN (2) OR (status = 1 AND valid_until < CURRENT_TIMESTAMP)`;

const sqlUpdateStatusNewWithDocumentStatus = `UPDATE job SET temp_status = 'NEW' WHERE loading_datetime > CURRENT_DATE AND status NOT IN (7, 8);`;

const sqlUpdateStatusInprogressWithDocumentStatus = `UPDATE job AS j
SET temp_status = 'INPROGRESS'
WHERE j.loading_datetime < CURRENT_DATE
AND CURRENT_DATE <= (SELECT MAX(delivery_datetime) FROM shipment WHERE job_id = j.id GROUP BY job_id) AND status NOT IN (7, 8);`;

const sqlUpdateStatusExpireWithDocumentStatus = `UPDATE job AS j 
SET temp_status = 'EXPIRED'
WHERE loading_datetime < CURRENT_DATE AND status NOT IN (7, 8);`;

const sqlUpdateStatusExpireWithDocumentStatus2 = `UPDATE job AS j 
SET temp_status = 'EXPIRED'
WHERE CURRENT_DATE >= (SELECT MAX(delivery_datetime)
FROM shipment WHERE job_id = j.id GROUP BY job_id)
AND status NOT IN (2, 7, 8);`;

const sqlUpdateStatusExpireForDatetimeNull = `UPDATE job SET temp_status = 'EXPIRED' WHERE valid_until IS NULL OR loading_datetime IS NULL`;

const sqlDropColumnStatus = `ALTER TABLE job RENAME COLUMN status to temp_status_backup`;

const sqlDropNullStatus = `ALTER TABLE job ALTER COLUMN temp_status_backup DROP NOT NULL`;

const sqlRenameColumnStatus = `ALTER TABLE job RENAME COLUMN temp_status TO status`;

const sqlAlterJobReason = `ALTER TABLE job ADD COLUMN reason VARCHAR(255);`;

// 4, 9, 12, 15, 17, 20, 21, 23, 10, 11, 14, 22, 24

// status: NEW -> 1
// status: INPROGRESS -> 3, 4, 9, 12, 15, 17, 20, 21, 23
// status: CANCELLED -> 8, 10, 11, 14
// status: DONE -> 7
// status: EXPIRED -> 0, 2, 22, 24

// const jobStatus = [1, 2, 3, 4, 7, 9, 17, 20, 21, 23];

const run = async () => {
  const clientTo = new Pool({
    host: host,
    user: process.env.DB_USERNAME,
    password: pgPassword,
    database: 'job_service',
    port: process.env.DB_PORT,
  });

  const connectTo = await clientTo.connect();

  await connectTo.query(sqlForCreateStatusEnum);
  await connectTo.query(sqlAddTemporaryStatus);
  await connectTo.query(sqlUpdateStatusNew);
  await connectTo.query(sqlUpdateStatusInprogrress);
  await connectTo.query(sqlUpdateStatusCancel);
  await connectTo.query(sqlUpdateStatusDone);
  await connectTo.query(sqlUpdateStatusExpired);

  await connectTo.query(sqlUpdateStatusNewWithDocumentStatus);
  await connectTo.query(sqlUpdateStatusInprogressWithDocumentStatus);
  await connectTo.query(sqlUpdateStatusExpireWithDocumentStatus);
  await connectTo.query(sqlUpdateStatusExpireWithDocumentStatus2);
  await connectTo.query(sqlUpdateStatusExpireForDatetimeNull);

  await connectTo.query(sqlDropColumnStatus);
  await connectTo.query(sqlDropNullStatus);
  await connectTo.query(sqlRenameColumnStatus);
  await connectTo.query(sqlAlterJobReason);

  console.log('Finished');
  return true;
};

run();
