require('dotenv').config();
const axios = require('axios');
const { Pool } = require('pg');
const sql = require('sql');

const FavoriteModel = sql.define({
  name: 'favorite',
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

const sqlCreateNewTblFavorite = `CREATE TABLE favorite (
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

const sqlCreateViewFavoriteJob = `CREATE VIEW vw_favorite_job AS
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
	JSON_BUILD_OBJECT('id', usr.id, 'fullName', usr.fullname, 'email', usr.email, 'mobileNo', usr.phone_number, 'avatar', JSON_BUILD_OBJECT('object', usr.avatar)) AS owner,
	JSON_AGG(JSON_BUILD_OBJECT('name', s.address_dest, 'dateTime', s.delivery_datetime, 'contactName', s.fullname_dest, 'contactMobileNo', s.phone_dest, 'lat', s.latitude_dest::VARCHAR, 'lng', s.longitude_dest::VARCHAR)) AS shipments,
	f.updated_at AS created_at
FROM
	job j
	LEFT JOIN shipment s ON s.job_id = j.id
	LEFT JOIN favorite f ON f.job_id = j.id
	LEFT JOIN dblink('myserver'::text, 'SELECT id,email,fullname,phone_number,avatar FROM user_profile' ::text) usr (
		id integer,
		email text,
		fullname text,
		phone_number text,
		avatar text) ON usr.id = j.user_id
WHERE 
	f.is_deleted = FALSE
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
	usr.avatar,
	f.updated_at;`;

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
    database: 'job_service',
    port: process.env.DB_PORT,
  });

  const connectFrom = await clientFrom.connect();
  const connectTo = await clientTo.connect();

  await connectTo.query(sqlCreateNewTblFavorite);

  const { rows: oldFavoriteData } = await connectFrom.query(
    `SELECT * FROM dtb_favorite_truck_job WHERE job_id IS NOT NULL;`
  );

  const newFavoriteData = oldFavoriteData.map((favorite) => ({
    user_id: favorite.user_id,
    job_id: +favorite.job_id - 999999,
    version: favorite.version,
    created_at: favorite.created_at,
    updated_at: favorite.updated_at,
    created_user: favorite.created_user,
    updated_user: favorite.updated_user,
    is_deleted: favorite.is_deleted,
  }));

  const rowQueryJob = FavoriteModel.insert(newFavoriteData).toQuery();
  await connectTo.query(rowQueryJob);

  await connectTo.query(sqlCreateViewFavoriteJob);

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
