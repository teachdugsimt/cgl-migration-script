require('dotenv').config();
const { Pool } = require('pg');

const sqlDropViewJobHistoryCall = `DROP VIEW vw_job_history_call`;

const sqlCreateViewJobHistoryCall = `CREATE VIEW vw_job_history_call AS
SELECT
  jhc.id AS id,
  jhc.user_id AS user_id,
  jhc.job_id AS job_id,
	jhc.created_at AS call_time,
  jhc.channel AS channel,
  usr.fullname AS fullname,
  usr.phone_number AS phone_number,
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
  vwjob.owner AS owner,
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
) ON vwjob.id = jhc.job_id
LEFT JOIN dblink('userserver'::text, 'SELECT id, fullname, phone_number FROM user_profile'::text) usr(
  id integer,
  fullname varchar,
  phone_number varchar
) ON usr.id = jhc.user_id;`;

const sqlDropViewTruckHistoryCall = `DROP VIEW vw_truck_history_call`;

const sqlCreateViewTruckHistoryCall = `CREATE VIEW vw_truck_history_call AS
SELECT
  thc.id AS id,
  thc.user_id AS user_id,
  thc.truck_id AS truck_id,
	thc.created_at AS call_time,
  thc.channel AS channel,
  usr.fullname AS fullname,
  usr.phone_number AS phone_number,
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
) ON vwtruck.id = thc.truck_id
LEFT JOIN dblink('userserver'::text, 'SELECT id, fullname, phone_number FROM user_profile'::text) usr(
  id integer,
  fullname varchar,
  phone_number varchar
) ON usr.id = thc.user_id`;

const run = async () => {
  const client = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'history_service',
    port: process.env.DB_PORT,
  });

  const connect = await client.connect();

  await connect.query(`CREATE TYPE enum_channel AS ENUM('MOBILE', 'LINEOA')`);
  await connect.query(`ALTER TABLE job_history_call
  ADD channel enum_channel NOT NULL DEFAULT 'MOBILE'`);
  await connect.query(`ALTER TABLE truck_history_call
  ADD channel enum_channel NOT NULL DEFAULT 'MOBILE'`);

  await connect.query(sqlDropViewJobHistoryCall);
  await connect.query(sqlCreateViewJobHistoryCall);
  await connect.query(sqlDropViewTruckHistoryCall);
  await connect.query(sqlCreateViewTruckHistoryCall);

  console.log('Finished !!');
};

run();
