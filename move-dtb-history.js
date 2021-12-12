require('dotenv').config();
const { Pool } = require('pg');
const sql = require('sql');

const JobHistoryCallModel = sql.define({
  name: 'job_history_call',
  columns: [
    'id',
    'user_id',
    'job_id',
    'version',
    'created_at',
    'updated_at',
    'created_user',
    'updated_user',
    'is_deleted',
  ],
});

const TruckHistoryCallModel = sql.define({
  name: 'truck_history_call',
  columns: [
    'id',
    'user_id',
    'truck_id',
    'version',
    'created_at',
    'updated_at',
    'created_user',
    'updated_user',
    'is_deleted',
  ],
});

const sqlCreateExtensionDblink = `CREATE EXTENSION IF NOT EXISTS dblink;`;

const sqlCreateExtensionFdw = `CREATE EXTENSION IF NOT EXISTS postgres_fdw;`;

const sqlCreateDblinkConnect = `GRANT EXECUTE ON FUNCTION dblink_connect(text) TO public;`;

const sqlCreateUserService = `CREATE server userserver foreign data wrapper postgres_fdw
OPTIONS (dbname 'user_service', host '${process.env.DB_HOST}');`;

const sqlCreateUserMapping = `CREATE USER MAPPING FOR "public"
SERVER userserver OPTIONS (user '${process.env.DB_USERNAME}', password '${process.env.DB_PASSWORD}');`;

const sqlCreateJobService = `CREATE server jobserver foreign data wrapper postgres_fdw
OPTIONS (dbname 'job_service', host '${process.env.DB_HOST}');`;

const sqlCreateJobMapping = `CREATE USER MAPPING FOR "public"
SERVER jobserver OPTIONS (user '${process.env.DB_USERNAME}', password '${process.env.DB_PASSWORD}');`;

const sqlCreateTruckService = `CREATE server truckserver foreign data wrapper postgres_fdw
OPTIONS (dbname 'truck_service', host '${process.env.DB_HOST}');`;

const sqlCreateTruckMapping = `CREATE USER MAPPING FOR "public"
SERVER truckserver OPTIONS (user '${process.env.DB_USERNAME}', password '${process.env.DB_PASSWORD}');`;

const sqlCreateJobHistoryCall = `CREATE TABLE "public"."job_history_call" (
  "id" bigserial NOT NULL,
  "user_id" int4 NOT NULL,
  "job_id" int4,
  "version" int4 NOT NULL DEFAULT 0,
  "created_at" timestamp(0) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(0) DEFAULT CURRENT_TIMESTAMP,
  "created_user" varchar(254) DEFAULT NULL::character varying,
  "updated_user" varchar(254) DEFAULT NULL::character varying,
  "is_deleted" bool NOT NULL DEFAULT false
);`;

const sqlCreateTruckHistoryCall = `CREATE TABLE "public"."truck_history_call" (
  "id" bigserial NOT NULL,
  "user_id" int4 NOT NULL,
  "truck_id" int4,
  "version" int4 NOT NULL DEFAULT 0,
  "created_at" timestamp(0) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(0) DEFAULT CURRENT_TIMESTAMP,
  "created_user" varchar(254) DEFAULT NULL::character varying,
  "updated_user" varchar(254) DEFAULT NULL::character varying,
  "is_deleted" bool NOT NULL DEFAULT false
);`;

