require('dotenv').config();
const { Pool } = require('pg');

const sqlCreateExtensionDblink = `CREATE EXTENSION IF NOT EXISTS dblink;`;

const sqlCreateTblAddrDistrict = `CREATE TABLE addr_district AS(
SELECT t1.*
 FROM dblink(
   'dbname=master_data_service user=postgres host=cgl-dev-db.ccyrpfjhgi1v.ap-southeast-1.rds.amazonaws.com password=.9^Piv-.KlzZhZm.MU7vXZU7yE9I-4',
   'select * from addr_district'  
  ) AS t1(
	id INT4,
	code INT4,
	name_in_thai VARCHAR(255),
	name_in_english VARCHAR(255),
	province_id INT4
  )
);`;

const sqlCreateSequenceAddrDistrict = `CREATE SEQUENCE addr_district_seq;`;

const sqlAddPrimaryKeyAddrDistrict = `ALTER TABLE addr_district ADD PRIMARY KEY (id);`;

const sqlAlterSequenceAddrDistrict = `ALTER TABLE addr_district ALTER COLUMN id SET DEFAULT nextval('addr_district_seq');`;

const sqlSetMaxSequenceAddrDistrict = `SELECT setval('addr_district_seq', (SELECT MAX(id) FROM addr_district));`;

const sqlCreateTblAddrProvince = `CREATE TABLE addr_province AS(
SELECT t1.*
 FROM dblink(
   'dbname=master_data_service user=postgres host=cgl-dev-db.ccyrpfjhgi1v.ap-southeast-1.rds.amazonaws.com password=.9^Piv-.KlzZhZm.MU7vXZU7yE9I-4',
   'select * from addr_province'  
  ) AS t1(
	id INT4,
	code INT4,
	name_in_thai VARCHAR(255),
	name_in_english VARCHAR(255),
	zone_id INT4
  )
);`;

const sqlCreateSequenceAddrProvince = `CREATE SEQUENCE addr_province_seq;`;

const sqlAddPrimaryKeyAddrProvince = `ALTER TABLE addr_province ADD PRIMARY KEY (id);`;

const sqlAlterSequenceAddrProvince = `ALTER TABLE addr_province ALTER COLUMN id SET DEFAULT nextval('addr_province_seq');`;

const sqlSetMaxSequenceAddrProvince = `SELECT setval('addr_province_seq', (SELECT MAX(id) FROM addr_province));`;

const sqlCreateTblAddrSubdistrict = `CREATE TABLE addr_subdistrict AS(
SELECT t1.*
 FROM dblink(
   'dbname=master_data_service user=postgres host=cgl-dev-db.ccyrpfjhgi1v.ap-southeast-1.rds.amazonaws.com password=.9^Piv-.KlzZhZm.MU7vXZU7yE9I-4',
   'select * from addr_subdistrict'  
  ) AS t1(
	id INT4,
	name_in_thai VARCHAR(255),
	name_in_english VARCHAR(255),
	latitude FLOAT4,
	longitude FLOAT4,
	district_id INT4,
	zip_code VARCHAR(10)
  )
);`;

const sqlCreateSequenceAddrSubdistrict = `CREATE SEQUENCE addr_subdistrict_seq;`;

const sqlAddPrimaryKeyAddrSubdistrict = `ALTER TABLE addr_subdistrict ADD PRIMARY KEY (id);`;

const sqlAlterSequenceAddrSubdistrict = `ALTER TABLE addr_subdistrict ALTER COLUMN id SET DEFAULT nextval('addr_subdistrict_seq');`;

const sqlSetMaxSequenceAddrSubdistrict = `SELECT setval('addr_subdistrict_seq', (SELECT MAX(id) FROM addr_subdistrict));`;

const sqlCreateTblProductType = `CREATE TABLE product_type AS(
SELECT t1.*
 FROM dblink(
   'dbname=master_data_service user=postgres host=cgl-dev-db.ccyrpfjhgi1v.ap-southeast-1.rds.amazonaws.com password=.9^Piv-.KlzZhZm.MU7vXZU7yE9I-4',
   'select * from product_type'  
  ) AS t1(
	id INT4,
	name_en VARCHAR(255),
	name_th VARCHAR(255),
	image VARCHAR(255)
  )
);`;

const sqlCreateSequenceProductType = `CREATE SEQUENCE product_type_seq;`;

const sqlAddPrimaryKeyProductType = `ALTER TABLE product_type ADD PRIMARY KEY (id);`;

const sqlAlterSequenceProductType = `ALTER TABLE product_type ALTER COLUMN id SET DEFAULT nextval('product_type_seq');`;

const sqlSetMaxSequenceProductType = `SELECT setval('product_type_seq', (SELECT MAX(id) FROM product_type));`;

const sqlCreateTblTruckType = `CREATE TABLE truck_type AS(
SELECT t1.*
 FROM dblink(
   'dbname=master_data_service user=postgres host=cgl-dev-db.ccyrpfjhgi1v.ap-southeast-1.rds.amazonaws.com password=.9^Piv-.KlzZhZm.MU7vXZU7yE9I-4',
   'select * from truck_type'  
  ) AS t1(
	id INT4,
	group_id INT4,
	name_en VARCHAR(255),
	name_th VARCHAR(255),
	image VARCHAR(255)
  )
);`;

const sqlCreateSequenceTblTruckType = `CREATE SEQUENCE truck_type_seq;`;

const sqlAddPrimaryKeyTblTruckType = `ALTER TABLE truck_type ADD PRIMARY KEY (id);`;

const sqlAlterSequenceTblTruckType = `ALTER TABLE truck_type ALTER COLUMN id SET DEFAULT nextval('truck_type_seq');`;

