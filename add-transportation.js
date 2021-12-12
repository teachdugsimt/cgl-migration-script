
require('dotenv').config();
const { Pool } = require('pg');
const sql = require('sql');

const newConnection = {
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'booking_service',
    port: process.env.DB_PORT,
};

const addTransportationV2 = async () => {
    const connectNew = new Pool(newConnection)
    const connectNewDB = await connectNew.connect();
    const sqlCreateTransportationV2 = `CREATE OR REPLACE VIEW vw_transportation_v2 AS SELECT listall.id,
  listall.user_id,
  listall.product_type_id,
  listall.product_name,
  listall.truck_type,
  listall.weight,
  listall.required_truck_amount,
  listall.loading_datetime,
  listall."from",
  listall."to",
  listall.owner,
  listall.trips,
  listall.status,
  listall.tipper,
  listall.price,
  listall.price_type,
  listall.full_text_search
 FROM ( SELECT jc.job_id AS id,
          job.user_id,
          job.product_type_id,
          job.product_name,
          job.truck_type,
          job.weight,
          job.required_truck_amount,
          job.loading_datetime,
          json_build_object('name', job.loading_address, 'dateTime', job.loading_datetime, 'contactName', job.loading_contact_name, 'contactMobileNo', job.loading_contact_phone, 'lat', job.loading_latitude, 'lng', job.loading_longitude)::jsonb AS "from",
          job.shipments AS "to",
          job.owner,
          json_agg(jsonb_build_object('id', trip.id, 'jobCarrierId', jc.id, 'weight', trip.weight, 'price', trip.price, 'status', trip.status, 'createdAt', trip.created_at, 'createdUser', trip.created_user, 'startDate', trip.start_date, 'isDeleted', trip.is_deleted, 'truck', json_build_object('id', trucky.id, 'approveStatus', trucky.approve_status, 'loadingWeight', trucky.loading_weight, 'registrationNumber', trucky.registration_number, 'stallHeight', trucky.stall_height, 'tipper', trucky.tipper, 'truckType', trucky.truck_type, 'createdAt', trucky.created_at, 'updatedAt', trucky.updated_at, 'carrierId', trucky.carrier_id, 'truckPhotos', trucky.truck_photos, 'workZones', trucky.work_zone, 'owner', trucky.owner)))::jsonb AS trips,
          job.status,
          job.tipper,
          job.price,
          job.price_type,
          job.full_text_search
         FROM job_carrier jc
           LEFT JOIN trip trip ON jc.id = trip.job_carrier_id
           LEFT JOIN dblink('jobserver'::text, 'SELECT id,user_id,product_type_id,product_name,truck_type,weight,required_truck_amount,loading_address,loading_datetime,loading_contact_name,loading_contact_phone,loading_latitude,loading_longitude,tipper,price,price_type,owner,shipments,status,full_text_search FROM vw_job_list'::text) job(id integer, user_id integer, product_type_id integer, product_name text, truck_type integer, weight numeric, required_truck_amount integer, loading_address text, loading_datetime timestamp without time zone, loading_contact_name text, loading_contact_phone text, loading_latitude double precision, loading_longitude double precision, tipper boolean, price numeric, price_type text, owner jsonb, shipments jsonb, status text, full_text_search text) ON job.id = jc.job_id
           LEFT JOIN dblink('truckserver'::text, 'SELECT id,approve_status,loading_weight,registration_number,stall_height,tipper,truck_type,created_at,updated_at,carrier_id,truck_photos,work_zone,owner FROM vw_truck_details'::text) trucky(id integer, approve_status text, loading_weight double precision, registration_number text[], stall_height text, tipper boolean, truck_type integer, created_at timestamp without time zone, updated_at timestamp without time zone, carrier_id integer, truck_photos jsonb, work_zone jsonb, owner jsonb) ON trip.truck_id = trucky.id
        GROUP BY jc.job_id, job.id, job.user_id, job.product_type_id, job.product_name, job.truck_type, job.weight, job.required_truck_amount, job.tipper, job.loading_contact_name, job.loading_datetime, job.loading_contact_phone, job.loading_latitude, job.loading_longitude, job.shipments, job.owner, job.price, job.price_type, job.loading_address, job.status, job.full_text_search
      UNION ALL
       SELECT job.id,
          job.user_id,
          job.product_type_id,
          job.product_name,
          job.truck_type,
          job.weight,
          job.required_truck_amount,
          job.loading_datetime,
          json_build_object('name', job.loading_address, 'datetime', job.loading_datetime, 'contact_name', job.loading_contact_name, 'contact_mobile_no', job.loading_contact_phone, 'lat', job.loading_latitude, 'lng', job.loading_longitude)::jsonb AS "from",
          job.shipments AS "to",
          job.owner,
          NULL::jsonb AS jsonb,
          job.status,
          job.tipper,
          job.price,
          job.price_type,
          job.full_text_search
         FROM dblink('jobserver'::text, 'SELECT id,user_id,product_type_id,product_name,truck_type,status,weight,required_truck_amount,loading_address,loading_datetime,loading_contact_name,loading_contact_phone,loading_latitude,loading_longitude,tipper,price,price_type,owner,shipments,full_text_search FROM vw_job_list'::text) job(id integer, user_id integer, product_type_id integer, product_name text, truck_type integer, status text, weight numeric, required_truck_amount integer, loading_address text, loading_datetime timestamp without time zone, loading_contact_name text, loading_contact_phone text, loading_latitude double precision, loading_longitude double precision, tipper boolean, price numeric, price_type text, owner jsonb, shipments jsonb, full_text_search text)
        WHERE NOT (job.id IN ( SELECT job_carrier.job_id
                 FROM job_carrier))
        GROUP BY job.id, job.user_id, job.product_type_id, job.product_name, job.truck_type, job.weight, job.required_truck_amount, job.tipper, job.loading_contact_name, job.loading_datetime, job.loading_contact_phone, job.loading_latitude, job.loading_longitude, job.shipments, job.owner, job.price, job.price_type, job.loading_address, job.status, job.full_text_search) listall
GROUP BY listall.id, listall.trips, listall.user_id, listall.loading_datetime, listall.product_type_id, listall.product_name, listall.truck_type, listall.weight, listall.required_truck_amount, listall."to", listall.owner, listall.price, listall.price_type, listall."from", listall.tipper, listall.status, listall.full_text_search;
  `

    await connectNewDB.query(sqlCreateTransportationV2);
    console.log("Finished")
    return true;
}

const main = async () => {
    try {
        await addTransportationV2()
    } catch (error) {
        console.log("Error addtransportationv2 :: ", error)
    }
}
main()