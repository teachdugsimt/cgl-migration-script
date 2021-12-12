require('dotenv').config();
const { Pool } = require('pg');
const sql = require('sql');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const Hashids = require('hashids');
// const Utility = require('utility-layer/dist/security');
// const util = new Utility();

const salt = 'secretkeyforcargolinkproject';
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';

const newDBUser = 'user_service';

const oldConnection = {
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_LEGACY,
  port: process.env.DB_PORT,
};

const newConnection = {
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: 'truck_service',
  port: process.env.DB_PORT,
};

const createTable = async () => {
  const clientTo = new Pool(newConnection);
  const connectTo = await clientTo.connect();
  const sqlCreateFavoriteSeq = `CREATE SEQUENCE IF NOT EXISTS favorite_seq;`;
  const sqlCreateFavorite = `
  CREATE TABLE "public"."favorite" (
      "id" int4 NOT NULL DEFAULT nextval('favorite_seq'::regclass),
      "user_id" int4 NOT NULL,
      "truck_id" int4,
      "version" int4 NOT NULL DEFAULT 0,
      "created_at" timestamp(0) DEFAULT CURRENT_TIMESTAMP,
      "updated_at" timestamp(0) DEFAULT CURRENT_TIMESTAMP,
      "created_user" varchar(254) DEFAULT NULL::character varying,
      "updated_user" varchar(254) DEFAULT NULL::character varying,
      "is_deleted" bool NOT NULL DEFAULT false,
      PRIMARY KEY ("id")
  );`;

  const sqlCreateTruckSeq = `CREATE SEQUENCE IF NOT EXISTS truck_seq;`;
  const sqlDropTruckEnum = `DROP TYPE IF EXISTS "public"."status_enum";`;
  const sqlCreateTruckEnum = `CREATE TYPE "public"."status_enum" AS ENUM ('INACTIVE', 'ACTIVE');`;
  const sqlCreateTruck = `
  CREATE TABLE "public"."truck" (
    "id" int4 NOT NULL DEFAULT nextval('truck_seq'::regclass),
    "name" varchar(255) DEFAULT NULL::character varying,
    "carrier_id" int4 NOT NULL DEFAULT 0,
    "registration_number" varchar(255) DEFAULT NULL::character varying,
    "loading_weight" float8 DEFAULT 0,
    "created_at" timestamp(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp(0) DEFAULT CURRENT_TIMESTAMP,
    "created_user" varchar(254) DEFAULT NULL::character varying,
    "updated_user" varchar(254) DEFAULT NULL::character varying,
    "is_deleted" bool NOT NULL DEFAULT false,
    "truck_type" int4 NOT NULL DEFAULT 0,
    "approve_status" "public"."status_enum" NOT NULL DEFAULT 'INACTIVE'::status_enum,
    "approve_date" timestamp(0) DEFAULT NULL::timestamp without time zone,
    "group_truck_type" int4,
    "is_tipper" bool DEFAULT false,
    "stall_height" varchar(10) DEFAULT NULL::character varying,
    "favorite" int4,
    "created_from" int4 DEFAULT 1,
    PRIMARY KEY ("id")
);`;

  const sqlCreateTruckPhotoSeq = `CREATE SEQUENCE IF NOT EXISTS truck_photo_seq;`;
  const sqlCreateTruckPhoto = `
  CREATE TABLE "public"."truck_photo" (
      "id" int4 NOT NULL DEFAULT nextval('truck_photo_seq'::regclass),
      "truck_id" int4 NOT NULL,
      "photo_name" varchar(255) NOT NULL,
      "created_at" timestamp(0) DEFAULT CURRENT_TIMESTAMP,
      "updated_at" timestamp(0) DEFAULT CURRENT_TIMESTAMP,
      "created_user" varchar(254) DEFAULT NULL::character varying,
      "updated_user" varchar(254) DEFAULT NULL::character varying,
      "is_deleted" bool NOT NULL DEFAULT false,
      "type" int4,
      PRIMARY KEY ("id")
  );`;

  const sqlCreateTruckWorkingZoneSeq = `CREATE SEQUENCE IF NOT EXISTS truck_working_zone_seq;`;
  const sqlCreateTruckWorkingZone = `
  CREATE TABLE "public"."truck_working_zone" (
      "id" int4 NOT NULL DEFAULT nextval('truck_working_zone_seq'::regclass),
      "truck_id" int4 NOT NULL,
      "region" int4,
      "province" int4,
      "created_at" timestamp(0) DEFAULT CURRENT_TIMESTAMP,
      "updated_at" timestamp(0) DEFAULT CURRENT_TIMESTAMP,
      "created_user" varchar(254) DEFAULT NULL::character varying,
      "updated_user" varchar(254) DEFAULT NULL::character varying,
      "is_deleted" bool NOT NULL DEFAULT false,
      PRIMARY KEY ("id")
  );`;

  await connectTo.query(sqlCreateFavoriteSeq);
  await connectTo.query(sqlCreateFavorite);

  await connectTo.query(sqlCreateTruckSeq);
  await connectTo.query(sqlDropTruckEnum);
  await connectTo.query(sqlCreateTruckEnum);
  await connectTo.query(sqlCreateTruck);

  await connectTo.query(sqlCreateTruckPhotoSeq);
  await connectTo.query(sqlCreateTruckPhoto);

  await connectTo.query(sqlCreateTruckWorkingZoneSeq);
  await connectTo.query(sqlCreateTruckWorkingZone);
};

