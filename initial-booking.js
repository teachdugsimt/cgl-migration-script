require('dotenv').config();
const { Pool } = require('pg');
const sql = require('sql');

const newDBUser = 'user_service';

const oldConnection = {
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_LEGACY,
  port: process.env.DB_PORT,
};

const newConnection = {
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: 'booking_service',
  port: process.env.DB_PORT,
};

const createTable = async () => {
  const clientTo = new Pool(newConnection);
  const connectTo = await clientTo.connect();
  const sqlDropTypeBookingStatus = `DROP TYPE IF EXISTS booking_status;`;
  const sqlCreateEnumBooking = `CREATE TYPE booking_status AS ENUM ('WAITING', 'ACCEPTED', 'REJECTED');`;
  const sqlDropTypeBookingIfExist = `DROP TYPE IF EXISTS booking_requester_type;`;
  const sqlCreateTypeBooking = `CREATE TYPE booking_requester_type AS ENUM ('JOB_OWNER', 'TRUCK_OWNER');`;
  const sqlCreateSequenceBooking = `CREATE SEQUENCE IF NOT EXISTS booking_seq;`;
  const sqlCreateBooking = `CREATE TABLE booking (
      "id" int4 NOT NULL DEFAULT nextval('booking_seq'::regclass),
      "truck_id" int4,
      "job_id" int4,
      "requester_type" booking_requester_type,
      "status" booking_status DEFAULT 'WAITING'::booking_status,
      "requester_user_id" int4 NOT NULL,
      "accepter_user_id" int4 NOT NULL,
      "created_at" timestamp(0) DEFAULT CURRENT_TIMESTAMP,
      "updated_at" timestamp(0) DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY ("id")
  );`;

  const sqlCreateSequenceJobCarrier = `CREATE SEQUENCE IF NOT EXISTS job_carrier_seq;`;
  const sqlCreateJobCarrierTbl = `CREATE TABLE job_carrier(
    "id" SERIAL NOT NULL,
    "job_id" INT4 NOT NULL,
    "carrier_id" INT4 NOT NULL
  );`;

  const sqlDropTypePriceTypeIfExist = `DROP TYPE IF EXISTS enum_price_type;`;
  const sqlCreatePriceTypeEnum = `CREATE TYPE enum_price_type AS ENUM('PER_TON', 'PER_TRIP');`;
  const sqlDropTypeTripStatusIfExist = `DROP TYPE IF EXISTS enum_trip_status;`;
  const sqlCreateTripStatusEnum = `CREATE TYPE enum_trip_status AS ENUM ('OPEN', 'IN_PROGRESS', 'DONE', 'REJECTED');`;
  const sqlCreateSequenceTrip = `CREATE SEQUENCE IF NOT EXISTS trip_seq;`;
  const sqlCreateTripTbl = `CREATE TABLE trip(
    "id" SERIAL NOT NULL,
    "job_carrier_id" INT4 NOT NULL,
    "truck_id" INT4 NOT NULL,
    "weight" NUMERIC,
    "price" NUMERIC,
    "price_type" enum_price_type DEFAULT 'PER_TRIP',
    "status" enum_trip_status DEFAULT 'OPEN',
    "booking_id" INT4 NOT NULL,
    "version" int4 NOT NULL DEFAULT 0,
    "created_at" timestamp(0) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp(0) DEFAULT CURRENT_TIMESTAMP,
    "created_user" varchar(254) DEFAULT NULL::character varying,
    "updated_user" varchar(254) DEFAULT NULL::character varying,
    "is_deleted" BOOL NOT NULL DEFAULT false
  );`;

  await connectTo.query(sqlDropTypeBookingStatus);
  await connectTo.query(sqlCreateEnumBooking);
  await connectTo.query(sqlDropTypeBookingIfExist);
  await connectTo.query(sqlCreateTypeBooking);
  await connectTo.query(sqlCreateSequenceBooking);
  await connectTo.query(sqlCreateBooking);

  await connectTo.query(sqlCreateSequenceJobCarrier);
  await connectTo.query(sqlCreateJobCarrierTbl);

  await connectTo.query(sqlDropTypePriceTypeIfExist);
  await connectTo.query(sqlCreatePriceTypeEnum);
  await connectTo.query(sqlDropTypeTripStatusIfExist);
  await connectTo.query(sqlCreateTripStatusEnum);
  await connectTo.query(sqlCreateSequenceTrip);
  await connectTo.query(sqlCreateTripTbl);
};

const QuotationTruckBookingJobModel = sql.define({
  name: 'dtb_quotation',
  columns: [
    'id',
    'carrier_id',
    'order_id',
    'status',
    'offered_total',
    'version',
    'created_at',
    'updated_at',
    'created_user',
    'updated_user',
    'id_deleted',
    'id_viewed',
    'type_quote',
    'tax_total',
    'valid_until',
    'truck_type',
    'other_informations',
    'weight',
    'reason_of_reject',
    'loading_address',
    'loading_datetime',
    'truck_id',
  ],
});

const QuotationJobBookingTruckModel = sql.define({
  name: 'dtb_quotation_truck',
  columns: [
    'id',
    'order_id',
    'truck_id',
    'status',
    'booking_datetime',
    'action_datetime',
    'version',
    'created_at',
    'updated_at',
    'created_user',
    'updated_user',
    'is_deleted',
  ],
});

