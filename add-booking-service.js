const sqlCreateExtensionDblink = `CREATE EXTENSION IF NOT EXISTS dblink;`;

const sqlCreateExtensionFdw = `CREATE EXTENSION IF NOT EXISTS postgres_fdw;`;

const sqlCreatePriceTypeEnum = `CREATE TYPE enum_price_type AS ENUM('PER_TON', 'PER_TRIP');`;

const sqlCreateTripStatusEnum = `CREATE TYPE enum_trip_status AS ENUM ('OPEN', 'IN_PROGRESS', 'DONE', 'REJECTED');`;

const sqlGrantDbConnect = `GRANT EXECUTE ON FUNCTION dblink_connect(text) TO public;`;

const sqlCreateJobServer = `CREATE server jobserver foreign data wrapper postgres_fdw
OPTIONS (dbname 'job_service', host 'cgl-db.cj4ycxviwust.ap-southeast-1.rds.amazonaws.com');`;

const sqlCreateMappingJobServer = `CREATE USER MAPPING FOR "public"
SERVER jobserver OPTIONS (user 'postgres', password '7uZrE546PzCjEV^e^tKpvs43PJTnHN');`;

const sqlCreateTruckServer = `CREATE server truckserver foreign data wrapper postgres_fdw
OPTIONS (dbname 'truck_service', host 'cgl-db.cj4ycxviwust.ap-southeast-1.rds.amazonaws.com');`;

const sqlCreateMappingTruckServer = `CREATE USER MAPPING FOR "public"
SERVER truckserver OPTIONS(user 'postgres', password '7uZrE546PzCjEV^e^tKpvs43PJTnHN');`;

const sqlCreateJobCarrierTbl = `CREATE TABLE job_carrier(
	"id" SERIAL NOT NULL,
	"job_id" INT4 NOT NULL,
	"carrier_id" INT4 NOT NULL
);`;

const sqlCreateTripTbl = `CREATE TABLE trip(
	"id" SERIAL NOT NULL,
	"job_carrier_id" INT4 NOT NULL,
	"truck_id" INT4 NOT NULL,
	"weight" NUMERIC,
	"price" NUMERIC,
	"price_type" enum_price_type DEFAULT 'PER_TRIP',
	"status" enum_trip_status DEFAULT 'OPEN',
	"booking_id" INT4 NOT NULL,
	"version" int4 NOT NULL DEFAULT 0,
  "created_at" timestamp(0) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(0) DEFAULT CURRENT_TIMESTAMP,
  "created_user" varchar(254) DEFAULT NULL::character varying,
  "updated_user" varchar(254) DEFAULT NULL::character varying,
  "is_deleted" BOOL NOT NULL DEFAULT false
);`;

const sqlCreateViewTripInprogress = `CREATE VIEW vw_trip_inprogress AS
SELECT
	jc.id AS id,
	jc.job_id AS job_id,
	jc.carrier_id AS carrier_id,
	vwjob.product_type_id AS product_type_id,
	vwjob.product_name AS product_name,
	vwjob.price AS price,
	vwjob.price_type AS price_type,
	vwjob.truck_type AS truck_type,
	vwjob.weight AS total_weight,
	vwjob.required_truck_amount AS required_truck_amount,
	JSON_BUILD_OBJECT(
		'name', vwjob.loading_address,
		'dateTime', vwjob.loading_datetime,
		'contactName', vwjob.loading_contact_name,
		'contactMobileNo', vwjob.loading_contact_phone,
		'lat', vwjob.loading_latitude,
		'lng', vwjob.loading_longitude
	) AS from,
	vwjob.shipments AS shipments,
	vwjob.owner AS job_owner,
	JSON_AGG(JSON_BUILD_OBJECT(
		'id', t.id, 
		'truckId', t.truck_id,
		'weight', COALESCE(t.weight, vwtruck.loading_weight), -- loadingWeight
		'price', COALESCE(t.price, vwjob.price), 
		'priceType', t.price_type, 
		'status', t.status, 
		'bookingId', t.booking_id,
		'truckType', vwtruck.truck_type,
		'stallHeight', vwtruck.stall_height,
		'createdAt', vwtruck.created_at,
		'updatedAt', vwtruck.updated_at,
		'approveStatus', vwtruck.approve_status,
		'phoneNumber', vwtruck.owner ->> 'mobileNo',
		'registrationNumber', vwtruck.registration_number,
		'workingZones', vwtruck.work_zone,
		'owner', vwtruck.owner,
		'tipper', vwtruck.tipper
	)) AS trips
		
FROM
	job_carrier jc
	LEFT JOIN trip t ON t.job_carrier_id = jc.id
	LEFT JOIN dblink('jobserver'::text, 'SELECT id, product_type_id, product_name, price, price_type, truck_type, weight, required_truck_amount, loading_address, loading_datetime, loading_contact_name, loading_contact_phone, loading_latitude, loading_longitude, owner, shipments FROM vw_job_list'::text) vwjob (id INTEGER,
		product_type_id INTEGER,
		product_name TEXT,
		price NUMERIC,
		price_type TEXT,
		truck_type TEXT,
		weight NUMERIC,
		required_truck_amount INTEGER,
		loading_address TEXT,
		loading_datetime TEXT,
		loading_contact_name TEXT,
		loading_contact_phone TEXT,
		loading_latitude TEXT,
		loading_longitude TEXT,
		owner JSONB,
		shipments JSONB) ON vwjob.id = jc.job_id
	LEFT JOIN dblink('truckserver'::text, 'SELECT id, approve_status, loading_weight, registration_number, stall_height, quotation_number, tipper, truck_type, created_at, updated_at, carrier_id, owner, work_zone FROM vw_truck_list'::TEXT) vwtruck (
		id INTEGER,
		approve_status VARCHAR,
		loading_weight NUMERIC,
		registration_number _TEXT,
		stall_height VARCHAR,
		quotation_number INTEGER,
		tipper BOOLEAN,
		truck_type INTEGER,
		created_at TIMESTAMP,
		updated_at TIMESTAMP,
		carrier_id INTEGER,
		owner JSONB,
		work_zone JSONB) ON vwtruck.id = t.truck_id
GROUP by 
	jc.id,
	jc.job_id,
	jc.carrier_id,
	vwjob.product_type_id,
	vwjob.truck_type,
	vwjob.weight,
	vwjob.required_truck_amount,
	vwjob.loading_address,
	vwjob.loading_datetime,
	vwjob.loading_contact_name,
	vwjob.loading_contact_phone,
	vwjob.loading_latitude,
	vwjob.loading_longitude,
	vwjob.owner,
	vwjob.shipments,
	vwjob.product_name,
	vwjob.price,
	vwjob.price_type;`;

