require('dotenv').config();
const { Pool } = require('pg');

const sqlDropViewJobShipment = `DROP VIEW vw_job_list;`;

const sqlCreateViewJobShipment = `CREATE OR REPLACE VIEW vw_job_list AS
SELECT
	j.id AS id,
	j.user_id AS user_id,
	j.product_type_id AS product_type_id,
	j.product_name AS product_name,
	j.truck_type AS truck_type,
	j.total_weight AS weight,
	j.truck_amount AS required_truck_amount,
	j.loading_address AS loading_address,
	j.loading_datetime AS loading_datetime,
	j.loading_contact_name AS loading_contact_name,
	j.loading_contact_phone AS loading_contact_phone,
	j.loading_latitude AS loading_latitude,
	j.loading_longitude AS loading_longitude,
	j.status AS status,
	j.offered_total AS price,
	j.price_type AS price_type,
	j.tipper AS tipper,
	j.is_deleted AS is_deleted,
  j.public_as_cgl AS public_as_cgl,
	JSON_BUILD_OBJECT('id', usr.id, 'fullName', usr.fullname, 'email', usr.email, 'mobileNo', usr.phone_number, 'avatar', JSON_BUILD_OBJECT('object', usr.avatar)) AS owner,
	JSON_AGG(JSON_BUILD_OBJECT('name', s.address_dest, 'dateTime', s.delivery_datetime, 'contactName', s.fullname_dest, 'contactMobileNo', s.phone_dest, 'lat', s.latitude_dest::VARCHAR, 'lng', s.longitude_dest::VARCHAR)) AS shipments,
	j.full_text_search AS full_text_search,
	vwtrip.trips AS trips,
	(CASE WHEN vwbook.id IS NOT NULL THEN (JSON_AGG(JSON_BUILD_OBJECT('id', vwbook.id, 'fullName', vwbook.fullname, 'avatar', vwbook.avatar, 'truck', vwbook.truck, 'bookingDatetime', vwbook.booking_datetime))) ELSE NULL END) AS quotations
FROM
	job j
	LEFT JOIN shipment s ON s.job_id = j.id
	LEFT JOIN dblink('myserver'::text, 'SELECT id,email,fullname,phone_number,avatar FROM user_profile' ::text) usr (
		id integer,
		email text,
		fullname text,
		phone_number text,
		avatar text) ON usr.id = j.user_id
	LEFT JOIN dblink('bookserver'::text, 'SELECT job_id, trips FROM vw_trip_with_truck_detail' ::text) vwtrip (
		job_id integer,
		trips JSONB) ON vwtrip.job_id = j.id
	LEFT JOIN dblink('bookserver'::text, 'SELECT id, job_id, fullname, avatar, truck, booking_datetime FROM vw_booking' ::text) vwbook (
		id INTEGER,
		job_id integer,
		fullname VARCHAR,
		avatar JSONB,
		truck JSONB,
		booking_datetime TIMESTAMP) ON vwbook.job_id = j.id
GROUP BY j.id,
	j.user_id,
	j.product_type_id,
	j.product_name,
	j.truck_type,
	j.total_weight,
	j.truck_amount,
	j.loading_address,
	j.loading_datetime,
	j.loading_contact_name,
	j.loading_contact_phone,
	j.loading_latitude,
	j.loading_longitude,
	j.status,
	j.offered_total,
	j.price_type,
	j.tipper,
	j.is_deleted,
	j.full_text_search,
  j.public_as_cgl,
	usr.id,
	usr.email,
	usr.fullname,
	usr.phone_number,
	usr.avatar,
	vwtrip.trips,
	vwbook.id;`;

const run = async () => {
  const clientTo = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'job_service',
    port: process.env.DB_PORT,
  });

  const connectTo = await clientTo.connect();

  await connectTo.query(sqlDropViewJobShipment);
  await connectTo.query(sqlCreateViewJobShipment);

  console.log('Finished');
  return true;
};

run();