const JobModel = sql.define({
  name: 'dtb_order',
  columns: [
    'id',
    'code_id',
    'status',
    'offered_total',
    'version',
    'created_at',
    'updated_at',
    'created_user',
    'updated_user',
    'is_deleted',
    'shipper_id',
    'win_carrier_id',
    'win_quotation_id',
    'title',
    'quotation_type',
    'valid_until',
    'cancel_note',
    'cancel_user',
    'cancel_time',
    'carrier_offer_id',
    'disregard',
    'freight_offer_id',
    'type',
    'type_of_cargo',
    'name_of_cargo',
    'quantity',
    'unit',
    'total_weight',
    'length',
    'width',
    'height',
    'truck_type',
    'truck_sharing',
    'handling_instruction',
    'loading_datetime',
    'loading_address',
    'loading_longitude',
    'loading_latitude',
    'loading_contact_name',
    'loading_contact_phone',
    'winner_price',
    'payment_status',
    'payment_method',
    'tax_number',
    'tax_price',
    'total_price',
    'payment_status_carrier',
    'required_insurance',
    'cargo_price',
    'complain_note',
    'accepted_date',
    'finish_time',
    'loading_province',
    'loading_district',
    'total_distance',
    'check_loading_service',
    'check_unloading_service',
    'recommend_carrier_id',
    'recommend_truck_id',
    'loading_address_en',
    'loading_address_th',
    'loading_province_id',
    'loading_district_id',
    'reason_of_reject',
    'parent_order_id',
    'is_single_trip',
    'carrier_price',
    'truck_amount',
    'platform',
    'price_type',
    'tipper',
  ],
});

const newBookingModel = sql.define({
  name: 'booking',
  columns: [
    'id',
    'truck_id',
    'job_id',
    'requester_type',
    'status',
    'requester_user_id',
    'accepter_user_id',
    'created_at',
    'updated_at',
  ],
});

const jobCarrierModel = sql.define({
  name: 'job_carrier',
  columns: ['id', 'job_id', 'carrier_id'],
});

const tripModel = sql.define({
  name: 'trip',
  columns: [
    'id',
    'job_carrier_id',
    'truck_id',
    'weight',
    'price',
    'price_type',
    'status',
    'booking_id',
    'version',
    'created_at',
    'updated_at',
    'created_user',
    'updated_user',
    'is_deleted',
  ],
});

const runMigrateBookingService = async () => {
  const client = new Pool(oldConnection);
  const clientNew = new Pool(newConnection);

  const connect = await client.connect();
  const connectNew = await clientNew.connect();

  // type : array
  const { rows: oldTruck } = await connect.query(`SELECT * FROM dtb_truck;`);
  const { rows: oldJob } = await connect.query(`SELECT * FROM dtb_order;`);
  const { rows: oldTruckBookingJob } = await connect.query(`SELECT * FROM dtb_quotation where truck_id is not null;`);
  const { rows: oldJobBookingTruck } = await connect.query(`SELECT * FROM dtb_quotation_truck;`);
  // console.log("Old list job booking truck :; ", oldTruckBookingJob)
  // console.log("Old list truck booking job :: ", oldTruckBookingJob)

  // 0: Has Request, 1: Draft, 2: Carrier Rejected,
  // 3: Bidding, 4: Accepted, 5: Rejected, 6: Cancelled
  const newBookingList = oldTruckBookingJob.map((tbj, index) => ({
    id: index + 1,
    truck_id: tbj.truck_id,
    job_id: tbj.order_id - 999999,
    requester_type: 'TRUCK_OWNER',
    status:
      tbj.status == 0 || tbj.status == 1 || tbj.status == 3 ? 'WAITING' : tbj.status == 4 ? 'ACCEPTED' : 'REJECTED',
    requester_user_id: tbj.carrier_id,
    accepter_user_id: oldJob.find((e) => e.id == tbj.order_id).created_user,
    created_at: tbj.created_at,
    updated_at: tbj.updated_at,
  }));

  oldJobBookingTruck.map((jbt, index) => {
    newBookingList.push({
      id: oldTruckBookingJob.length + (index + 1),
      truck_id: jbt.truck_id,
      job_id: jbt.order_id - 999999,
      requester_type: 'JOB_OWNER',
      status: jbt.status == 0 ? 'WAITING' : jbt.status == 1 ? 'ACCEPTED' : 'REJECTED',
      requester_user_id: jbt.created_user,
      accepter_user_id: oldTruck.find((e) => e.id == jbt.truck_id).carrier_id,
      created_at: jbt.created_at,
      updated_at: jbt.updated_at,
    });
  });

  const newJobCarrier = [];
  const newTrip = [];
  let id_job_carrier = 1;
  newBookingList.map((book, index) => {
    const carrier_id = book.requester_type == 'JOB_OWNER' ? book.accepter_user_id : book.requester_user_id;
    if (book.status == 'ACCEPTED') {
      if (!newJobCarrier.find((e) => e.carrier_id == carrier_id)) {
        newJobCarrier.push({
          id: id_job_carrier,
          job_id: book.job_id,
          carrier_id,
        });
        id_job_carrier++;
      }

      const oldJobSlot = oldJob.find((e) => e.id == book.job_id + 999999);
      // OPEN, DONE, IN_PROGRESS, REJECTED
      let today = new Date();
      today.setHours(today.getHours() + 7);
      const parseToday = today.toISOString();
      const newParseToday = parseToday.replace('T', ' ');
      const finalToday = newParseToday.split('.')[0];
      newTrip.push({
        id: index + 1,
        job_carrier_id: id_job_carrier,
        truck_id: book.truck_id,
        weight: oldJobSlot?.total_weight || 0,
        price: oldJobSlot?.total_price || 0,
        price_type: oldJobSlot?.price_type || 'PER_TRIP',
        status: oldJobSlot.loading_datetime > finalToday ? 'IN_PROGRESS' : 'DONE',
        booking_id: book.id,
        version: 0,
        created_at: book.created_at,
        updated_at: book.updated_at,
        created_user: book.requester_user_id,
        updated_user: book.requester_user_id,
        is_deleted: false,
      });
    }

    console.log('New Booking :: ', newBookingList);
    console.log('New Job Carrier :: ', newJobCarrier);
    console.log('New Trip :: ', newTrip);
  });

  const rowQueryNewBooking = newBookingModel.insert(newBookingList).toQuery();
  await connectNew.query(rowQueryNewBooking);
  const rowQueryNewJobCarrier = jobCarrierModel.insert(newJobCarrier).toQuery();
  await connectNew.query(rowQueryNewJobCarrier);
  const rowQueryNewTrip = tripModel.insert(newTrip).toQuery();
  await connectNew.query(rowQueryNewTrip);
};

