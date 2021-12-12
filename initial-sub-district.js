require('dotenv').config();
const axios = require('axios');
const { Pool } = require('pg');
const sql = require('sql');

const SubDistrictModel = sql.define({
  name: 'addr_subdistrict',
  columns: ['id', 'name_in_thai', 'name_in_english', 'latitude', 'longitude', 'district_id', 'zip_code'],
});

const replaceName = (name) => name.replaceAll(' ', '');

const run = async () => {
  const url =
    'https://gist.githubusercontent.com/ChaiyachetU/a72a3af3c6561b97883d7af935188c6b/raw/0e9389fa1fc06b532f9081793b3e36db31a1e1c6/thailand.json';
  const { data: subDistrictData } = await axios.default.get(url);

  const client = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'master_data_service',
    port: process.env.DB_PORT,
  });

  const connect = await client.connect();

  const { rows: provinceDistrict } = await connect.query(`SELECT
      d.id AS district_id,
      p.name_in_thai AS province_name,
      (CASE WHEN d.name_in_thai LIKE 'เขต%' THEN SUBSTRING(d.name_in_thai, 4) ELSE d.name_in_thai END) AS district_name
    FROM
      addr_province p
    LEFT JOIN addr_district d ON d.province_id = p.id;`);

  let provinceDistrictMapping = {};

  for (const attr of provinceDistrict) {
    const newProvinceName = replaceName(attr.province_name);
    const newDistrictName = replaceName(attr.district_name);
    const keyName = `${newProvinceName}-${newDistrictName}`.toLocaleLowerCase();
    provinceDistrictMapping[keyName] = attr.district_id;
  }

  // console.log('provinceDistrictMapping :>> ', provinceDistrictMapping);

  const newSubDistrictData = subDistrictData.map((attr) => {
    const newProvinceName = replaceName(attr.province);
    const newDistrictName = replaceName(attr.amphoe);
    const keyName = `${newProvinceName}-${newDistrictName}`.toLocaleLowerCase();
    let districtId = null;
    if (keyName === 'บึงกาฬ-เมืองบึงกาฬ') {
      districtId = 349;
    } else if (keyName === 'มุกดาหาร-หว้านใหญ่') {
      districtId = 518;
    } else if (keyName === 'พัทลุง-ป่าพะยอม') {
      districtId = 894;
    } else if (keyName === 'ยะลา-กรงปินัง') {
      districtId = 915;
    } else {
      districtId = provinceDistrictMapping[keyName];
    }
    return {
      name_in_thai: attr.district,
      name_in_english: attr.districtEng,
      district_id: districtId,
      zip_code: attr.zipcode,
    };
  });

  const rowQuerySubDistrict = SubDistrictModel.insert(newSubDistrictData).toQuery();
  await connect.query(rowQuerySubDistrict);

  console.log('Finished');
  return true;
};

run();
