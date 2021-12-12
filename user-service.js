require('dotenv').config();
const { Pool } = require('pg');
const ssh2 = require('ssh2');
const sql = require('sql');
const resourceData = require('./resource-data');

let sshConnect = new ssh2();

const pgHost = '127.0.0.1';
const pgPort = 5432;
const proxyPort = 9090;
let ready = false;

const RoleModel = sql.define({
  name: 'role',
  columns: [
    'id',
    'fullname',
    'name',
    'version',
    'created_at',
    'updated_at',
    'created_user',
    'updated_user',
    'is_deleted',
  ],
});

const ResourceModel = sql.define({
  name: 'resource',
  columns: ['id', 'name', 'version', 'created_at', 'updated_at', 'created_user', 'updated_user', 'is_deleted'],
});

const ResourceActionModel = sql.define({
  name: 'resource_action',
  columns: ['id', 'role_id', 'resource_id', 'action', 'url'],
});

const UserRoleActionModel = sql.define({
  name: 'user_role',
  columns: ['id', 'user_id', 'role_id'],
});

const UserModel = sql.define({
  name: 'users',
  columns: [
    'id',
    'confirmation_token',
    'email',
    'enabled',
    'fullname',
    'password',
    'payment_status',
    'contact_person',
    'number_id',
    'phone_number',
    'phone_number_contact',
    'registered_address',
    'tax_code',
    'transaction_address',
    'user_type',
    'type_cargo',
    'token_reset_pass',
    'field_business',
    'field_services',
    'legal_representative',
    'bank_account_name',
    'bank_account_number',
    'bank_name',
    'version',
    'created_at',
    'updated_at',
    'created_user',
    'updated_user',
    'is_deleted',
    'avatar',
    'carrier_id',
    'driver_license_number',
    'platform',
    'device_token',
    'approve_status',
    'approve_date',
    'rating_point',
    'rating_times',
    'payment_method',
    'postpaid_limit',
    'app_language',
    'expiry_date',
    'account_type',
    'sms_verification_sent',
    'postpaid_available',
    'auto_accept_job',
    'multiple_account',
    'driving_license_type',
    'sales_code',
    'parent_id',
    'job_title',
    'pre_approval_account',
    'driving_license_expired_date',
    'document_expired_date',
    'registered_address_no',
    'registered_alley',
    'registered_street',
    'registered_district',
    'registered_province',
    'registered_postcode',
    'transaction_address_no',
    'transaction_alley',
    'transaction_street',
    'transaction_district',
    'transaction_province',
    'transaction_postcode',
    'login_failed_count',
    'is_locked',
    'commission_fee',
    'registered_sub_district',
    'transaction_sub_district',
    'reject_note',
    'proxy',
  ],
});

const resources = ['USER', 'BOOKING', 'TRUCK', 'JOB', 'HISTORY_CALL'];

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

const proxy = require('net').createServer((sock) => {
  if (!ready) return sock.destroy();
  sshConnect.forwardOut(sock.remoteAddress, sock.remotePort, pgHost, pgPort, (err, stream) => {
    if (err) return sock.destroy();
    sock.pipe(stream);
    stream.pipe(sock);
  });
});
proxy.listen(proxyPort, '127.0.0.1');