const createExtendsion = async () => {
  const connectNew = new Pool(newConnection);
  const connectNewDB = await connectNew.connect();
  const sqlCreateExtensionDblink = `CREATE EXTENSION IF NOT EXISTS dblink;`;

  const sqlCreateExtensionFdw = `CREATE EXTENSION IF NOT EXISTS postgres_fdw;`;

  const sqlCreateDblinkConnect = `GRANT EXECUTE ON FUNCTION dblink_connect(text) TO public;`;

  const sqlCreateUserService = `CREATE server userserver foreign data wrapper postgres_fdw
OPTIONS (dbname 'user_service', host '${process.env.DB_HOST}');`;

  const sqlCreateUserMapping = `CREATE USER MAPPING FOR "public"
SERVER userserver OPTIONS (user '${process.env.DB_USERNAME}', password '${process.env.DB_PASSWORD}');`;

  const sqlCreateTruckService = `CREATE server truckserver foreign data wrapper postgres_fdw
  OPTIONS (dbname 'truck_service', host '${process.env.DB_HOST}');`;

  const sqlCreateTruckMapping = `CREATE USER MAPPING FOR "public"
  SERVER truckserver OPTIONS (user 'postgres', password '${process.env.DB_PASSWORD}');`;

  const sqlCreateJobService = `CREATE server jobserver foreign data wrapper postgres_fdw
  OPTIONS (dbname 'job_service', host '${process.env.DB_HOST}');`;

  const sqlCreateJobMapping = `CREATE USER MAPPING FOR "public"
  SERVER jobserver OPTIONS (user 'postgres', password '${process.env.DB_PASSWORD}');`;

  const sqlCreatePaymentServer = `CREATE server paymentserver foreign data wrapper postgres_fdw
  OPTIONS (dbname 'payment_service', host 'cgl-dev-db.ccyrpfjhgi1v.ap-southeast-1.rds.amazonaws.com');`

  const sqlCreatePaymentMapping = `CREATE USER MAPPING FOR "public"
  SERVER paymentserver OPTIONS (user 'postgres', password '.9^Piv-.KlzZhZm.MU7vXZU7yE9I-4');`
  
  await connectNewDB.query(sqlCreatePaymentServer);
  await connectNewDB.query(sqlCreatePaymentMapping);

  await connectNewDB.query(sqlCreateExtensionDblink);
  await connectNewDB.query(sqlCreateExtensionFdw);
  await connectNewDB.query(sqlCreateDblinkConnect);
  await connectNewDB.query(sqlCreateUserService);
  await connectNewDB.query(sqlCreateUserMapping);
  await connectNewDB.query(sqlCreateTruckService);
  await connectNewDB.query(sqlCreateTruckMapping);
  await connectNewDB.query(sqlCreateJobService);
  await connectNewDB.query(sqlCreateJobMapping);
};

