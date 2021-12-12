require('dotenv').config();
const { Pool } = require('pg');

const host = process.env.DB_HOST;
const pgPassword = process.env.DB_PASSWORD;

const sql = `DELETE FROM user_profile ur
WHERE id NOT IN(SELECT current_user_id FROM backup_user_id) AND ur.id NOT IN(1, 3, 4);`;

const run = async () => {
  const clientTo = new Pool({
    host: host,
    user: process.env.DB_USERNAME,
    password: pgPassword,
    database: 'user_service',
    port: process.env.DB_PORT,
  });

  const connectTo = await clientTo.connect();

  await connectTo.query(sql);

  console.log('Finished');
  return true;
};

run();