sshConnect.connect({
  host: '52.221.70.224',
  port: 22,
  username: 'root',
  password: '@n3L!nkioT',
});
sshConnect.on('connect', () => {
  console.log('Connection :: connect');
});
sshConnect.on('ready', async () => {
  ready = true;
  try {
    const clientFrom = new Pool({
      host: pgHost,
      user: 'cargolink',
      password: 'cargolink',
      database: 'cargolink',
      port: proxyPort,
    });

    const clientTo = new Pool({
      host: 'cgl-dev-db.chbn9ns43yos.ap-southeast-1.rds.amazonaws.com',
      user: process.env.DB_USERNAME,
      password: '-syJLEDznOknE^nQO^M-ZGQndH6T_8',
      database: 'user_management',
      port: pgPort,
    });

    const connectFrom = await clientFrom.connect();
    const connectTo = await clientTo.connect();

    const userFrom = await connectFrom.query('SELECT * FROM dtb_user');
    const roleFrom = await connectFrom.query('SELECT * FROM dtb_role');
    const userRoleFrom = await connectFrom.query('SELECT * FROM dtb_user_role');
    // const permissionFrom = await connectFrom.query('SELECT DISTINCT(type) FROM dtb_permission');

    let userRoleUnique = [];
    const userRoleData = [];
    userRoleFrom.rows.map((attr) => {
      userRoleUnique[attr.user_id] = userRoleUnique[attr.user_id] ? userRoleUnique[attr.user_id] + 1 : 1;
      if (userRoleUnique[attr.user_id] <= 2) {
        if (attr.role_id === 1) {
          userRoleData.push(attr);
        } else {
          userRoleData.push({
            user_id: attr.user_id,
            role_id: 8,
          });
        }
      }
    });

    const newDate = new Date();

    const maxRoleId = Math.max(...roleFrom.rows.map((attr) => attr.id));

    const dateNow = newDate.toISOString().replace('T', ' ').slice(0, -5);

    roleFrom.rows.push({
      id: maxRoleId + 1,
      fullname: 'User',
      name: 'ROLE_USER',
      version: 0,
      created_at: dateNow,
      updated_at: dateNow,
      created_user: null,
      updated_user: null,
      is_deleted: false,
    });

    const newResourceData = resourceData.resources;

    const newResourceActionData = resourceData.resourceAction;

    const userQuery = UserModel.insert(userFrom.rows).toQuery();
    await connectTo.query(userQuery);

    const rowQuery = RoleModel.insert(roleFrom.rows).toQuery();
    await connectTo.query(rowQuery);

    const userRoleQuery = UserRoleActionModel.insert(userRoleData).toQuery();
    await connectTo.query(userRoleQuery);

    const resourceQuery = ResourceModel.insert(newResourceData).toQuery();
    await connectTo.query(resourceQuery);

    const resourceActionQuery = ResourceActionModel.insert(newResourceActionData).toQuery();
    await connectTo.query(resourceActionQuery);

    // Set max sequence
    const dbSchema = await connectTo.query(sqlSequence);
    await Promise.all(
      dbSchema.rows.map(async (schema) => {
        await connectTo.query(
          `SELECT setval('${schema.sequence_name}', (SELECT MAX("${schema.column_name}") FROM "${schema.table_name}"))`
        );
      })
    );

    console.log('Finished!!');
    return true;
  } catch (err) {
    console.log('err :>> ', err);
    throw err;
  }
});

/*
typeorm-model-generator -h 127.0.0.1 -d postgres -u postgres -x "@t;ll4RT10032538" -e postgres -o . -s public --ssl
typeorm-model-generator -h cgl-dev-db.chbn9ns43yos.ap-southeast-1.rds.amazonaws.com -d postgres -p 5432 -u postgres -x "'-syJLEDznOknE^nQO^M-ZGQndH6T_8'" -e postgres -o . -s public
typeorm-model-generator -h cgl-dev-db.chbn9ns43yos.ap-southeast-1.rds.amazonaws.com -d postgres -p 5432 -u postgres -x "\"-syJLEDznOknE^nQO^M-ZGQndH6T_8\"" -e postgres -o . -s public
typeorm-model-generator -h cgl-dev-db.chbn9ns43yos.ap-southeast-1.rds.amazonaws.com -d user_management -p 5432 -u postgres -x "\"-syJLEDznOknE^nQO^M-ZGQndH6T_8\"" -e postgres -o . -s public
*/

/*
USER
BOOKING
TRUCK
JOB
HISTORY_CALL
*/
