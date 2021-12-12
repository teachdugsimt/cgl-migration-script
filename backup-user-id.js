require('dotenv').config();
const { Pool } = require('pg');
const sql = require('sql');

const host = process.env.DB_HOST;
const pgPassword = process.env.DB_PASSWORD;

const BackupUserIdModel = sql.define({
  name: 'backup_user_id',
  columns: ['current_user_id', 'phone_number', 'user_ids'],
});

const sqlAddTblBackupUserId = `CREATE TABLE backup_user_id(
  current_user_id int4 not null,
  phone_number varchar(50) not null,
  user_ids integer[]
)`;

const sqlGetPhoneAndUserIds = `SELECT phone_number, current_user_id, user_ids FROM (SELECT
  DISTINCT ON
  (phone_number) phone_number,
  email AS email,
  id AS current_user_id,
   (SELECT ARRAY_AGG(id) FROM user_profile u WHERE u.phone_number = ur.phone_number) AS user_ids
FROM
  user_profile ur
WHERE phone_number IS NOT NULL
ORDER BY
  phone_number,
  LOWER(email),
  id DESC) AS backup;`;

const run = async () => {
  // const clientFrom = new Pool({
  //   host: host,
  //   user: process.env.DB_USERNAME,
  //   password: pgPassword,
  //   database: 'cargolink',
  //   port: process.env.DB_PORT,
  // });
  const clientTo = new Pool({
    host: host,
    user: process.env.DB_USERNAME,
    password: pgPassword,
    database: 'user_service',
    port: process.env.DB_PORT,
  });

  // const connectFrom = await clientFrom.connect();
  const connectTo = await clientTo.connect();

  const { rows: backupData } = await connectTo.query(sqlGetPhoneAndUserIds);
  await connectTo.query(sqlAddTblBackupUserId);

  const rowQueryBackupUserId = BackupUserIdModel.insert(backupData).toQuery();
  await connectTo.query(rowQueryBackupUserId);

  console.log('Finished');
  return true;
};

run();
