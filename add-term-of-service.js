require('dotenv').config();
const { Pool } = require('pg');
const sql = require('sql');

const TermOfService = sql.define({
  name: 'term_of_service',
  columns: [
    'id',
    'version_number',
    'data',
    'is_active',
    'version',
    'created_at',
    'updated_at',
    'created_user',
    'updated_user',
    'is_deleted',
  ],
});

const sqlCreateNewTblTermOfService = `CREATE TABLE "public"."term_of_service" (
  "id" serial,
  "version_number" varchar(50),
  "data" text,
  "is_active" bool NOT NULL DEFAULT true,
  "version" int4 NOT NULL DEFAULT 0,
  "created_at" timestamp(0) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(0) DEFAULT CURRENT_TIMESTAMP,
  "created_user" varchar(254) DEFAULT NULL::character varying,
  "updated_user" varchar(254) DEFAULT NULL::character varying,
  "is_deleted" bool NOT NULL DEFAULT false
);`;

const sqlCreateNewTblTermOfServiceUser = `CREATE TABLE "public"."term_of_service_user" (
  "id" serial,
  "term_of_service_id" int4 NOT NULL,
  "user_id" int4 NOT NULL,
  "version" int4 NOT NULL DEFAULT 0,
  "created_at" timestamp(0) DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp(0) DEFAULT CURRENT_TIMESTAMP,
  "created_user" varchar(254) DEFAULT NULL::character varying,
  "updated_user" varchar(254) DEFAULT NULL::character varying,
  "is_deleted" bool NOT NULL DEFAULT false
);`;

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
    database: 'user_service',
    port: process.env.DB_PORT,
  });

  const connectFrom = await clientFrom.connect();
  const connectTo = await clientTo.connect();

  await connectTo.query(sqlCreateNewTblTermOfService);
  await connectTo.query(sqlCreateNewTblTermOfServiceUser);
  const { rows: tsv } = await connectFrom.query(`SELECT * FROM dtb_term_of_service;`);

  const rowQueryTermOfService = TermOfService.insert(tsv).toQuery();
  await connectTo.query(rowQueryTermOfService);

  console.log('Finished');
  return true;
};

run();
