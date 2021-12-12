require('dotenv').config();
const axios = require('axios');
const { Pool } = require('pg');
const sql = require('sql');

const JobModel = sql.define({
  name: 'job',
  columns: [
    'id',
    'status',
    'offered_total',
    'version',
    'created_at',
    'updated_at',
    'created_user',
    'updated_user',
    'is_deleted',
    'user_id',
    'win_carrier_id',
    'win_quotation_id',
    'quotation_type',
    'valid_until',
    'cancel_note',
    'cancel_user',
    'cancel_time',
    'freight_offer_id',
    'type',
    'product_type_id',
    'product_name',
    'quantity',
    'unit',
    'total_weight',
    'length',
    'width',
    'height',
    'truck_type',
    'truck_sharing',
    'handling_instruction',
    'loading_datetime',
    'loading_address',
    'loading_longitude',
    'loading_latitude',
    'loading_contact_name',
    'loading_contact_phone',
    'winner_price',
    'payment_status',
    'payment_method',
    'payment_status_carrier',
    'required_insurance',
    'cargo_price',
    'complain_note',
    'accepted_date',
    'finish_time',
    'total_distance',
    'check_loading_service',
    'check_unloading_service',
    'recommend_carrier_id',
    'recommend_truck_id',
    'loading_address_en',
    'loading_address_th',
    'loading_province_id',
    'loading_district_id',
    'reason_of_reject',
    'parent_job_id',
    'is_single_trip',
    'carrier_price',
    'truck_amount',
    'platform',
    'price_type',
    'tipper',
  ],
});

const ShipmentModel = sql.define({
  name: 'shipment',
  columns: [
    'id',
    'job_id',
    'status',
    'address_org',
    'address_dest',
    'longitude_org',
    'latitude_org',
    'longitude_dest',
    'latitude_dest',
    'fullname_org',
    'fullname_dest',
    'phone_org',
    'phone_dest',
    'time_from_pickup_org',
    'time_to_pickup_org',
    'time_from_delivery_org',
    'time_to_delivery_org',
    'version',
    'created_at',
    'updated_at',
    'created_user',
    'updated_user',
    'is_deleted',
    'request_number',
    'product_name',
    'product_type_id',
    'quantity',
    'unit',
    'size_of_cargo',
    'photo',
    'handling_instruction',
    'truck_sharing',
    'payment_tran_fee',
    'type_of_truck',
    'estimate_distance',
    'estimate_time',
    'price',
    'delivery_datetime',
    'total_weight',
    'province_dest',
    'district_dest',
    'address_dest_en',
    'address_dest_th',
    'province_dest_id',
    'district_dest_id',
  ],
});

const sqlAddExtensionDblink = `CREATE EXTENSION IF NOT EXISTS dblink;`;

const sqlAddExtensionPgFdw = `CREATE EXTENSION IF NOT EXISTS postgres_fdw;`;

const sqlAddExtensionPgTrgm = `CREATE EXTENSION IF NOT EXISTS pg_trgm;`;

const sqlExcuteDblink = `GRANT EXECUTE ON FUNCTION dblink_connect(text)
TO public;`;

const sqlCreateServerUser = `CREATE SERVER myserver FOREIGN data wrapper postgres_fdw OPTIONS (
	dbname 'user_service',
	host '${process.env.DB_HOST}'
);`;

const sqlMappingUserServer = `CREATE USER MAPPING FOR "public" SERVER myserver OPTIONS (
	USER '${process.env.DB_USERNAME}',
	PASSWORD '${process.env.DB_PASSWORD}'
);`;

const sqlCreateServerBook = `CREATE SERVER bookserver FOREIGN data wrapper postgres_fdw OPTIONS (
	dbname 'booking_service',
	host '${process.env.DB_HOST}'
);`;