const sqlCreateViewTripWithTruckDetail = `CREATE VIEW vw_trip_with_truck_detail AS
SELECT
	jc.id AS job_carrier_id,
	jc.job_id AS job_id,
	jc.carrier_id AS carrier_id,
	JSON_AGG(JSON_BUILD_OBJECT(
		'id', t.id, 
		'truckId', t.truck_id,
		'weight', COALESCE(t.weight, vwtruck.loading_weight), -- loadingWeight
		'price', COALESCE(t.price, vwjob.price), 
		'priceType', t.price_type, 
		'status', t.status, 
		'bookingId', t.booking_id,
		'truckType', vwtruck.truck_type,
		'stallHeight', vwtruck.stall_height,
		'createdAt', vwtruck.created_at,
		'updatedAt', vwtruck.updated_at,
		'approveStatus', vwtruck.approve_status,
		'phoneNumber', vwtruck.owner ->> 'mobileNo',
		'registrationNumber', vwtruck.registration_number,
		'workingZones', vwtruck.work_zone,
		'owner', vwtruck.owner,
		'tipper', vwtruck.tipper
	)) AS trips
		
FROM
	job_carrier jc
	LEFT JOIN trip t ON t.job_carrier_id = jc.id
	LEFT JOIN dblink('jobserver'::text, 'SELECT id, offered_total AS price FROM job'::text) vwjob (id INTEGER, price NUMERIC) ON vwjob.id = jc.job_id
	LEFT JOIN dblink('truckserver'::text, 'SELECT id, approve_status, loading_weight, registration_number, stall_height, quotation_number, tipper, truck_type, created_at, updated_at, carrier_id, owner, work_zone FROM vw_truck_list'::TEXT) vwtruck (
		id INTEGER,
		approve_status VARCHAR,
		loading_weight NUMERIC,
		registration_number _TEXT,
		stall_height VARCHAR,
		quotation_number INTEGER,
		tipper BOOLEAN,
		truck_type INTEGER,
		created_at TIMESTAMP,
		updated_at TIMESTAMP,
		carrier_id INTEGER,
		owner JSONB,
		work_zone JSONB) ON vwtruck.id = t.truck_id
GROUP by 
	jc.id,
	jc.job_id,
	jc.carrier_id;`;

const run = async () => {
  const client = new Pool({
    host: 'cgl-db.cj4ycxviwust.ap-southeast-1.rds.amazonaws.com',
    user: 'postgres',
    password: '7uZrE546PzCjEV^e^tKpvs43PJTnHN',
    database: 'booking_service',
    port: process.env.DB_PORT,
  });

  const connect = await client.connect();

  await connect.query(sqlCreateExtensionDblink);
  await connect.query(sqlCreateExtensionFdw);
  await connect.query(sqlCreatePriceTypeEnum);
  await connect.query(sqlCreateTripStatusEnum);
  await connect.query(sqlGrantDbConnect);
  await connect.query(sqlCreateJobServer);
  await connect.query(sqlCreateMappingJobServer);
  await connect.query(sqlCreateTruckServer);
  await connect.query(sqlCreateMappingTruckServer);
  await connect.query(sqlCreateJobCarrierTbl);
  await connect.query(sqlCreateTripTbl);
  await connect.query(sqlCreateViewTripInprogress);
  await connect.query(sqlCreateViewTripWithTruckDetail);

  console.log('Finished');
  return true;
};

run();
