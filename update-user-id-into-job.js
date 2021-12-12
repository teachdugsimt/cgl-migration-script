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

  // update job user_id
  for (const attr of backupUserId) {
    await connectJobService.query(`UPDATE job
    SET user_id = ${attr.current_user_id}
    WHERE user_id = ANY(ARRAY[${attr.user_ids}])`);
  }

  // update job created_user
  for (const attr of backupUserId) {
    await connectJobService.query(`UPDATE job
    SET created_user = '${attr.current_user_id.toString()}'
    WHERE created_user = ANY(ARRAY[${attr.user_ids}]::VARCHAR[])`);
  }

  // update job updated_user
  for (const attr of backupUserId) {
    await connectJobService.query(`UPDATE job
    SET updated_user = '${attr.current_user_id}'
    WHERE updated_user = ANY(ARRAY[${attr.user_ids}]::VARCHAR[])`);
  }

  console.log('Finished');
  return true;
};

run();
