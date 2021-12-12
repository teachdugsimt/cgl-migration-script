require('dotenv').config();
const { Pool } = require('pg');

const sqlAddDocumentWithWeights = `ALTER TABLE job
ADD COLUMN full_text_search tsvector;`;

const sqlAddJobCarrierId = `ALTER TABLE job
ADD COLUMN job_carrier_id int4;`;

const sqlAddViewJobList = `CREATE OR REPLACE VIEW vw_job_list AS
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
	JSON_BUILD_OBJECT('id', usr.id, 'fullName', usr.fullname, 'email', usr.email, 'mobileNo', usr.phone_number, 'avatar', JSON_BUILD_OBJECT('object', usr.avatar)) AS owner,
	JSON_AGG(JSON_BUILD_OBJECT('name', s.address_dest, 'dateTime', s.delivery_datetime, 'contactName', s.fullname_dest, 'contactMobileNo', s.phone_dest, 'lat', s.latitude_dest::VARCHAR, 'lng', s.longitude_dest::VARCHAR)) AS shipments,
	j.full_text_search AS full_text_search
FROM
	job j
	LEFT JOIN shipment s ON s.job_id = j.id
	LEFT JOIN dblink('myserver'::text, 'SELECT id,email,fullname,phone_number,avatar FROM user_profile' ::text) usr (
		id integer,
		email text,
		fullname text,
		phone_number text,
		avatar text) ON usr.id = j.user_id
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
	usr.id,
	usr.email,
	usr.fullname,
	usr.phone_number,
	usr.avatar;`;

const sqlUpdateJobTextSearch = `UPDATE job
SET full_text_search = d.full_text_search
FROM (SELECT 
	id,
	setweight(to_tsvector('english', COALESCE(a.product_name, '')), 'A')
	|| setweight(to_tsvector('english', COALESCE(a.owner_name, '')), 'B')
	
	|| (setweight(to_tsvector('english', COALESCE(a.loading_address, '')), 'C')
	|| setweight(to_tsvector('english', COALESCE(a.loading_contact_name, '')), 'C')
	|| setweight(to_tsvector('english', COALESCE(a.loading_contact_phone, '')), 'C'))
	
	|| (setweight(to_tsvector('english', COALESCE(a.shipment_address, '')), 'D')
	|| setweight(to_tsvector('english', COALESCE(a.shipment_contact_name, '')), 'D')
	|| setweight(to_tsvector('english', COALESCE(a.shipment_contact_phone, '')), 'D')) AS full_text_search
FROM (WITH data AS (
	SELECT 
	id,
	product_name,
	loading_address,
	loading_contact_name,
	loading_contact_phone,
	"owner" ->> 'fullName' AS owner_name,
	shipments::jsonb AS jsondata 
	FROM vw_job_list
)
SELECT
	id,
	product_name,
	loading_address,
	loading_contact_name,
	loading_contact_phone,
	owner_name,
	(jsonb_agg(elems.value -> 'name'))::TEXT AS shipment_address,
	(jsonb_agg(elems.value -> 'contactName'))::TEXT AS shipment_contact_name,
	(jsonb_agg(elems.value -> 'contactMobileNo'))::TEXT AS shipment_contact_phone
FROM
	data,
	jsonb_array_elements(jsondata) AS elems
WHERE (product_name IS NOT NULL AND product_name <> '')
	OR loading_address IS NOT NULL
	OR loading_contact_name IS NOT NULL
	OR owner_name IS NOT NULL
GROUP BY id, 
	product_name,
	loading_address,
	loading_contact_name,
	loading_contact_phone,
	owner_name
) AS a) AS d
WHERE job.id = d.id;`;

const sqlInitPgTrigram = `CREATE EXTENSION IF NOT EXISTS pg_trgm;`;

const sqlCreateIndexFullTextSearch = `CREATE INDEX idx_job_full_text_search ON job USING GIN(full_text_search);`;

const run = async () => {
  const clientTo = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'job_service',
    port: process.env.DB_PORT,
  });

  const connectTo = await clientTo.connect();

  await connectTo.query(sqlInitPgTrigram);
  await connectTo.query(sqlAddDocumentWithWeights);
  await connectTo.query(sqlAddViewJobList);
  await connectTo.query(sqlUpdateJobTextSearch);
  await connectTo.query(sqlCreateIndexFullTextSearch);
  await connectTo.query(sqlAddJobCarrierId);

  console.log('Finished');
  return true;
};

run();
