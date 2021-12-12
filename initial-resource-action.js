require('dotenv').config();
const { Pool } = require('pg');
const sql = require('sql');
const { resourceActionData } = require('./resource-data-new');

const ResourceModel = sql.define({
  name: 'resource',
  columns: ['id', 'name', 'version', 'created_at', 'updated_at', 'created_user', 'updated_user', 'is_deleted'],
});

const ResourceActionModel = sql.define({
  name: 'resource_action',
  columns: ['id', 'role_id', 'resource_id', 'action', 'url'],
});

const sqlCreateNewTblResource = `CREATE TABLE resource (
	id BIGSERIAL PRIMARY KEY,
	name VARCHAR(50),
	version int4 NOT NULL DEFAULT 0,
  created_at timestamp(0) DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp(0) DEFAULT CURRENT_TIMESTAMP,
  created_user varchar(254) DEFAULT NULL::character varying,
  updated_user varchar(254) DEFAULT NULL::character varying,
  is_deleted bool NOT NULL DEFAULT false
);`;

const sqlCreateNewTblResourceAction = `CREATE TABLE resource_action (
	id BIGSERIAL PRIMARY KEY,
	role_id INTEGER,
	resource_id INTEGER,
	action VARCHAR(20),
	url VARCHAR(100)
);`;

const sqlInsertResource = `INSERT INTO resource (name)
VALUES ('USER_MANAGEMENT'),
('JOB_MANAGEMENT'),
('VEHICLE_MANAGEMENT'),
('BOOKING_MANAGEMENT'),
('MESSAGING_MANAGEMENT'),
('MEDIA_MANAGEMENT')
`;

const sqlCreateViewUserRoleResource = `CREATE VIEW vw_user_role_resource AS
SELECT
	ur.id,
	ur.user_id,
	ur.role_id,
	re.id AS resource_id,
	ra.action,
	ra.url
FROM
	user_role ur
	LEFT JOIN ROLE ro ON ro.id = ur.role_id
	LEFT JOIN resource_action ra ON ra.role_id = ur.role_id
	LEFT JOIN resource re ON re.id = ra.resource_id;`;

const run = async () => {
  const client = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'user_service',
    port: process.env.DB_PORT,
  });

  const connect = await client.connect();

  await connect.query(sqlCreateNewTblResource);
  await connect.query(sqlCreateNewTblResourceAction);
  await connect.query(sqlInsertResource);
  await connect.query(sqlCreateViewUserRoleResource);

  const rowQueryResourceAction = ResourceActionModel.insert(resourceActionData).toQuery();
  await connect.query(rowQueryResourceAction);

  console.log('Finished');
};

run();