const addDocumentColumnToTruck = async () => {
  const clientTo = new Pool(newConnection);
  const connectTo = await clientTo.connect();



  const sqlAddDocument = `ALTER TABLE truck ADD document jsonb NULL;`

  const sqlDropEnumDocumentStatus = `DROP TYPE IF EXISTS document_status_enum;`
  const sqlAddEnumDocumentStatus = `CREATE TYPE document_status_enum AS ENUM ('NO_DOCUMENT', 'WAIT_FOR_VERIFIED', 'VERIFIED', 'REJECTED');`

  const sqlAddDocumentStatusColumn = `alter table truck ADD document_status VARCHAR NULL;`
  const sqlChangeDefaultDocumentStatus = `ALTER TABLE truck
  ALTER COLUMN document_status DROP DEFAULT,
  ALTER COLUMN document_status
    SET DATA TYPE document_status_enum
    USING document_status::text::document_status_enum,
  ALTER COLUMN document_status SET DEFAULT 'NO_DOCUMENT';`
  const sqlUpdateDefaultDocumentStatusIfNull = `update truck set document_status='NO_DOCUMENT' where document_status ISNULL;`



  await connectTo.query(sqlAddDocument);
  await connectTo.query(sqlDropEnumDocumentStatus);
  await connectTo.query(sqlAddEnumDocumentStatus);
  await connectTo.query(sqlAddDocumentStatusColumn);
  await connectTo.query(sqlChangeDefaultDocumentStatus);
  await connectTo.query(sqlUpdateDefaultDocumentStatusIfNull);

  console.log("Finish add document column !!")
  return true
}

const TruckNewModel = sql.define({
  name: 'truck',
  columns: [
    'id',
    'name',
    'carrier_id',
    'registration_number',
    'loading_weight',
    'truck_type',
    'approve_status',
    'approve_date',
    'group_truck_type',
    'is_tipper',
    'stall_height',
    'is_deleted',
    'created_at',
    'updated_at',
    'created_user',
    'updated_user',
    'created_from',
  ],
});