const createView = async () => {
  const connectNew = new Pool(newConnection);
  const connectNewDB = await connectNew.connect();
  const sqlCreateViewBooking = `CREATE OR REPLACE VIEW vw_booking AS SELECT book.id,
  book.job_id,
  truck.owner ->> 'fullName'::text AS fullname,
  truck.owner ->> 'avatar'::text AS avatar,
  book.created_at AS booking_datetime,
      CASE
          WHEN book.truck_id = truck.id THEN json_build_object('id', truck.id, 'truck_type', truck.truck_type, 'loading_weight', truck.loading_weight, 'stall_height', truck.stall_height, 'created_at', truck.created_at, 'updated_at', truck.updated_at, 'approve_status', truck.approve_status, 'registration_number', string_to_array(regexp_replace(truck.registration_number, '[}{]'::text, ''::text, 'g'::text), ','::text), 'truck_photos', truck.truck_photos, 'work_zone', truck.work_zone, 'tipper', truck.tipper, 'owner', truck.owner)
          ELSE COALESCE('{}'::json)
      END AS truck
 FROM booking book
   LEFT JOIN dblink('truckserver'::text, 'SELECT id,truck_type,loading_weight,stall_height,created_at,updated_at,approve_status,registration_number,truck_photos,work_zone,tipper,owner FROM vw_truck_details'::text) truck(id integer, truck_type integer, loading_weight double precision, stall_height text, created_at timestamp without time zone, updated_at timestamp without time zone, approve_status text, registration_number text, truck_photos jsonb, work_zone jsonb, tipper boolean, owner jsonb) ON truck.id = book.truck_id
GROUP BY book.id, truck.id, truck.truck_type, truck.loading_weight, truck.stall_height, truck.created_at, truck.updated_at, truck.approve_status, truck.registration_number, truck.truck_photos, truck.work_zone, truck.tipper, truck.owner;`;

  const sqlCreateViewJobBookingTruckList = `CREATE OR REPLACE VIEW vw_job_booking_truck_list AS SELECT book.id,
  book.truck_id,
  json_build_object('object', usr.avatar) AS avatar,
  usr.fullname,
  book.created_at AS bookingdatetime,
  book.status
 FROM booking book
   LEFT JOIN dblink('userserver'::text, 'SELECT id,fullname,avatar FROM user_profile'::text) usr(id integer, fullname text, avatar text) ON usr.id = book.requester_user_id
GROUP BY book.id, usr.avatar, usr.fullname;`;

  const sqlCreateViewJobWithBookingId = `CREATE OR REPLACE VIEW vw_job_with_booking_id AS SELECT job.id,
  book.id AS booking_id,
  job.product_type_id,
  job.product_name,
  job.truck_type,
  job.weight,
  job.required_truck_amount,
  json_build_object('name', job.loading_contact_name, 'datetime', job.loading_datetime, 'contact_name', job.loading_contact_name, 'contact_mobile_no', job.loading_contact_phone, 'lat', job.loading_latitude, 'lng', job.loading_longitude) AS "from",
  job.shipments AS "to",
  job.owner,
  job.quotations,
  book.status,
  book.requester_type,
  book.requester_user_id,
  book.accepter_user_id,
  job.price,
  job.price_type
 FROM booking book
   LEFT JOIN dblink('jobserver'::text, 'SELECT id,product_type_id,product_name,truck_type,weight,required_truck_amount,loading_address,loading_datetime,loading_contact_name,loading_contact_phone,loading_latitude,loading_longitude,price,price_type,owner,shipments,quotations FROM vw_job_list'::text) job(id integer, product_type_id integer, product_name text, truck_type integer, weight numeric, required_truck_amount integer, loading_address text, loading_datetime timestamp without time zone, loading_contact_name text, loading_contact_phone text, loading_latitude double precision, loading_longitude double precision, price numeric, price_type text, owner jsonb, shipments jsonb, quotations jsonb) ON job.id = book.job_id
GROUP BY book.id, job.id, job.product_type_id, job.product_name, job.truck_type, job.weight, job.required_truck_amount, job.loading_contact_name, job.loading_datetime, job.loading_contact_phone, job.loading_latitude, job.loading_longitude, job.shipments, job.owner, job.price, job.price_type, job.quotations;`;

  const sqlCreateViewMyJobDoneList = `CREATE OR REPLACE VIEW vw_my_job_done_list AS SELECT listall.id,
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
  listall.job_status,
  listall.status,
  listall.requester_type,
  listall.requester_user_id,
  listall.accepter_user_id,
  listall.price,
  listall.price_type
 FROM ( SELECT job.id,
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
          job.status AS job_status,
          book.status,
          book.requester_type,
          book.requester_user_id,
          book.accepter_user_id,
          job.price,
          job.price_type
         FROM booking book
           LEFT JOIN dblink('jobserver'::text, 'SELECT id,user_id,product_type_id,product_name,truck_type,weight,required_truck_amount,loading_address,loading_datetime,loading_contact_name,loading_contact_phone,loading_latitude,loading_longitude,price,price_type,owner,shipments,status FROM vw_job_list'::text) job(id integer, user_id integer, product_type_id integer, product_name text, truck_type integer, weight numeric, required_truck_amount integer, loading_address text, loading_datetime timestamp without time zone, loading_contact_name text, loading_contact_phone text, loading_latitude double precision, loading_longitude double precision, price numeric, price_type text, owner jsonb, shipments jsonb, status text) ON job.id = book.job_id
        GROUP BY book.id, job.id, job.user_id, job.product_type_id, job.product_name, job.truck_type, job.weight, job.required_truck_amount, job.loading_contact_name, job.loading_datetime, job.loading_contact_phone, job.loading_latitude, job.loading_longitude, job.shipments, job.owner, job.price, job.price_type, job.status, job.loading_address
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
          job.status AS job_status,
          NULL::booking_status AS booking_status,
          NULL::booking_requester_type AS booking_requester_type,
          NULL::integer AS int4,
          NULL::integer AS int4,
          job.price,
          job.price_type
         FROM dblink('jobserver'::text, 'SELECT id,user_id,product_type_id,product_name,truck_type,weight,required_truck_amount,loading_address,loading_datetime,loading_contact_name,loading_contact_phone,loading_latitude,loading_longitude,price,price_type,owner,shipments,status FROM vw_job_list'::text) job(id integer, user_id integer, product_type_id integer, product_name text, truck_type integer, weight numeric, required_truck_amount integer, loading_address text, loading_datetime timestamp without time zone, loading_contact_name text, loading_contact_phone text, loading_latitude double precision, loading_longitude double precision, price numeric, price_type text, owner jsonb, shipments jsonb, status text)
        WHERE NOT (job.id IN ( SELECT booking.job_id
                 FROM booking))
        GROUP BY job.id, job.user_id, job.product_type_id, job.product_name, job.truck_type, job.weight, job.required_truck_amount, job.loading_contact_name, job.loading_datetime, job.loading_contact_phone, job.loading_latitude, job.loading_longitude, job.shipments, job.owner, job.price, job.price_type, job.status, job.loading_address) listall
GROUP BY listall.id, listall.user_id, listall.loading_datetime, listall.product_type_id, listall.product_name, listall.truck_type, listall.weight, listall.required_truck_amount, listall."to", listall.owner, listall.status, listall.requester_type, listall.requester_user_id, listall.accepter_user_id, listall.price, listall.price_type, listall."from", listall.job_status;`;

  const sqlCreateViewMyJobNewList = `CREATE OR REPLACE VIEW vw_my_job_new_list AS SELECT listall.id,
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
  listall.quotations,
  listall.status,
  listall.requester_type,
  listall.requester_user_id,
  listall.accepter_user_id,
  listall.tipper,
  listall.price,
  listall.price_type
 FROM ( SELECT job.id,
          job.user_id,
          job.product_type_id,
          job.product_name,
          job.truck_type,
          job.weight,
          job.required_truck_amount,
          job.loading_datetime,
          json_build_object('name', job.loading_address, 'datetime', job.loading_datetime, 'contact_name', job.loading_contact_name, 'contact_mobile_no', job.loading_contact_phone, 'lat', job.loading_latitude, 'lng', job.loading_longitude)::jsonb AS "from",
          job.shipments AS "to",
          job.quotations,
          job.owner,
          book.status,
          book.requester_type,
          book.requester_user_id,
          book.accepter_user_id,
          job.tipper,
          job.price,
          job.price_type
         FROM booking book
           LEFT JOIN dblink('jobserver'::text, 'SELECT id,user_id,product_type_id,product_name,truck_type,weight,required_truck_amount,loading_address,loading_datetime,loading_contact_name,loading_contact_phone,loading_latitude,loading_longitude,tipper,price,price_type,owner,shipments,quotations FROM vw_job_list'::text) job(id integer, user_id integer, product_type_id integer, product_name text, truck_type integer, weight numeric, required_truck_amount integer, loading_address text, loading_datetime timestamp without time zone, loading_contact_name text, loading_contact_phone text, loading_latitude double precision, loading_longitude double precision, tipper boolean, price numeric, price_type text, owner jsonb, shipments jsonb, quotations jsonb) ON job.id = book.job_id
        GROUP BY book.id, job.id, job.user_id, job.product_type_id, job.product_name, job.truck_type, job.weight, job.required_truck_amount, job.tipper, job.loading_contact_name, job.loading_datetime, job.loading_contact_phone, job.loading_latitude, job.loading_longitude, job.shipments, job.owner, job.price, job.price_type, job.quotations, job.loading_address
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
          job.quotations,
          job.owner,
          NULL::booking_status AS booking_status,
          NULL::booking_requester_type AS booking_requester_type,
          NULL::integer AS int4,
          NULL::integer AS int4,
          job.tipper,
          job.price,
          job.price_type
         FROM dblink('jobserver'::text, 'SELECT id,user_id,product_type_id,product_name,truck_type,status,weight,required_truck_amount,loading_address,loading_datetime,loading_contact_name,loading_contact_phone,loading_latitude,loading_longitude,tipper,price,price_type,owner,shipments,quotations FROM vw_job_list'::text) job(id integer, user_id integer, product_type_id integer, product_name text, truck_type integer, status text, weight numeric, required_truck_amount integer, loading_address text, loading_datetime timestamp without time zone, loading_contact_name text, loading_contact_phone text, loading_latitude double precision, loading_longitude double precision, tipper boolean, price numeric, price_type text, owner jsonb, shipments jsonb, quotations jsonb)
        WHERE job.status = 'NEW'::text AND NOT (job.id IN ( SELECT booking.job_id
                 FROM booking))
        GROUP BY job.id, job.user_id, job.product_type_id, job.product_name, job.truck_type, job.weight, job.required_truck_amount, job.tipper, job.loading_contact_name, job.loading_datetime, job.loading_contact_phone, job.loading_latitude, job.loading_longitude, job.shipments, job.owner, job.price, job.price_type, job.quotations, job.loading_address) listall
GROUP BY listall.id, listall.user_id, listall.loading_datetime, listall.product_type_id, listall.product_name, listall.truck_type, listall.weight, listall.required_truck_amount, listall."to", listall.owner, listall.status, listall.requester_type, listall.requester_user_id, listall.accepter_user_id, listall.price, listall.price_type, listall."from", listall.tipper, listall.quotations;
`;

  const sqlCreateViewTripInprogress = `CREATE OR REPLACE VIEW vw_trip_inprogress AS SELECT jc.id,
    jc.job_id,
    jc.carrier_id,
    vwjob.product_type_id,
    vwjob.product_name,
    vwjob.price,
    vwjob.price_type,
    vwjob.truck_type,
    vwjob.weight AS total_weight,
    vwjob.required_truck_amount,
    json_build_object('name', vwjob.loading_address, 'dateTime', vwjob.loading_datetime, 'contactName', vwjob.loading_contact_name, 'contactMobileNo', vwjob.loading_contact_phone, 'lat', vwjob.loading_latitude, 'lng', vwjob.loading_longitude) AS "from",
    vwjob.shipments,
    vwjob.owner AS job_owner,
    json_agg(json_build_object('id', t.id, 'truckId', t.truck_id, 'weight', COALESCE(t.weight, vwtruck.loading_weight), 'price', COALESCE(t.price, vwjob.price), 'priceType', t.price_type, 'status', t.status, 'bookingId', t.booking_id, 'truckType', vwtruck.truck_type, 'stallHeight', vwtruck.stall_height, 'createdAt', vwtruck.created_at, 'updatedAt', vwtruck.updated_at, 'approveStatus', vwtruck.approve_status, 'phoneNumber', vwtruck.owner ->> 'mobileNo'::text, 'registrationNumber', vwtruck.registration_number, 'workingZones', vwtruck.work_zone, 'owner', vwtruck.owner, 'tipper', vwtruck.tipper)) AS trips
   FROM job_carrier jc
     LEFT JOIN trip t ON t.job_carrier_id = jc.id
     LEFT JOIN dblink('jobserver'::text, 'SELECT id, product_type_id, product_name, price, price_type, truck_type, weight, required_truck_amount, loading_address, loading_datetime, loading_contact_name, loading_contact_phone, loading_latitude, loading_longitude, owner, shipments FROM vw_job_list'::text) vwjob(id integer, product_type_id integer, product_name text, price numeric, price_type text, truck_type text, weight numeric, required_truck_amount integer, loading_address text, loading_datetime text, loading_contact_name text, loading_contact_phone text, loading_latitude text, loading_longitude text, owner jsonb, shipments jsonb) ON vwjob.id = jc.job_id
     LEFT JOIN dblink('truckserver'::text, 'SELECT id, approve_status, loading_weight, registration_number, stall_height, quotation_number, tipper, truck_type, created_at, updated_at, carrier_id, owner, work_zone FROM vw_truck_list'::text) vwtruck(id integer, approve_status character varying, loading_weight numeric, registration_number text[], stall_height character varying, quotation_number integer, tipper boolean, truck_type integer, created_at timestamp without time zone, updated_at timestamp without time zone, carrier_id integer, owner jsonb, work_zone jsonb) ON vwtruck.id = t.truck_id
     WHERE t.status = 'IN_PROGRESS'::enum_trip_status
  GROUP BY jc.id, jc.job_id, jc.carrier_id, vwjob.product_type_id, vwjob.truck_type, vwjob.weight, vwjob.required_truck_amount, vwjob.loading_address, vwjob.loading_datetime, vwjob.loading_contact_name, vwjob.loading_contact_phone, vwjob.loading_latitude, vwjob.loading_longitude, vwjob.owner, vwjob.shipments, vwjob.product_name, vwjob.price, vwjob.price_type;
  `;

  const sqlCreateViewTripWithTruckDetail = `CREATE OR REPLACE VIEW vw_trip_with_truck_detail AS SELECT jc.id AS job_carrier_id,
  jc.job_id,
  jc.carrier_id,
  json_agg(json_build_object('id', t.id, 'truckId', t.truck_id, 'weight', COALESCE(t.weight, vwtruck.loading_weight), 'price', COALESCE(t.price, vwjob.price), 'priceType', t.price_type, 'status', t.status, 'bookingId', t.booking_id, 'truckType', vwtruck.truck_type, 'stallHeight', vwtruck.stall_height, 'createdAt', vwtruck.created_at, 'updatedAt', vwtruck.updated_at, 'approveStatus', vwtruck.approve_status, 'phoneNumber', vwtruck.owner ->> 'mobileNo'::text, 'registrationNumber', vwtruck.registration_number, 'workingZones', vwtruck.work_zone, 'owner', vwtruck.owner, 'tipper', vwtruck.tipper)) AS trips
 FROM job_carrier jc
   LEFT JOIN trip t ON t.job_carrier_id = jc.id
   LEFT JOIN dblink('jobserver'::text, 'SELECT id, offered_total AS price FROM job'::text) vwjob(id integer, price numeric) ON vwjob.id = jc.job_id
   LEFT JOIN dblink('truckserver'::text, 'SELECT id, approve_status, loading_weight, registration_number, stall_height, quotation_number, tipper, truck_type, created_at, updated_at, carrier_id, owner, work_zone FROM vw_truck_list'::text) vwtruck(id integer, approve_status character varying, loading_weight numeric, registration_number text[], stall_height character varying, quotation_number integer, tipper boolean, truck_type integer, created_at timestamp without time zone, updated_at timestamp without time zone, carrier_id integer, owner jsonb, work_zone jsonb) ON vwtruck.id = t.truck_id
GROUP BY jc.id, jc.job_id, jc.carrier_id;
  `;

  const sqlCreateViewTripListAll = `CREATE OR REPLACE VIEW vw_trip_all AS SELECT t.id,
  jc.job_id,
  t.job_carrier_id,
  t.truck_id,
  vwjob.product_type_id,
  vwjob.product_name,
  vwjob.price,
  vwjob.price_type,
  vwjob.truck_type,
  vwjob.weight AS total_weight,
  vwjob.required_truck_amount,
  t.status,
  json_build_object('name', vwjob.loading_address, 'dateTime', vwjob.loading_datetime, 'contactName', vwjob.loading_contact_name, 'contactMobileNo', vwjob.loading_contact_phone, 'lat', vwjob.loading_latitude, 'lng', vwjob.loading_longitude) AS "from",
  vwjob.shipments,
  vwjob.owner AS job_owner,
  json_agg(json_build_object('id', t.id, 'truckId', t.truck_id, 'weight', COALESCE(t.weight, vwtruck.loading_weight), 'price', COALESCE(t.price, vwjob.price), 'priceType', t.price_type, 'status', t.status, 'bookingId', t.booking_id, 'truckType', vwtruck.truck_type, 'stallHeight', vwtruck.stall_height, 'createdAt', vwtruck.created_at, 'updatedAt', vwtruck.updated_at, 'approveStatus', vwtruck.approve_status, 'phoneNumber', vwtruck.owner ->> 'mobileNo'::text, 'registrationNumber', vwtruck.registration_number, 'workingZones', vwtruck.work_zone, 'owner', vwtruck.owner, 'tipper', vwtruck.tipper)) AS trips
 FROM trip t
   LEFT JOIN job_carrier jc ON jc.id = t.job_carrier_id
   LEFT JOIN dblink('jobserver'::text, 'SELECT id, product_type_id, product_name, price, price_type, truck_type, weight, required_truck_amount, loading_address, loading_datetime, loading_contact_name, loading_contact_phone, loading_latitude, loading_longitude, owner, shipments FROM vw_job_list'::text) vwjob(id integer, product_type_id integer, product_name text, price numeric, price_type text, truck_type text, weight numeric, required_truck_amount integer, loading_address text, loading_datetime text, loading_contact_name text, loading_contact_phone text, loading_latitude text, loading_longitude text, owner jsonb, shipments jsonb) ON vwjob.id = jc.job_id
   LEFT JOIN dblink('truckserver'::text, 'SELECT id, approve_status, loading_weight, registration_number, stall_height, quotation_number, tipper, truck_type, created_at, updated_at, carrier_id, owner, work_zone FROM vw_truck_list'::text) vwtruck(id integer, approve_status character varying, loading_weight numeric, registration_number text[], stall_height character varying, quotation_number integer, tipper boolean, truck_type integer, created_at timestamp without time zone, updated_at timestamp without time zone, carrier_id integer, owner jsonb, work_zone jsonb) ON vwtruck.id = t.truck_id
GROUP BY t.truck_id, t.status, t.id, t.job_carrier_id, jc.job_id, vwjob.product_type_id, vwjob.truck_type, vwjob.weight, vwjob.required_truck_amount, vwjob.loading_address, vwjob.loading_datetime, vwjob.loading_contact_name, vwjob.loading_contact_phone, vwjob.loading_latitude, vwjob.loading_longitude, vwjob.owner, vwjob.shipments, vwjob.product_name, vwjob.price, vwjob.price_type;`;

  const sqlCreateViewTransportation = `create or replace view vw_transportation_v2 as SELECT listall.id,
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
  listall.updated_at,
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
          json_agg(jsonb_build_object('id', trip.id, 'jobCarrierId', jc.id, 'weight', trip.weight, 'price', pay.price_per_ton, 'status', trip.status, 'createdAt', trip.created_at, 'createdUser', trip.created_user, 'startDate', trip.start_date, 'isDeleted', trip.is_deleted, 'truck', json_build_object('id', trucky.id, 'approveStatus', trucky.approve_status, 'loadingWeight', trucky.loading_weight, 'registrationNumber', trucky.registration_number, 'stallHeight', trucky.stall_height, 'tipper', trucky.tipper, 'truckType', trucky.truck_type, 'createdAt', trucky.created_at, 'updatedAt', trucky.updated_at, 'carrierId', trucky.carrier_id, 'truckPhotos', trucky.truck_photos, 'workZones', trucky.work_zone, 'owner', trucky.owner)))::jsonb AS trips,
          max(trip.updated_at) AS updated_at,
          job.status,
          job.tipper,
          job.price,
          job.price_type,
          job.full_text_search
         FROM job_carrier jc
           LEFT JOIN trip trip ON jc.id = trip.job_carrier_id
           LEFT JOIN dblink('paymentserver'::text, 'SELECT id,trip_id,price_per_ton FROM payment_carrier'::text) pay(id INTEGER, trip_id INTEGER, price_per_ton INTEGER) ON trip.id = pay.trip_id
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
          NULL::timestamp without time zone AS "timestamp",
          job.status,
          job.tipper,
          job.price,
          job.price_type,
          job.full_text_search
         FROM dblink('jobserver'::text, 'SELECT id,user_id,product_type_id,product_name,truck_type,status,weight,required_truck_amount,loading_address,loading_datetime,loading_contact_name,loading_contact_phone,loading_latitude,loading_longitude,tipper,price,price_type,owner,shipments,full_text_search FROM vw_job_list'::text) job(id integer, user_id integer, product_type_id integer, product_name text, truck_type integer, status text, weight numeric, required_truck_amount integer, loading_address text, loading_datetime timestamp without time zone, loading_contact_name text, loading_contact_phone text, loading_latitude double precision, loading_longitude double precision, tipper boolean, price numeric, price_type text, owner jsonb, shipments jsonb, full_text_search text)
        WHERE NOT (job.id IN ( SELECT job_carrier.job_id
                 FROM job_carrier))
        GROUP BY job.id, job.user_id, job.product_type_id, job.product_name, job.truck_type, job.weight, job.required_truck_amount, job.tipper, job.loading_contact_name, job.loading_datetime, job.loading_contact_phone, job.loading_latitude, job.loading_longitude, job.shipments, job.owner, job.price, job.price_type, job.loading_address, job.status, job.full_text_search) listall
GROUP BY listall.id, listall.trips, listall.user_id, listall.loading_datetime, listall.product_type_id, listall.product_name, listall.truck_type, listall.weight, listall.required_truck_amount, listall."to", listall.owner, listall.price, listall.price_type, listall."from", listall.tipper, listall.status, listall.full_text_search, listall.updated_at;
`;

  await connectNewDB.query(sqlCreateViewBooking);
  await connectNewDB.query(sqlCreateViewJobBookingTruckList);
  await connectNewDB.query(sqlCreateViewJobWithBookingId);
  await connectNewDB.query(sqlCreateViewMyJobDoneList);
  await connectNewDB.query(sqlCreateViewMyJobNewList);
  await connectNewDB.query(sqlCreateViewTripInprogress);
  await connectNewDB.query(sqlCreateViewTripWithTruckDetail);
  await connectNewDB.query(sqlCreateViewTripListAll);
  await connectNewDB.query(sqlCreateViewTransportation);
  console.log('Finished');
  return true;
};

