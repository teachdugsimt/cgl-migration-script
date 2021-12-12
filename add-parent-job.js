
require('dotenv').config();
const { Pool } = require('pg');
const sql = require('sql');

const newConnection = {
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'job_service',
    port: process.env.DB_PORT,
};

const addJobParent = async () => {
    const connectNew = new Pool(newConnection)
    const connectNewDB = await connectNew.connect();

    // ** ADD COLUMN
    const sqlAddColumn = `ALTER TABLE job
      ADD COLUMN family jsonb;`

    const sqlCreateViewJobListV2 = `CREATE OR REPLACE VIEW vw_job_list_v2 AS  SELECT j.id,
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
    j.public_as_cgl,
    json_agg(json_build_object('name', s.address_dest, 'dateTime', s.delivery_datetime, 'contactName', s.fullname_dest, 'contactMobileNo', s.phone_dest, 'lat', s.latitude_dest::character varying, 'lng', s.longitude_dest::character varying)) AS shipments,
    j.full_text_search,
    j.created_at,
    j.family
   FROM job j
     LEFT JOIN shipment s ON s.job_id = j.id
  GROUP BY j.id, j.user_id, j.product_type_id, j.product_name, j.truck_type, j.total_weight, j.truck_amount, j.loading_address, j.loading_datetime, j.loading_contact_name, j.loading_contact_phone, j.loading_latitude, j.loading_longitude, j.status, j.offered_total, j.price_type, j.tipper, j.is_deleted, j.full_text_search, j.public_as_cgl, j.family, j.created_at;`

    await connectNewDB.query(sqlAddColumn);
    await connectNewDB.query(sqlCreateViewJobListV2);
    console.log("Finished")
    return true;
}

const main = async () => {
    try {
        await addJobParent()
    } catch (error) {
        console.log("Error addtransportationv2 :: ", error)
    }
}
main()