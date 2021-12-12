require('dotenv').config();
const { Pool } = require('pg');

const sqlSelectBackupUserId = `SELECT current_user_id, user_ids FROM backup_user_id;`;

const run = async () => {
  const clientUserService = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'user_service',
    port: process.env.DB_PORT,
  });
  const clientJobService = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'job_service',
    port: process.env.DB_PORT,
  });

  const connectUserService = await clientUserService.connect();
  const connectJobService = await clientJobService.connect();

  const { rows: backupUserId } = await connectUserService.query(sqlSelectBackupUserId);

  // update shipment created_user
  for (const attr of backupUserId) {
    await connectJobService.query(`UPDATE shipment
    SET created_user = '${attr.current_user_id}'
    WHERE created_user = ANY(ARRAY[${attr.user_ids}]::VARCHAR[])`);
  }

  // update shipment updated_user
  for (const attr of backupUserId) {
    await connectJobService.query(`UPDATE shipment
    SET updated_user = '${attr.current_user_id}'
    WHERE updated_user = ANY(ARRAY[${attr.user_ids}]::VARCHAR[])`);
  }

  console.log('Finished');
  return true;
};

run();