const sqlMappingBookServer = `CREATE USER MAPPING FOR "public" SERVER bookserver OPTIONS (
	USER '${process.env.DB_USERNAME}',
	PASSWORD '${process.env.DB_PASSWORD}'
);`;

const sqlCreatJobTbl = `CREATE TABLE job (
  "id" bigserial NOT NULL,
  "status" int2 NOT NULL,
  "offered_total" numeric(12,2) NOT NULL,
  "version" int4 NOT NULL DEFAULT 0,
  "created_at" timestamp(0) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(0) DEFAULT CURRENT_TIMESTAMP,
  "created_user" varchar(254) DEFAULT NULL::character varying,
  "updated_user" varchar(254) DEFAULT NULL::character varying,
  "is_deleted" bool NOT NULL DEFAULT false,
  "user_id" int4 NOT NULL,
  "win_carrier_id" int4,
  "win_quotation_id" int4,
  "quotation_type" int4 DEFAULT 0,
  "valid_until" timestamp(0) DEFAULT NULL::timestamp without time zone,
  "cancel_note" text,
  "cancel_user" int4,
  "cancel_time" timestamp(0) DEFAULT NULL::timestamp without time zone,
  "freight_offer_id" int4,
  "type" int4 DEFAULT 0,
  "product_type_id" int4 NOT NULL DEFAULT '-1'::integer,
  "product_name" varchar(256) NOT NULL DEFAULT ''::character varying,
  "quantity" int4 NOT NULL DEFAULT 0,
  "unit" int4 NOT NULL DEFAULT 1,
  "total_weight" numeric(12,2) NOT NULL DEFAULT 0,
  "length" numeric(12,2) DEFAULT 0,
  "width" numeric(12,2) DEFAULT 0,
  "height" numeric(12,2) DEFAULT 0,
  "truck_type" varchar(30) DEFAULT '-1'::integer,
  "truck_sharing" int4 DEFAULT 0,
  "handling_instruction" varchar(512) DEFAULT NULL::character varying,
  "loading_datetime" timestamp(0) DEFAULT NULL::timestamp without time zone,
  "loading_address" varchar(256) DEFAULT NULL::character varying,
  "loading_longitude" float8 DEFAULT 0,
  "loading_latitude" float8 DEFAULT 0,
  "loading_contact_name" varchar(256) DEFAULT NULL::character varying,
  "loading_contact_phone" varchar(256) DEFAULT NULL::character varying,
  "winner_price" numeric(12,2) DEFAULT 0,
  "payment_status" int2 NOT NULL DEFAULT 0,
  "payment_method" int2 NOT NULL DEFAULT 0,
  "payment_status_carrier" int2 NOT NULL DEFAULT 0,
  "required_insurance" bool NOT NULL DEFAULT false,
  "cargo_price" numeric(12,2) DEFAULT NULL::numeric,
  "complain_note" text,
  "accepted_date" timestamp(0) DEFAULT NULL::timestamp without time zone,
  "finish_time" timestamp(0) DEFAULT NULL::timestamp without time zone,
  "total_distance" varchar(254) DEFAULT 0,
  "check_loading_service" bool NOT NULL DEFAULT false,
  "check_unloading_service" bool NOT NULL DEFAULT false,
  "recommend_carrier_id" varchar(250) DEFAULT NULL::character varying,
  "recommend_truck_id" varchar(250) DEFAULT NULL::character varying,
  "loading_address_en" varchar(256),
  "loading_address_th" varchar(256),
  "loading_province_id" int4,
  "loading_district_id" int4,
  "reason_of_reject" text,
  "parent_job_id" int4,
  "is_single_trip" bool DEFAULT false,
  "carrier_price" numeric(12,2) DEFAULT NULL::numeric,
  "truck_amount" int4,
  "platform" int4 DEFAULT 0,
  "price_type" varchar(10) DEFAULT 'PER_TRIP'::character varying,
  "tipper" bool DEFAULT false
);`;