const runTruck = async () => {
  const client = new Pool(oldConnection);

  const clientNew = new Pool(newConnection);

  const connect = await client.connect();
  const connectNew = await clientNew.connect();

  // type : array
  const { rows: oldTruck } = await connect.query(`SELECT * FROM dtb_truck;`);

  console.log('Olf Truck :: ', oldTruck);
  // type :  array
  const newTruck = oldTruck.map((tr) => ({
    id: tr['id'],
    name: tr['name'],
    carrier_id: tr['carrier_id'],
    registration_number: tr['registration_number'],
    loading_weight: tr['loading_weight'],
    truck_type: tr['truck_type'],
    approve_status: tr['approve_status'] == 0 ? 'INACTIVE' : 'ACTIVE',
    approve_date: tr['approve_date'],
    group_truck_type: tr['group_truck_type'],
    is_tipper: tr['is_tipper'],
    stall_height: tr['stall_height'],
    is_deleted: tr['is_deleted'],
    created_at: tr['created_at'],
    updated_at: tr['updated_at'],
    created_user: tr['created_user'],
    updated_user: tr['updated_user'],
    created_from: tr['created_from'],
  }));

  const rowQueryUserRole = TruckNewModel.insert(newTruck).toQuery();
  await connectNew.query(rowQueryUserRole);
};

const TruckWorkingZoneModel = sql.define({
  name: 'truck_working_zone',
  columns: [
    'id',
    'truck_id',
    'region',
    'province',
    'is_deleted',
    'created_at',
    'updated_at',
    'created_user',
    'updated_user',
  ],
});

const runTruckWorkingZone = async () => {
  const client = new Pool(oldConnection);

  const clientNew = new Pool(newConnection);

  const connect = await client.connect();
  const connectNew = await clientNew.connect();

  // type : array
  const { rows: oldTruckWorkingZone } = await connect.query(`SELECT * FROM dtb_truck_working_zone;`);

  // type :  array
  const newTruckWorking = oldTruckWorkingZone.map((tr) => ({
    id: tr['id'],
    truck_id: tr['truck_id'],
    region: tr['region'],
    province: tr['province'],
    is_deleted: tr['is_deleted'],
    created_at: tr['created_at'],
    updated_at: tr['updated_at'],
    created_user: tr['created_user'],
    updated_user: tr['updated_user'],
  }));

  const rowQueryUserRole = TruckWorkingZoneModel.insert(newTruckWorking).toQuery();
  await connectNew.query(rowQueryUserRole);
};

const TruckPhotoModel = sql.define({
  name: 'truck_photo',
  columns: [
    'id',
    'truck_id',
    'photo_name',
    'is_deleted',
    'type',
    'created_at',
    'updated_at',
    'created_user',
    'updated_user',
  ],
});

const runTruckPhoto = async () => {
  const client = new Pool(oldConnection);

  const clientNew = new Pool(newConnection);

  const connect = await client.connect();
  const connectNew = await clientNew.connect();

  // type : array
  const { rows: oldTruckWorkingZone } = await connect.query(`SELECT * FROM dtb_truck_photo;`);

  // type :  array
  const newTruckWorking = oldTruckWorkingZone.map((tr) => ({
    id: tr['id'],
    truck_id: tr['truck_id'],
    photo_name: tr['photo_name'],
    is_deleted: tr['is_deleted'],
    type: tr['type'],
    created_at: tr['created_at'],
    updated_at: tr['updated_at'],
    created_user: tr['created_user'],
    updated_user: tr['updated_user'],
  }));

  const rowQueryUserRole = TruckPhotoModel.insert(newTruckWorking).toQuery();
  await connectNew.query(rowQueryUserRole);
};

const TruckFavoriteModel = sql.define({
  name: 'favorite',
  columns: [
    'id',
    'user_id',
    'truck_id',
    'version',
    'is_deleted',
    'created_at',
    'updated_at',
    'created_user',
    'updated_user',
  ],
});

const runTruckFavorite = async () => {
  const client = new Pool(oldConnection);

  const clientNew = new Pool(newConnection);

  const connect = await client.connect();
  const connectNew = await clientNew.connect();

  // type : array
  const { rows: oldTruckFavorite } = await connect.query(
    `SELECT * FROM dtb_favorite_truck_job WHERE truck_id is not null;`
  );
  console.log('Old Favorite truck :> ', oldTruckFavorite);
  // type :  array
  const newTruckFavorite = oldTruckFavorite.map((tr) => ({
    id: tr['id'],
    user_id: tr['user_id'],
    truck_id: tr['truck_id'],
    version: tr['version'],
    is_deleted: tr['is_deleted'],
    created_at: tr['created_at'],
    updated_at: tr['updated_at'],
    created_user: tr['created_user'],
    updated_user: tr['updated_user'],
  }));

  const rowQueryTruckFavorite = TruckFavoriteModel.insert(newTruckFavorite).toQuery();
  await connectNew.query(rowQueryTruckFavorite);
};

