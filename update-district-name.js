require('dotenv').config();
const { Pool } = require('pg');

const districtDiffTh = [
  {
    oldName: 'บึงกาฬ',
    newName: 'เมืองบึงกาฬ',
  },
  {
    oldName: 'ว่านใหญ่',
    newName: 'หว้านใหญ่',
  },
  {
    oldName: 'ป่าพยอม',
    newName: 'ป่าพะยอม',
  },
  {
    oldName: 'กรงปีนัง',
    newName: 'กรงปินัง',
  },
];

const districtDiffEn = [
  {
    oldName: 'Pom Prap Sattruphai',
    newName: 'Pom Prap Sattru Phai',
  },
  {
    oldName: 'Yannawa',
    newName: 'Yan Nawa',
  },
  {
    oldName: 'Bung Kum',
    newName: 'Bueng Kum',
  },
  {
    oldName: 'Sa Thon',
    newName: 'Sathon',
  },
  {
    oldName: 'Bang Su',
    newName: 'Bang Sue',
  },
  {
    oldName: 'Rat Thewi',
    newName: 'Ratchathewi',
  },
  {
    oldName: 'Watthana',
    newName: 'Vadhana',
  },
  {
    oldName: 'Khanna Yao',
    newName: 'Khan Na Yao',
  },
  {
    oldName: 'Wang Thong Lang',
    newName: 'Wang Thonglang',
  },
  {
    oldName: '',
    newName: 'Thung Khru',
  },
  {
    oldName: 'Thung Khu',
    newName: 'Khlong Luang',
  },
  {
    oldName: 'Chaloem Phra Kiet',
    newName: 'Chaloem Phra Kiat',
  },
  {
    oldName: 'Pleang Yao',
    newName: 'Plaeng Yao',
  },
  {
    oldName: 'Si Khio',
    newName: 'Sikhio',
  },
  {
    oldName: 'Lamtaman Chai',
    newName: 'Lam Thamenchai',
  },
  {
    oldName: 'Non Din Daeng',
    newName: 'Non Suwan',
  },
  {
    oldName: 'Khwao Sinarin',
    newName: 'Khwao Sinrin',
  },
  {
    oldName: 'Boontharik',
    newName: 'Buntharik',
  },
  {
    oldName: 'Lao Suea Kok',
    newName: 'Fang Kham',
  },
  {
    oldName: 'Bueng Kan',
    newName: 'Mueang Bueng Kan',
  },
  {
    oldName: 'Phu Phaman',
    newName: 'Phu Pha Man',
  },
  {
    oldName: 'Nong Saeng',
    newName: 'Nong Han',
  },
  {
    oldName: 'Prachaksinlapakhom',
    newName: 'Prachak Sinlapakhom',
  },
  {
    oldName: 'Pha  Khao',
    newName: 'Pha Khao',
  },
  {
    oldName: 'Yang Sisurat',
    newName: 'Yang Si Surat',
  },
  {
    oldName: 'Phanh khon',
    newName: 'Phang Khon',
  },
  {
    oldName: 'Nikhom Nam un',
    newName: 'Nikhom Nam Un',
  },
  {
    oldName: 'Don Tan',
    newName: 'Dong Luang',
  },
  {
    oldName: 'Kanlayaniwatthana',
    newName: 'Galayani Vadhana',
  },
  {
    oldName: 'Ko kha',
    newName: 'Ko Kha',
  },
  {
    oldName: 'Mueang Phrae',
    newName: 'Rong Kwang',
  },
  {
    oldName: 'Mueang Phayao',
    newName: 'Chun',
  },
  {
    oldName: 'Mueang Phayao',
    newName: 'Chiang Kham',
  },
  {
    oldName: 'Mueang Phayao',
    newName: 'Chiang Muan',
  },
  {
    oldName: 'Mueang Phayao',
    newName: 'Dok Khamtai',
  },
  {
    oldName: 'Mueang Phayao',
    newName: 'Pong',
  },
  {
    oldName: 'Mueang Phayao',
    newName: 'Mae Chai',
  },
  {
    oldName: 'Mueang Phayao',
    newName: 'Phu Sang',
  },
  {
    oldName: 'Mueang Phayao',
    newName: 'Phu Kamyao',
  },
  {
    oldName: 'Phayuha Hkiri',
    newName: 'Phayuha Khiri',
  },
  {
    oldName: 'Mae Pern',
    newName: 'Mae Poen',
  },
  {
    oldName: 'Um Phang',
    newName: 'Umphang',
  },
  {
    oldName: 'Tap Khlo',
    newName: 'Thap Khlo',
  },
  {
    oldName: 'Khao kho',
    newName: 'Khao Kho',
  },
  {
    oldName: 'Mueang Saphan Buri',
    newName: 'Mueang Suphan Buri',
  },
  {
    oldName: 'mueang Nakhon Pathom',
    newName: 'Mueang Nakhon Pathom',
  },
  {
    oldName: 'Chai Buri',
    newName: 'Vibhavadi',
  },
  {
    oldName: 'Papoe',
    newName: 'Kapoe',
  },
  {
    oldName: 'Muaeng Songkhla',
    newName: 'Mueang Songkhla',
  },
  {
    oldName: 'Thung  Wa',
    newName: 'Thung Wa',
  },
  {
    oldName: 'Tak Bai',
    newName: 'Bacho',
  },
];

const sqlUpdateDistrictName = `UPDATE addr_district SET name_in_thai = TRIM(SUBSTRING(name_in_thai, 4)) WHERE name_in_thai LIKE 'เขต%';`;

const run = async () => {
  const client = new Pool({
    host: 'cgl-dev-db.ccyrpfjhgi1v.ap-southeast-1.rds.amazonaws.com',
    user: 'postgres',
    password: '.9^Piv-.KlzZhZm.MU7vXZU7yE9I-4',
    database: 'master_data_service',
    port: process.env.DB_PORT,
  });

  const connect = await client.connect();

  await connect.query(sqlUpdateDistrictName);

  for (const attr of districtDiffTh) {
    await connect.query(
      `UPDATE addr_district SET name_in_thai = '${attr.newName}' WHERE name_in_thai = '${attr.oldName}'`
    );
  }

  for (const attr of districtDiffEn) {
    await connect.query(
      `UPDATE addr_district SET name_in_english = '${attr.newName}' WHERE name_in_english = '${attr.oldName}'`
    );
  }

  console.log('Finished');
  return true;
};

run();
