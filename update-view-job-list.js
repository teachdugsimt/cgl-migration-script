require('dotenv').config();
const mmtz = require('moment-timezone');
const { Pool } = require('pg');

const sqlDropViewJobList = `DROP VIEW vw_job_list`;

const sqlUpdateViewJobList = `CREATE VIEW vw_job_list AS
SELECT
  j.id,
  j.user_id,
  j.product_type_id,
  j.product_name,
  j.truck_type,
  j.total_weight AS weight,
  j.truck_amount AS required_truck_amount,
  j.loading_address,
  j.loading_datetime,
  j.loading_contact_name,
  j.loading_contact_phone,
  j.loading_latitude,
  j.loading_longitude,
  j.status,
  j.offered_total AS price,
  j.price_type,
  j.tipper,
  j.is_deleted,
  j.public_as_cgl,
  json_build_object('id', usr.id, 'fullName', usr.fullname, 'email', usr.email, 'mobileNo', usr.phone_number, 'avatar', json_build_object('object', usr.avatar)) AS OWNER,
  json_agg(json_build_object('name', s.address_dest, 'dateTime', s.delivery_datetime, 'contactName', s.fullname_dest, 'contactMobileNo', s.phone_dest, 'lat', s.latitude_dest::character varying, 'lng', s.longitude_dest::character varying)) AS shipments,
  j.full_text_search,
  vwtrip.trips AS trips,
  CASE WHEN vwbook.id IS NOT NULL THEN
    json_agg(json_build_object('id', vwbook.id, 'fullName', vwbook.fullname, 'avatar', vwbook.avatar, 'truck', vwbook.truck, 'bookingDatetime', vwbook.booking_datetime))
  ELSE
    NULL::json
  END AS quotations,
  j.created_at
  FROM
  job j
  LEFT JOIN shipment s ON s.job_id = j.id
  LEFT JOIN dblink('myserver'::text, 'SELECT id,email,fullname,phone_number,avatar FROM user_profile'::text) usr (id integer,
    email text,
    fullname text,
    phone_number text,
    avatar text) ON usr.id = j.user_id
  LEFT JOIN dblink('bookserver'::text, 'SELECT detail.job_id, JSONB_AGG(detail.trips) FROM
    (SELECT
      job_id,
      (jsonb_array_elements(jsonb_array_elements(JSONB_AGG(trips)::jsonb))) AS trips
    FROM
      vw_trip_with_truck_detail
    GROUP BY
      job_id) as detail
  GROUP BY job_id'::text) vwtrip (job_id integer,
    trips jsonb) ON vwtrip.job_id = j.id
  LEFT JOIN dblink('bookserver'::text, 'SELECT id, job_id, fullname, avatar, truck, booking_datetime FROM vw_booking'::text) vwbook (id integer,
    job_id integer,
    fullname character varying,
    avatar jsonb,
    truck jsonb,
    booking_datetime timestamp without time zone) ON vwbook.job_id = j.id
  GROUP BY
  j.id,
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
  vwbook.id,
  j.created_at;`;

const run = async () => {
  const clientFrom = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'job_service',
    port: process.env.DB_PORT,
  });

  const connectFrom = await clientFrom.connect();

  await connectFrom.query(sqlDropViewJobList);
  await connectFrom.query(sqlUpdateViewJobList);

  console.log('Finished !!');
};

run();