const createExtendsion = async () => {
  const connectNew = new Pool(newConnection);
  const connectNewDB = await connectNew.connect();
  const sqlCreateExtensionDblink = `CREATE EXTENSION IF NOT EXISTS dblink;`;

  const sqlCreateExtensionFdw = `CREATE EXTENSION IF NOT EXISTS postgres_fdw;`;

  const sqlCreateDblinkConnect = `GRANT EXECUTE ON FUNCTION dblink_connect(text) TO public;`;

  const sqlCreateUserService = `CREATE server userserver foreign data wrapper postgres_fdw
OPTIONS (dbname 'user_service', host '${process.env.DB_HOST}');`;

  const sqlCreateUserMapping = `CREATE USER MAPPING FOR "public"
SERVER userserver OPTIONS (user '${process.env.DB_USERNAME}', password '${process.env.DB_PASSWORD}');`;

  const sqlCreateBookingService = `CREATE server bookingservice foreign data wrapper postgres_fdw
  OPTIONS (dbname 'booking_service', host '${process.env.DB_HOST}');`;

  const sqlCreateBookingMapping = `CREATE USER MAPPING FOR "public"
  SERVER bookingservice OPTIONS(user '${process.env.DB_USERNAME}', password '${process.env.DB_PASSWORD}');`;

  await connectNewDB.query(sqlCreateExtensionDblink);
  await connectNewDB.query(sqlCreateExtensionFdw);
  await connectNewDB.query(sqlCreateDblinkConnect);
  await connectNewDB.query(sqlCreateUserService);
  await connectNewDB.query(sqlCreateUserMapping);
  await connectNewDB.query(sqlCreateBookingService);
  await connectNewDB.query(sqlCreateBookingMapping);
};