const updateCarrierIdGroupNewUser = async () => {
  const clientUserService = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: newDBUser,
    port: process.env.DB_PORT,
  });

  const clientBookingService = new Pool(newConnection);

  const sqlSelectBackupUserId = `SELECT current_user_id, user_ids FROM backup_user_id;`;

  const connectUserService = await clientUserService.connect();
  const newBookingConnection = await clientBookingService.connect();

  const { rows: backupUserId } = await connectUserService.query(sqlSelectBackupUserId);

  for (const attr of backupUserId) {
    await newBookingConnection.query(`UPDATE booking
      SET requester_user_id = ${attr.current_user_id}
      WHERE requester_type = 'TRUCK_OWNER' and requester_user_id = ANY(ARRAY[${attr.user_ids}])`);
  }

  for (const attr of backupUserId) {
    await newBookingConnection.query(`UPDATE booking
      SET accepter_user_id = ${attr.current_user_id}
      WHERE requester_type = 'JOB_OWNER' and accepter_user_id = ANY(ARRAY[${attr.user_ids}])`);
  }

  for (const attr of backupUserId) {
    await newBookingConnection.query(`UPDATE job_carrier
      SET carrier_id = ${attr.current_user_id}
      WHERE carrier_id = ANY(ARRAY[${attr.user_ids}])`);
  }

  console.log('Finished');
  return true;
};

const updateSequenceAllTable = async () => {
  const connectNew = new Pool(newConnection);
  const connectNewDB = await connectNew.connect();
  const sqlUpdateSeqBooking = `SELECT setval('booking_seq', (select count(*) from booking), true);`;
  const sqlUpdateSeqJobCarrier = `SELECT setval('job_carrier_seq', (select count(*) from job_carrier), true);`;
  const sqlUpdateSeqTrip = `SELECT setval('trip_seq', (select count(*) from trip), true);`;
  //
  await connectNewDB.query(sqlUpdateSeqBooking);
  await connectNewDB.query(sqlUpdateSeqJobCarrier);
  await connectNewDB.query(sqlUpdateSeqTrip);
  console.log('Update seq all table finish !!');
  return true;
};

const main = async () => {
  try {
    await createExtendsion();
    await createTable();

    await createView();
    await runMigrateBookingService();

    await updateCarrierIdGroupNewUser();
    await updateSequenceAllTable();
    return true;
  } catch (error) {
    console.log('Error :: ', error);
    throw error;
  }
};
main();