const sqlCreateViewJobHistoryCall = `CREATE VIEW vw_job_history_call AS
SELECT
  jhc.id AS id,
  jhc.user_id AS user_id,
	jhc.created_at AS call_time,
	vwjob.loading_address AS address_name,
	vwjob.loading_datetime AS datetime,
	vwjob.loading_contact_name AS contact_name,
	vwjob.loading_contact_phone AS contact_phone,
	vwjob.loading_latitude AS lat,
	vwjob.loading_longitude AS lng,
	vwjob.product_name AS product_name,
	vwjob.product_type_id AS product_type_id,
	vwjob.required_truck_amount AS required_truck_amount,
	vwjob.truck_type AS truck_type,
	vwjob.weight AS weight,
	vwjob.shipments AS shipments
FROM job_history_call jhc
LEFT JOIN dblink('jobserver'::text, 'SELECT id, product_type_id, product_name, truck_type, weight, required_truck_amount, loading_address, loading_datetime, loading_contact_name, loading_contact_phone, loading_latitude, loading_longitude, owner, shipments FROM vw_job_list' ::text) vwjob (
	id INTEGER,
	product_type_id INTEGER,
	product_name TEXT,
	truck_type TEXT,
	weight NUMERIC,
	required_truck_amount INTEGER,
	loading_address TEXT,
	loading_datetime TEXT,
	loading_contact_name TEXT,
	loading_contact_phone TEXT,
	loading_latitude TEXT,
	loading_longitude TEXT,
	owner JSON,
	shipments JSON
) ON vwjob.id = jhc.job_id;`;

const sqlCreateViewTruckHistoryCall = `CREATE VIEW vw_truck_history_call AS
SELECT
  thc.id AS id,
  thc.user_id AS user_id,
	thc.created_at AS call_time,
	vwtruck.loading_weight AS loading_weight,
	vwtruck.registration_number AS registration_number,
	vwtruck.truck_type AS truck_type,
	vwtruck.owner AS owner
FROM truck_history_call thc
LEFT JOIN dblink('truckserver'::text, 'SELECT id, loading_weight, registration_number, truck_type, owner FROM vw_truck_list' ::text) vwtruck (
	id INTEGER,
	loading_weight NUMERIC,
	registration_number _TEXT,
	truck_type INTEGER,
	owner JSON
) ON vwtruck.id = thc.truck_id;`;

const sqlGetHistoryCallTruckJob = `SELECT * FROM dtb_history_call_truck_job`;

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

const run = async () => {
  const clientFrom = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_LEGACY,
    port: process.env.DB_PORT,
  });

  const clientTo = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'history_service',
    port: process.env.DB_PORT,
  });

  const connectFrom = await clientFrom.connect();
  const connectTo = await clientTo.connect();

  await connectTo.query(sqlCreateExtensionDblink);
  await connectTo.query(sqlCreateExtensionFdw);
  await connectTo.query(sqlCreateDblinkConnect);
  await connectTo.query(sqlCreateUserService);
  await connectTo.query(sqlCreateUserMapping);
  await connectTo.query(sqlCreateJobService);
  await connectTo.query(sqlCreateJobMapping);
  await connectTo.query(sqlCreateTruckService);
  await connectTo.query(sqlCreateTruckMapping);
  await connectTo.query(sqlCreateJobHistoryCall);
  await connectTo.query(sqlCreateTruckHistoryCall);

  const { rows: historyCallData } = await connectFrom.query(sqlGetHistoryCallTruckJob);

  const jobHistoryData = [];
  const truckHistoryData = [];

  historyCallData.forEach((history) => {
    if (history.job_id) {
      delete history.truck_id;
      jobHistoryData.push({ ...history, job_id: history.job_id - 999999 });
    } else {
      delete history.job_id;
      truckHistoryData.push(history);
    }
  });

  const rowQueryJobHistoryCall = JobHistoryCallModel.insert(jobHistoryData).toQuery();
  await connectTo.query(rowQueryJobHistoryCall);

  const rowQueryTruckHistoryCall = TruckHistoryCallModel.insert(truckHistoryData).toQuery();
  await connectTo.query(rowQueryTruckHistoryCall);

  await connectTo.query(sqlCreateViewJobHistoryCall);
  await connectTo.query(sqlCreateViewTruckHistoryCall);

  const dbSchema = await connectTo.query(sqlSequence);
  await Promise.all(
    dbSchema.rows.map(async (schema) => {
      await connectTo.query(
        `SELECT setval('${schema.sequence_name}', (SELECT MAX("${schema.column_name}") FROM "${schema.table_name}"))`
      );
    })
  );

  console.log('Finished');
  return true;
};

run();