const createView = async () => {
  const connectNew = new Pool(newConnection);
  const connectNewDB = await connectNew.connect();

  const sqlCreateViewMyTruck = `CREATE VIEW vw_my_truck AS 
  SELECT truck.id,
  truck.approve_status,
  truck.loading_weight,
  string_to_array(truck.registration_number::text, ','::text) AS registration_number,
  truck.stall_height,
  ( SELECT count(*) AS count
         FROM dblink('bookingservice'::text, 'SELECT id,truck_id,requester_type,accepter_user_id,status FROM booking'::text) book2(id integer, truck_id integer, requester_type text, accepter_user_id integer, status text)
        WHERE book2.truck_id = truck.id AND book2.requester_type = 'JOB_OWNER'::text AND book2.status = 'WAITING'::text) AS quotation_number,
  truck.is_tipper AS tipper,
  truck.truck_type,
  truck.created_at,
  truck.updated_at,
  truck.carrier_id,
      CASE
          WHEN (array_agg(wr.region))[1] IS NOT NULL THEN json_agg(json_build_object('region', wr.region, 'province', wr.province))
          ELSE COALESCE('[]'::json)
      END AS work_zone,
  truck.document,
  truck.document_status
 FROM truck truck
   LEFT JOIN truck_working_zone wr ON wr.truck_id = truck.id
GROUP BY truck.id;`;

  const sqlCreateViewMyTruckId = `CREATE VIEW vw_my_truck_id AS 
SELECT truck.id,
truck.approve_status,
truck.loading_weight,
string_to_array(truck.registration_number::text, ','::text) AS registration_number,
truck.stall_height,
( SELECT count(*) AS count
       FROM dblink('bookingservice'::text, 'SELECT id,truck_id,requester_type,accepter_user_id,status FROM booking'::text) book2(id integer, truck_id integer, requester_type text, accepter_user_id integer, status text)
      WHERE book2.truck_id = truck.id AND book2.requester_type = 'JOB_OWNER'::text AND book2.status = 'WAITING'::text) AS quotation_number,
    CASE
        WHEN truck.id = bookv.truck_id THEN json_agg(json_build_object('id', bookv.id, 'avatar', bookv.avatar, 'fullname', bookv.fullname, 'bookingdatetime', bookv.bookingdatetime))
        ELSE COALESCE('[]'::json)
    END AS quotations,
truck.is_tipper AS tipper,
truck.truck_type,
truck.created_at,
truck.updated_at,
( SELECT json_object_agg(
            CASE
                WHEN tp.type = 1 THEN 'front'::text
                WHEN tp.type = 2 THEN 'back'::text
                WHEN tp.type = 3 THEN 'left'::text
                WHEN tp.type = 4 THEN 'right'::text
                ELSE 'none'::text
            END, tp.photo_name) AS truck_photos
       FROM truck_photo tp
      WHERE tp.truck_id = truck.id) AS truck_photos,
truck.carrier_id,
    CASE
        WHEN (array_agg(wr.region))[1] IS NOT NULL THEN json_agg(json_build_object('region', wr.region, 'province', wr.province))
        ELSE COALESCE('[]'::json)
    END AS work_zone,
    truck.document,
    truck.document_status
FROM truck truck
 LEFT JOIN truck_working_zone wr ON wr.truck_id = truck.id
 LEFT JOIN dblink('bookingservice'::text, 'SELECT id,truck_id,avatar,fullname,bookingdatetime,status FROM vw_job_booking_truck_list'::text) bookv(id integer, truck_id integer, avatar json, fullname text, bookingdatetime text, status text) ON bookv.truck_id = truck.id AND bookv.status = 'WAITING'::text
GROUP BY truck.id, bookv.truck_id, bookv.status;`;

  const sqlCreateViewTruckDetails = `CREATE VIEW vw_truck_details AS 
SELECT truck.id,
truck.approve_status,
truck.loading_weight,
string_to_array(truck.registration_number::text, ','::text) AS registration_number,
truck.stall_height,
truck.is_tipper AS tipper,
truck.truck_type,
truck.created_at,
truck.updated_at,
truck.carrier_id,
( SELECT json_object_agg(
            CASE
                WHEN tp.type = 1 THEN 'front'::text
                WHEN tp.type = 2 THEN 'back'::text
                WHEN tp.type = 3 THEN 'left'::text
                WHEN tp.type = 4 THEN 'right'::text
                ELSE 'none'::text
            END, tp.photo_name) AS truck_photos
       FROM truck_photo tp
      WHERE tp.truck_id = truck.id) AS truck_photos,
    CASE
        WHEN (array_agg(wr.region))[1] IS NOT NULL THEN json_agg(json_build_object('region', wr.region, 'province', wr.province))
        ELSE COALESCE('[]'::json)
    END AS work_zone,
json_build_object('id', usr.id, 'fullName', usr.fullname, 'companyName', usr.fullname, 'email', usr.email, 'mobileNo', usr.phone_number, 'avatar', json_build_object('object', usr.avatar)) AS owner,
truck.created_from
FROM truck truck
 LEFT JOIN truck_working_zone wr ON wr.truck_id = truck.id
 LEFT JOIN dblink('userserver'::text, 'SELECT id,email,fullname,phone_number,avatar FROM user_profile'::text) usr(id integer, email text, fullname text, phone_number text, avatar text) ON usr.id = truck.carrier_id
GROUP BY truck.id, usr.id, usr.email, usr.fullname, usr.phone_number, usr.avatar;`;

  const sqlCreateViewTruckFavorite = `CREATE VIEW vw_truck_favorite AS 
SELECT truck.id,
fav.user_id,
truck.approve_status,
truck.loading_weight,
string_to_array(truck.registration_number::text, ','::text) AS registration_number,
truck.stall_height,
truck.is_tipper AS tipper,
truck.truck_type,
truck.created_at,
truck.updated_at,
truck.carrier_id,
json_build_object('id', usr.id, 'fullName', usr.fullname, 'companyName', usr.fullname, 'email', usr.email, 'mobileNo', usr.phone_number, 'avatar', json_build_object('object', usr.avatar)) AS owner,
    CASE
        WHEN (array_agg(wr.region))[1] IS NOT NULL THEN json_agg(json_build_object('region', wr.region, 'province', wr.province))
        ELSE COALESCE('[]'::json)
    END AS work_zone
FROM favorite fav
 LEFT JOIN truck truck ON truck.id = fav.truck_id
 LEFT JOIN truck_working_zone wr ON wr.truck_id = truck.id
 LEFT JOIN dblink('userserver'::text, 'SELECT id,email,fullname,phone_number,avatar FROM user_profile'::text) usr(id integer, email text, fullname text, phone_number text, avatar text) ON usr.id = truck.carrier_id
GROUP BY fav.user_id, truck.id, usr.id, usr.email, usr.fullname, usr.phone_number, usr.avatar;`;

  const sqlCreateViewTruckList = `CREATE VIEW vw_truck_list AS 
SELECT truck.id,
truck.approve_status,
truck.loading_weight,
string_to_array(truck.registration_number::text, ','::text) AS registration_number,
truck.stall_height,
( SELECT count(*) AS count
       FROM dblink('bookingservice'::text, 'SELECT id,truck_id,requester_type,accepter_user_id FROM booking'::text) book2(id integer, truck_id integer, requester_type text, accepter_user_id integer)
      WHERE book2.truck_id = truck.id AND book2.requester_type = 'JOB_OWNER'::text) AS quotation_number,
truck.is_tipper AS tipper,
truck.truck_type,
truck.created_at,
truck.updated_at,
truck.carrier_id,
json_build_object('id', usr.id, 'fullName', usr.fullname, 'companyName', usr.fullname, 'email', usr.email, 'mobileNo', usr.phone_number, 'avatar', json_build_object('object', usr.avatar)) AS owner,
    CASE
        WHEN (array_agg(wr.region))[1] IS NOT NULL THEN json_agg(json_build_object('region', wr.region, 'province', wr.province))
        ELSE COALESCE('[]'::json)
    END AS work_zone
FROM truck truck
 LEFT JOIN truck_working_zone wr ON wr.truck_id = truck.id
 LEFT JOIN dblink('userserver'::text, 'SELECT id,email,fullname,phone_number,avatar FROM user_profile'::text) usr(id integer, email text, fullname text, phone_number text, avatar text) ON usr.id = truck.carrier_id
GROUP BY truck.id, usr.id, usr.email, usr.fullname, usr.phone_number, usr.avatar;`;

  await connectNewDB.query(sqlCreateViewMyTruck);
  await connectNewDB.query(sqlCreateViewMyTruckId);
  await connectNewDB.query(sqlCreateViewTruckDetails);
  await connectNewDB.query(sqlCreateViewTruckFavorite);
  await connectNewDB.query(sqlCreateViewTruckList);
  console.log('Finish Create View  !!');
  return true;
};

