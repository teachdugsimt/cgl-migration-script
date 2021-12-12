require('dotenv').config();
const { Pool } = require('pg');

const sqlDeleteUserByEmailAndPhoneNumbIsEmpty = `DELETE FROM user_profile WHERE email = '' AND phone_number IS NULL;`;
const sqlDeleteUserByInvalidFormatPhoneNumb = `DELETE FROM user_profile WHERE phone_number NOT LIKE '+%';`;
const sqlDeleteUserByLengthOfPhoneNumbMoreThan12 = `DELETE FROM user_profile WHERE LENGTH(phone_number) > 12;`;
const sqlDeleteUserByPhoneNumbNotTH = `DELETE FROM user_profile WHERE phone_number LIKE '+84%' OR phone_number LIKE '+16%';`;
const sqlSequence = `SELECT t.oid::regclass AS table_name,
  a.attname AS column_name,
  s.relname AS sequence_name
FROM pg_class AS t
JOIN pg_attribute AS a
  ON a.attrelid = t.oid
JOIN pg_depend AS d
  ON d.refobjid = t.oid
AND d.refobjsubid = a.attnum
JOIN pg_class AS s
  ON s.oid = d.objid
WHERE d.classid = 'pg_catalog.pg_class'::regclass
  AND d.refclassid = 'pg_catalog.pg_class'::regclass
  AND t.relkind IN ('r', 'P')
  AND s.relkind = 'S'`;

const sqlSetEmailToNull = `UPDATE user_profile
SET email = NULL
WHERE email = '';`;

const run = async () => {
  const client = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'user_service',
    port: process.env.DB_PORT,
  });

  const connect = await client.connect();

  await connect.query(sqlDeleteUserByEmailAndPhoneNumbIsEmpty);
  await connect.query(sqlDeleteUserByInvalidFormatPhoneNumb);
  await connect.query(sqlDeleteUserByLengthOfPhoneNumbMoreThan12);
  await connect.query(sqlDeleteUserByPhoneNumbNotTH);
  const dbSchema = await connect.query(sqlSequence);
  await Promise.all(
    dbSchema.rows.map(async (schema) => {
      await connect.query(
        `SELECT setval('${schema.sequence_name}', (SELECT MAX("${schema.column_name}") FROM "${schema.table_name}"))`
      );
    })
  );
  await connect.query(sqlSetEmailToNull);

  console.log('Finished');
  return true;
};

run();