const sqlCreateShipmentTbl = `CREATE TABLE "shipment" (
  "id" bigserial NOT NULL,
  "job_id" int4 NOT NULL,
  "status" int2 NOT NULL,
  "address_org" varchar(256),
  "address_dest" varchar(256) NOT NULL,
  "longitude_org" float8,
  "latitude_org" float8,
  "longitude_dest" float8 NOT NULL,
  "latitude_dest" float8 NOT NULL,
  "fullname_org" varchar(256),
  "fullname_dest" varchar(256) NOT NULL,
  "phone_org" varchar(20),
  "phone_dest" varchar(20) NOT NULL,
  "time_from_pickup_org" timestamp(0),
  "time_to_pickup_org" timestamp(0),
  "time_from_delivery_org" timestamp(0),
  "time_to_delivery_org" timestamp(0),
  "version" int4 NOT NULL DEFAULT 0,
  "created_at" timestamp(0) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(0) DEFAULT CURRENT_TIMESTAMP,
  "created_user" varchar(254) DEFAULT NULL::character varying,
  "updated_user" varchar(254) DEFAULT NULL::character varying,
  "is_deleted" bool NOT NULL DEFAULT false,
  "request_number" varchar(256) DEFAULT NULL::character varying,
  "product_name" varchar(256) DEFAULT ''::character varying,
  "product_type_id" int4 DEFAULT 0,
  "quantity" int4 DEFAULT 0,
  "unit" int4 DEFAULT 0,
  "size_of_cargo" varchar(256) DEFAULT 0,
  "photo" varchar(512) DEFAULT NULL::character varying,
  "handling_instruction" varchar(512) DEFAULT NULL::character varying,
  "truck_sharing" int4 DEFAULT 0,
  "payment_tran_fee" int4 DEFAULT 0,
  "type_of_truck" int4 DEFAULT 0,
  "estimate_distance" varchar(30),
  "estimate_time" varchar(30),
  "price" numeric(12,2) DEFAULT NULL::numeric,
  "delivery_datetime" timestamp(0),
  "total_weight" float8 DEFAULT 0,
  "province_dest" varchar(255) DEFAULT NULL::character varying,
  "district_dest" varchar(255) DEFAULT NULL::character varying,
  "address_dest_en" varchar(256),
  "address_dest_th" varchar(256),
  "province_dest_id" int4,
  "district_dest_id" int4
);`;

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

