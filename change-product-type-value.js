require('dotenv').config();
const { Pool } = require('pg');
const sql = require('sql');

const ProductTypeModel = sql.define({
  name: 'product_type',
  columns: ['name_th', 'name_en', 'image'],
});

const newProductType = [
  { name_th: 'วัสดุก่อสร้าง', name_en: 'Construction', image: '1construction' },
  { name_th: 'สินค้าเกษตร', name_en: 'Agricultural', image: '2agricultural' },
  { name_th: 'สินค้าอุปโภค / บริโภค', name_en: 'Consumer', image: '4consumer' },
  { name_th: 'เครื่องจักรอัตโนมัติ (Auto Machine)', name_en: 'Auto Machine', image: '8machinery' },
  { name_th: 'เคมี', name_en: 'Chemical', image: '10chemical' },
  { name_th: 'เชื้อเพลิง', name_en: 'Fuel', image: '12oil' },
  { name_th: 'อื่นๆ', name_en: 'Other', image: '16many' },
];

const run = async () => {
  // const clientMst = new Pool({
  //   host: process.env.DB_HOST,
  //   user: process.env.DB_USERNAME,
  //   password: process.env.DB_PASSWORD,
  //   database: 'master_data_service',
  //   port: process.env.DB_PORT,
  // });
  const clientMst = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'master_data_service',
    port: process.env.DB_PORT,
  });
  const clientJob = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'job_service',
    port: process.env.DB_PORT,
  });

  const connectMst = await clientMst.connect();
  const connectJob = await clientJob.connect();

  await connectMst.query(`TRUNCATE product_type RESTART IDENTITY;`);
  await connectMst.query(
    `SELECT setval('product_type_seq', COALESCE((SELECT MAX(id)+1 FROM product_type), 1), false);`
  );
  // product_type_id_seq dev
  // product_type_seq stg

  const rowQueryProductType = ProductTypeModel.insert(newProductType).toQuery();
  await connectMst.query(rowQueryProductType);

  const { rows: productTypeIds } = await connectMst.query(`SELECT id FROM product_type ORDER BY id;`);

  await Promise.all(
    productTypeIds.map(async (prod) => {
      const condition = [];
      if (prod.id === 1) {
        condition.push(1, 23, 13);
      } else if (prod.id === 2) {
        condition.push(2, 9);
      } else if (prod.id === 3) {
        condition.push(3, 4, 5, 6, 14, 15, 17, 18, 19, 20, 24);
      } else if (prod.id === 4) {
        condition.push(7, 8, 22, 25);
      } else if (prod.id === 5) {
        condition.push(10, 11, 21);
      } else if (prod.id === 6) {
        condition.push(12);
      } else if (prod.id === 7) {
        condition.push(16);
      } else {
        throw new Error('id not match');
      }
      await connectJob.query(
        `UPDATE job SET product_type_id = ${prod.id * 100} WHERE product_type_id IN(${condition});`
      );
      console.log('Updated!!');
    })
  );

  console.log('Continue ...');

  await connectJob.query(`UPDATE job SET product_type_id = product_type_id / 100;`);

  console.log('Finished !!');
};

run();
