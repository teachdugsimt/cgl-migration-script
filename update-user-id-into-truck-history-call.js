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
    database: 'history_service',
    port: process.env.DB_PORT,
  });

  const connectUserService = await clientUserService.connect();
  const connectJobService = await clientJobService.connect();

  const { rows: backupUserId } = await connectUserService.query(sqlSelectBackupUserId);

  // update truck_history_call user_id
  for (const attr of backupUserId) {
    await connectJobService.query(`UPDATE truck_history_call
    SET user_id = ${attr.current_user_id}, created_user = '${attr.current_user_id}', updated_user = '${attr.current_user_id}'
    WHERE user_id = ANY(ARRAY[${attr.user_ids}])`);
  }

  console.log('Finished');
  return true;
};

run();