const updateCarrierIdGroupNewUser = async () => {
  const clientUserService = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: newDBUser,
    port: process.env.DB_PORT,
  });

  const clientTruckService = new Pool(newConnection);

  const sqlSelectBackupUserId = `SELECT current_user_id, user_ids FROM backup_user_id;`;

  const connectUserService = await clientUserService.connect();
  const newTruckConnection = await clientTruckService.connect();

  const { rows: backupUserId } = await connectUserService.query(sqlSelectBackupUserId);

  for (const attr of backupUserId) {
    await newTruckConnection.query(`UPDATE truck
      SET carrier_id = ${attr.current_user_id}
      WHERE carrier_id = ANY(ARRAY[${attr.user_ids}])`);
  }

  console.log('Finished');
  return true;
};

const getNewTruckType = (oldTruckType) => {
  if (oldTruckType == 3) return 9;
  // oldName: รถ 6 ล้อตู้คอก
  else if (oldTruckType == 7) return 2;
  // oldName: รถกระบะ 4 ล้อพื้นเรียบ
  else if (oldTruckType == 8) return 21;
  // oldName: รถ 10 ล้อ เครน
  else if (oldTruckType == 10) return 27;
  // oldName: รถบรรทุกรถ
  else if (oldTruckType == 13) return 12;
  // oldName: รถบรรทุกของเหลว 6 ล้อ
  else if (oldTruckType == 14) return 18;
  // oldName: รถ 10 ล้อ เคมีภัณฑ์
  else if (oldTruckType == 15) return 29;
  // oldName: อื่นๆ
  else if (oldTruckType == 17) return 4;
  // oldName: รถกระบะ 4 ล้อตู้ทึบ
  else if (oldTruckType == 18) return 5;
  // oldName: รถกระบะ 4 ล้อ ห้องเย็น
  else if (oldTruckType == 19) return 6;
  // oldName: รถกระบะ 4 ล้อหลังคาสูงทึบ
  else if (oldTruckType == 21) return 10;
  // oldName: รถ 6 ล้อ ตู้ทึบ
  else if (oldTruckType == 22) return 7;
  // oldName: รถ 6 ล้อพื้นเรียบ
  else if (oldTruckType == 23) return 28;
  // oldName: รถบรรทุกจักรยานยนต์
  else if (oldTruckType == 24) return 8;
  // oldName: รถ 6 ล้อ กระบะ
  else if (oldTruckType == 25) return 11;
  // oldName: รถ 6 ล้อ ห้องเย็น
  else if (oldTruckType == 26) return 15;
  // oldName: รถ 10 ล้อคอก
  else if (oldTruckType == 27) return 16;
  // oldName: รถ 10 ล้อ ตู้ทึบ
  else if (oldTruckType == 28) return 14;
  // oldName: รถ 10 ล้อ พื้นเรียบ
  else if (oldTruckType == 29) return 19;
  // oldName: รถ 10 ล้อบรรทุกของเหลว
  else if (oldTruckType == 30) return 17;
  // oldName: รถ10 ล้อ ห้องเย็น
  else if (oldTruckType == 31) return 22;
  // oldName: รถเทรลเลอร์ พื้นเรียบ
  else if (oldTruckType == 33) return 25;
  // oldName: รถ 10 ล้อ พ่วงตู้ทึบ
  else if (oldTruckType == 34) return 26;
  // oldName: รถ 10 ล้อ พ่วง ห้องเย็น
  else if (oldTruckType == 36) return 24;
  // oldName: รถ 10 ล้อ พ่วงคอก
  else if (oldTruckType == 37) return 31;
  // oldName: รถหัวลาก ตู้ทึบ
  else if (oldTruckType == 38) return 32;
  // oldName: รถหัวลาก ห้องเย็น
  else if (oldTruckType == 39) return 13;
  // oldName: รถ 6 ล้อ เครน
  else if (oldTruckType == 40) return 1;
  // oldName: รถกระบะ 4 ล้อ
  else if (oldTruckType == 41) return 20;
  // oldName: รถ 10 ล้อ บรรทุกน้ำมัน
  else if (oldTruckType == 42) return 23;
  // oldName: รถเทรลเลอร์คอก
  else if (oldTruckType == 48) return 30;
  // oldName: รถหัวลาก
  else if (oldTruckType == 49) return 3;
  // oldName: รถกระบะ 4 ล้อ คอก
  else return 1;
};
const mapNewTruckType = async () => {
  const clientTruckService = new Pool(newConnection);
  const newTruckConnection = await clientTruckService.connect();
  const { rows: RowTruck } = await newTruckConnection.query(`SELECT * FROM truck;`);

  for (const attr of RowTruck) {
    const newTruckType = getNewTruckType(attr.truck_type);
    await newTruckConnection.query(`UPDATE truck
      SET truck_type = ${newTruckType}
      WHERE id = ${attr.id} and truck_type = ${attr.truck_type}`);
  }

  console.log('Finished');
  return true;
};

