require('dotenv').config();
const { Pool } = require('pg');
const ObjectsToCsv = require('objects-to-csv');

// const data = [
//   { code: 'CA', name: 'California' },
//   { code: 'TX', name: 'Texas' },
//   { code: 'NY', name: 'New York' },
// ];

// If you use "await", code must be inside an asynchronous function:
(async () => {
  const client = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'truck_service',
    port: process.env.DB_PORT,
  });

  const client2 = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'master_data_service',
    port: process.env.DB_PORT,
  });

  const connect = await client.connect();
  const connect2 = await client2.connect();

  const { rows: truckTypes } = await connect2.query(`SELECT id, name_th FROM truck_type;`);
  const { rows: trucks } = await connect.query(`SELECT * FROM vw_truck_list;`);

  const data = trucks.map((truck) => {
    const temp = {
      ...truck,
      registration_number: truck.registration_number.toString(),
      owner_name: truck.owner ? truck.owner.fullName : '',
      truck_type: truckTypes.find((truckType) => truckType.id === truck.truck_type).name_th,
    };
    delete temp.owner;
    return temp;
  });

  const csv = new ObjectsToCsv(data);

  await csv.toDisk('./truck.csv');

  console.log('Finised!! please control + c to exist');
})();