const convertNewTruckType = (id) => {
  let newTruckId = null;
  if (id === '3') {
    newTruckId = 9;
  } else if (id === '7') {
    newTruckId = 2;
  } else if (id === '8') {
    newTruckId = 21;
  } else if (id === '10') {
    newTruckId = 27;
  } else if (id === '13') {
    newTruckId = 12;
  } else if (id === '14') {
    newTruckId = 18;
  } else if (id === '15') {
    newTruckId = 29;
  } else if (id === '17') {
    newTruckId = 4;
  } else if (id === '18') {
    newTruckId = 5;
  } else if (id === '19') {
    newTruckId = 6;
  } else if (id === '21') {
    newTruckId = 10;
  } else if (id === '22') {
    newTruckId = 7;
  } else if (id === '23') {
    newTruckId = 28;
  } else if (id === '24') {
    newTruckId = 8;
  } else if (id === '25') {
    newTruckId = 11;
  } else if (id === '26') {
    newTruckId = 15;
  } else if (id === '27') {
    newTruckId = 16;
  } else if (id === '28') {
    newTruckId = 14;
  } else if (id === '29') {
    newTruckId = 19;
  } else if (id === '30') {
    newTruckId = 17;
  } else if (id === '31') {
    newTruckId = 22;
  } else if (id === '33') {
    newTruckId = 25;
  } else if (id === '34') {
    newTruckId = 26;
  } else if (id === '36') {
    newTruckId = 24;
  } else if (id === '37') {
    newTruckId = 31;
  } else if (id === '38') {
    newTruckId = 32;
  } else if (id === '39') {
    newTruckId = 13;
  } else if (id === '40') {
    newTruckId = 1;
  } else if (id === '41') {
    newTruckId = 20;
  } else if (id === '42') {
    newTruckId = 23;
  } else if (id === '48') {
    newTruckId = 30;
  } else if (id === '49') {
    newTruckId = 3;
  } else if (id === '-1' || id === '0') {
    newTruckId = 16;
  }
  return newTruckId ? newTruckId.toString() : null;
};

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
    database: 'job_service',
    port: process.env.DB_PORT,
  });

  const connectFrom = await clientFrom.connect();
  const connectTo = await clientTo.connect();

  await connectTo.query(sqlAddExtensionDblink);
  await connectTo.query(sqlAddExtensionPgFdw);
  await connectTo.query(sqlAddExtensionPgTrgm);
  await connectTo.query(sqlExcuteDblink);
  await connectTo.query(sqlCreateServerUser);
  await connectTo.query(sqlMappingUserServer);
  await connectTo.query(sqlCreateServerBook);
  await connectTo.query(sqlMappingBookServer);

  await connectTo.query(sqlCreatJobTbl);
  await connectTo.query(sqlCreateShipmentTbl);

  const { rows: orderData } = await connectFrom.query(`SELECT * FROM dtb_order;`);
  const { rows: shipmentData } = await connectFrom.query(`SELECT * FROM dtb_shipment;`);

  const newOrder = orderData.map((order) => ({
    id: order.id - 999999,
    status: order.status,
    offered_total: order.offered_total,
    version: order.version,
    created_at: order.created_at,
    updated_at: order.updated_at,
    created_user: order.created_user,
    updated_user: order.updated_user,
    is_deleted: order.is_deleted,
    user_id: order.shipper_id,
    win_carrier_id: order.win_carrier_id,
    win_quotation_id: order.win_quotation_id ? order.win_quotation_id - 999999 : null,
    quotation_type: order.quotation_type,
    valid_until: order.valid_until,
    cancel_note: order.cancel_note,
    cancel_user: order.cancel_user,
    cancel_time: order.cancel_time,
    freight_offer_id: order.freight_offer_id,
    type: order.type,
    product_type_id: order.type_of_cargo,
    product_name: order.name_of_cargo,
    quantity: order.quantity,
    unit: order.unit,
    total_weight: order.total_weight,
    length: order.length,
    width: order.width,
    height: order.height,
    truck_type: convertNewTruckType(order.truck_type),
    truck_sharing: order.truck_sharing,
    handling_instruction: order.handling_instruction,
    loading_datetime: order.loading_datetime,
    loading_address: order.loading_address,
    loading_longitude: order.loading_longitude,
    loading_latitude: order.loading_latitude,
    loading_contact_name: order.loading_contact_name,
    loading_contact_phone: order.loading_contact_phone,
    winner_price: order.winner_price,
    payment_status: order.payment_status,
    payment_method: order.payment_method,
    payment_status_carrier: order.payment_status_carrier,
    required_insurance: order.required_insurance,
    cargo_price: order.cargo_price,
    complain_note: order.complain_note,
    accepted_date: order.accepted_date,
    finish_time: order.finish_time,
    total_distance: order.total_distance,
    check_loading_service: order.check_loading_service,
    check_unloading_service: order.check_unloading_service,
    recommend_carrier_id: order.recommend_carrier_id,
    recommend_truck_id: order.recommend_truck_id,
    loading_address_en: order.loading_address_en,
    loading_address_th: order.loading_address_th,
    loading_province_id: order.loading_province_id,
    loading_district_id: order.loading_district_id,
    reason_of_reject: order.reason_of_reject,
    parent_job_id: order.parent_order_id,
    is_single_trip: order.is_single_trip,
    carrier_price: order.carrier_price,
    truck_amount: order.truck_amount,
    platform: order.platform,
    price_type: order.price_type,
    tipper: order.tipper,
  }));

  const newShipment = shipmentData.map((shipment) => ({
    id: shipment.id - 999999,
    job_id: shipment.order_id - 999999,
    status: shipment.status,
    address_org: shipment.address_org,
    address_dest: shipment.address_dest,
    longitude_org: shipment.longitude_org,
    latitude_org: shipment.latitude_org,
    longitude_dest: shipment.longitude_dest,
    latitude_dest: shipment.latitude_dest,
    fullname_org: shipment.fullname_org,
    fullname_dest: shipment.fullname_dest,
    phone_org: shipment.phone_org,
    phone_dest: shipment.phone_dest,
    time_from_pickup_org: shipment.time_from_pickup_org,
    time_to_pickup_org: shipment.time_to_pickup_org,
    time_from_delivery_org: shipment.time_from_delivery_org,
    time_to_delivery_org: shipment.time_to_delivery_org,
    version: shipment.version,
    created_at: shipment.created_at,
    updated_at: shipment.updated_at,
    created_user: shipment.created_user,
    updated_user: shipment.updated_user,
    is_deleted: shipment.is_deleted,
    request_number: shipment.request_number,
    product_name: shipment.name_of_cargo,
    product_type_id: shipment.type_of_cargo,
    quantity: shipment.quantity,
    unit: shipment.unit,
    size_of_cargo: shipment.size_of_cargo,
    photo: shipment.photo,
    handling_instruction: shipment.handling_instruction,
    truck_sharing: shipment.truck_sharing,
    payment_tran_fee: shipment.payment_tran_fee,
    type_of_truck: shipment.type_of_truck,
    estimate_distance: shipment.estimate_distance,
    estimate_time: shipment.estimate_time,
    price: shipment.price,
    delivery_datetime: shipment.delivery_datetime,
    total_weight: shipment.total_weight,
    province_dest: shipment.province_dest,
    district_dest: shipment.district_dest,
    address_dest_en: shipment.address_dest_en,
    address_dest_th: shipment.address_dest_th,
    province_dest_id: shipment.province_dest_id,
    district_dest_id: shipment.district_dest_id,
  }));

  const nJob = Array.from({ length: 100 }, (_) => []);
  newOrder.forEach((value, index) => nJob[index % nJob.length].push(value));

  const nShipment = Array.from({ length: 100 }, (_) => []);
  newShipment.forEach((value, index) => nShipment[index % nShipment.length].push(value));

  for (const attr of nJob) {
    const rowQueryJob = JobModel.insert(attr).toQuery();
    await connectTo.query(rowQueryJob);
  }

  for (const attr of nShipment) {
    const rowQueryShipment = ShipmentModel.insert(attr).toQuery();
    await connectTo.query(rowQueryShipment);
  }

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

// const dataForCreateJob = {
//   truckType: 'string', // REQUIRED
//   truckAmount: 0,
//   productTypeId: 'string', // REQUIRED
//   productName: 'string', // REQUIRED
//   weight: 0,
//   price: 0,
//   tipper: true, // REQUIRED
//   priceType: 'string', // REQUIRED
//   expiredTime: 'string', // PER_TRIP, PER_TON
//   note: 'string',
//   from: { // REQUIRED
//     name: 'string',
//     dateTime: 'string',
//     contactName: 'string',
//     contactMobileNo: 'string',
//     lat: 'string',
//     lng: 'string',
//   },
//   to: [ // REQUIRED
//     {
//       name: 'string',
//       dateTime: 'string',
//       contactName: 'string',
//       contactMobileNo: 'string',
//       lat: 'string',
//       lng: 'string',
//     },
//   ],
//   platform: 0, // 0 = PC, 1 = MOBILE
//   userId: 'string', // REQUIRED FOR PC
// };