const updateSequenceAllTable = async () => {
  const clientTruckService = new Pool(newConnection);
  const newTruckConnection = await clientTruckService.connect();

  const sqlUpdateSeqTruck = `SELECT setval('truck_seq', (select count(*) from truck), true);`;
  const sqlUpdateSeqTruckPhoto = `SELECT setval('truck_photo_seq', (select count(*) from truck_photo), true);`;
  const sqlUpdateSeqTruckWorkingZone = `SELECT setval('truck_working_zone_seq', (select count(*) from truck_working_zone), true);`;
  const sqlUpdateSeqFavorite = `SELECT setval('favorite_seq', (select count(*) from favorite), true);`;
  //
  await newTruckConnection.query(sqlUpdateSeqTruck);
  await newTruckConnection.query(sqlUpdateSeqTruckPhoto);
  await newTruckConnection.query(sqlUpdateSeqTruckWorkingZone);
  await newTruckConnection.query(sqlUpdateSeqFavorite);
  console.log('Update seq all table finish !!');
  return true;
};

const processRegistration = (registration) => {
  const newRegistration = registration.replace(/[@/]+/g, ',');
  return newRegistration;
};
const parseRegistrationNumber = async () => {
  const clientTruckService = new Pool(newConnection);
  const newTruckConnection = await clientTruckService.connect();

  const { rows: RowTruck } = await newTruckConnection.query(`SELECT * FROM truck;`);

  for (const attr of RowTruck) {
    const newRegistration = processRegistration(attr.registration_number);
    await newTruckConnection.query(`UPDATE truck
      SET registration_number = '${newRegistration}'
      WHERE id = ${attr.id}`);
  }

  console.log('Finished update registration');
  return true;
};

