require('dotenv').config();
const { Pool } = require('pg');

const sqlCreateExtensionDblink = `CREATE EXTENSION IF NOT EXISTS dblink;`;

const sqlCreateExtensionFdw = `CREATE EXTENSION IF NOT EXISTS postgres_fdw;`;

const sqlCreateDblinkConnect = `GRANT EXECUTE ON FUNCTION dblink_connect(text) TO public;`;

const sqlCreateJobService = `CREATE server jobserver foreign data wrapper postgres_fdw
OPTIONS (dbname 'job_service', host '${process.env.DB_HOST}');`;

const sqlCreateJobMapping = `CREATE USER MAPPING FOR "public"
SERVER jobserver OPTIONS (user '${process.env.DB_USERNAME}', password '${process.env.DB_PASSWORD}');`;

const sqlCreateViewUserJob = `CREATE VIEW vw_user_job_summary AS
SELECT profile.id,
json_build_object('object', profile.avatar) AS avatar,
profile.fullname,
profile.phone_number,
count(job.id) AS totaljob
FROM user_profile profile
 LEFT JOIN dblink('jobserver'::text, 'SELECT id,user_id FROM job'::text) job(id integer, user_id integer) ON job.user_id = profile.id
GROUP BY profile.id, profile.avatar, profile.fullname, profile.phone_number;`;

const run = async () => {
  const client = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'user_service',
    port: process.env.DB_PORT,
  });

  const connect = await client.connect();

  await connect.query(sqlCreateExtensionDblink);
  await connect.query(sqlCreateExtensionFdw);
  await connect.query(sqlCreateDblinkConnect);
  await connect.query(sqlCreateJobService);
  await connect.query(sqlCreateJobMapping);
  await connect.query(sqlCreateViewUserJob);

  console.log('Finished');
  return true;
};

run();