const sqlSetMaxSequenceTblTruckType = `SELECT setval('truck_type_seq', (SELECT MAX(id) FROM truck_type));`;

const sqlCreateTblTruckTypeGroup = `CREATE TABLE truck_type_group AS(
SELECT t1.*
 FROM dblink(
   'dbname=master_data_service user=postgres host=cgl-dev-db.ccyrpfjhgi1v.ap-southeast-1.rds.amazonaws.com password=.9^Piv-.KlzZhZm.MU7vXZU7yE9I-4',
   'select * from truck_type_group'  
  ) AS t1(
	id INT4,
	name_en VARCHAR(255),
	name_th VARCHAR(255)
  )
);`;

const sqlCreateSequenceTruckTypeGroup = `CREATE SEQUENCE truck_type_group_seq;`;

const sqlAddPrimaryKeyTruckTypeGroup = `ALTER TABLE truck_type_group ADD PRIMARY KEY (id);`;

const sqlAlterSequenceTruckTypeGroup = `ALTER TABLE truck_type_group ALTER COLUMN id SET DEFAULT nextval('truck_type_group_seq');`;

const sqlSetMaxSequenceTruckTypeGroup = `SELECT setval('truck_type_group_seq', (SELECT MAX(id) FROM truck_type_group));`;

const sqlCreateTblZone = `CREATE TABLE zone AS(
SELECT t1.*
 FROM dblink(
   'dbname=master_data_service user=postgres host=cgl-dev-db.ccyrpfjhgi1v.ap-southeast-1.rds.amazonaws.com password=.9^Piv-.KlzZhZm.MU7vXZU7yE9I-4',
   'select * from zone'  
  ) AS t1(
	id INT4,
	name_en VARCHAR(255),
	name_th VARCHAR(255)
  )
);`;

const sqlCreateSequenceZone = `CREATE SEQUENCE zone_id_seq;`;

const sqlAddPrimaryZone = `ALTER TABLE zone ADD PRIMARY KEY (id);`;

const sqlAlterSequenceZone = `ALTER TABLE zone ALTER COLUMN id SET DEFAULT nextval('zone_id_seq');`;

const sqlSetMaxSequenceZone = `SELECT setval('zone_id_seq', (SELECT MAX(id) FROM zone));`;

const sqlCreateViewZoneProvinceEn = `CREATE VIEW vw_zone_province_en AS 
SELECT z.id,
z.name_en AS name,
    CASE
        WHEN (array_agg(p.id))[1] IS NOT NULL THEN json_agg(json_build_object('id', p.id, 'name', p.name_in_english))
        ELSE NULL::json
    END AS provinces
FROM zone z
 LEFT JOIN addr_province p ON p.zone_id = z.id
GROUP BY z.id, z.name_en;`;

const sqlCreateViewZoneProvinceTh = `CREATE VIEW vw_zone_province_th AS 
SELECT z.id,
z.name_th AS name,
    CASE
        WHEN (array_agg(p.id))[1] IS NOT NULL THEN json_agg(json_build_object('id', p.id, 'name', p.name_in_thai))
        ELSE NULL::json
    END AS provinces
FROM zone z
 LEFT JOIN addr_province p ON p.zone_id = z.id
GROUP BY z.id, z.name_th;`;

const run = async () => {
  const client = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'master_data_service',
    port: process.env.DB_PORT,
  });

  const connect = await client.connect();

  await connect.query(sqlCreateExtensionDblink);
  await connect.query(sqlCreateTblAddrDistrict);
  await connect.query(sqlCreateSequenceAddrDistrict);
  await connect.query(sqlAddPrimaryKeyAddrDistrict);
  await connect.query(sqlAlterSequenceAddrDistrict);
  await connect.query(sqlSetMaxSequenceAddrDistrict);
  await connect.query(sqlCreateTblAddrProvince);
  await connect.query(sqlCreateSequenceAddrProvince);
  await connect.query(sqlAddPrimaryKeyAddrProvince);
  await connect.query(sqlAlterSequenceAddrProvince);
  await connect.query(sqlSetMaxSequenceAddrProvince);
  await connect.query(sqlCreateTblAddrSubdistrict);
  await connect.query(sqlCreateSequenceAddrSubdistrict);
  await connect.query(sqlAddPrimaryKeyAddrSubdistrict);
  await connect.query(sqlAlterSequenceAddrSubdistrict);
  await connect.query(sqlSetMaxSequenceAddrSubdistrict);
  await connect.query(sqlCreateTblProductType);
  await connect.query(sqlCreateSequenceProductType);
  await connect.query(sqlAddPrimaryKeyProductType);
  await connect.query(sqlAlterSequenceProductType);
  await connect.query(sqlSetMaxSequenceProductType);
  await connect.query(sqlCreateTblTruckType);
  await connect.query(sqlCreateSequenceTblTruckType);
  await connect.query(sqlAddPrimaryKeyTblTruckType);
  await connect.query(sqlAlterSequenceTblTruckType);
  await connect.query(sqlSetMaxSequenceTblTruckType);
  await connect.query(sqlCreateTblTruckTypeGroup);
  await connect.query(sqlCreateSequenceTruckTypeGroup);
  await connect.query(sqlAddPrimaryKeyTruckTypeGroup);
  await connect.query(sqlAlterSequenceTruckTypeGroup);
  await connect.query(sqlSetMaxSequenceTruckTypeGroup);
  await connect.query(sqlCreateTblZone);
  await connect.query(sqlCreateSequenceZone);
  await connect.query(sqlAddPrimaryZone);
  await connect.query(sqlAlterSequenceZone);
  await connect.query(sqlSetMaxSequenceZone);
  await connect.query(sqlCreateViewZoneProvinceEn);
  await connect.query(sqlCreateViewZoneProvinceTh);

  console.log('Finished !!');
};

run();