const generateToken = (userId) => {
  const hashids = new Hashids(salt, 8, alphabet);
  const id = hashids.encode(userId);
  return jwt.sign(
    {
      sub: 'db98d3b0-5540-41b5-ad02-3f0eacb0e57c',
      roles: 'Admin|Driver',
      iss: 'https://cognito-idp.ap-southeast-1.amazonaws.com/ap-southeast-1_hIWBSYz7z',
      'cognito:username': 'db98d3b0-5540-41b5-ad02-3f0eacb0e57c',
      'custom:userId': id,
      origin_jti: '657b04a4-9ada-40ff-8fa7-1c5d51a59d34',
      aud: '4qkd14u6na0fo1tfhtrdari41i',
      event_id: 'bc81717a-0a24-4ba0-a39b-fa8ee2733907',
      token_use: 'id',
      jti: '9383cc14-f293-494d-9b94-3f096225d1e7',
      auth_time: Math.floor(new Date() / 1000),
      exp: Math.floor((new Date() + 100000) / 1000),
      iat: Math.floor(new Date() / 1000),
    },
    'JDbHwbVvTEgs9uRxEV6cCA3gdMmgSLJ8Da4lTfjAip8=',
    { algorithm: 'HS512' }
  );
};
const migrationImage = async () => {
  const clientNew = new Pool(newConnection);

  const connectNew = await clientNew.connect();

  // type : array
  const { rows: Truck } = await connectNew.query(`SELECT * FROM truck`);
  const { rows: TruckPhoto } = await connectNew.query(`SELECT * FROM truck_photo`);

  // type :  array
  const mappingTruckPhoto = await Promise.all(
    TruckPhoto.map(async (trp) => {
      const findTruckCarrier = Truck.find((e) => e.id == trp.id);
      const carrier_id = findTruckCarrier.carrier_id || null;
      if (carrier_id) {
        const authorization = generateToken(carrier_id);
        if (trp.photo_name.includes('staging.') || trp.photo_name.includes('trucking.')) {
          console.log('Url ::  ', trp.photo_name);
          const getImage = await axios.get(trp.photo_name, { headers: { Authorization: authorization || '' } });
          console.log('Image :: ', getImage.data);
        }
      }
    })
  );

  return true;
};

const main = async () => {
  try {
    await createExtendsion();
    await createTable();
    await addDocumentColumnToTruck();

    await createView();

    await runTruck();
    await runTruckWorkingZone();
    await runTruckPhoto();
    await runTruckFavorite();
    await updateCarrierIdGroupNewUser();
    await mapNewTruckType();
    await updateSequenceAllTable();

    await parseRegistrationNumber();
    // await migrationImage()
    return true;
  } catch (error) {
    throw error;
  }
};
main();
