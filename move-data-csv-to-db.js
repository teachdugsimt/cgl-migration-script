require('dotenv').config();
const { Pool } = require('pg');
const sql = require('sql');
const NodeGeocoder = require('node-geocoder');
const mmtz = require('moment-timezone');
const AWS = require('aws-sdk');
const Hashids = require('hashids/cjs');
const cryptoRandomString = require('./crypto-random-string');
const _ = require('lodash');

const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();
const documentClient = new AWS.DynamoDB.DocumentClient();
const kms = new AWS.KMS();
const hashids = new Hashids('secretkeyforcargolinkproject', 8, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890');

const UserPoolId = process.env.USER_POOL_ID;
const ClientApp = process.env.APP_CLIENT;
const kmsKey = process.env.KMS_MASTER_KEY;

const sheet1 = require('./excel-data/sheet1.json');
const sheet2 = require('./excel-data/sheet2.json');
const sheet3 = require('./excel-data/sheet3.json');
const sheet4 = require('./excel-data/sheet4.json');
const sheet5 = require('./excel-data/sheet5.json');
const sheet6 = require('./excel-data/sheet6.json');
const sheet7 = require('./excel-data/sheet7.json');
const sheet8 = require('./excel-data/sheet8.json');
const sheet9 = require('./excel-data/sheet9.json');
const sheet10 = require('./excel-data/sheet10.json');
const sheet11 = require('./excel-data/sheet11.json');

const UserProfileModel = sql.define({
  name: 'user_profile',
  columns: ['phone_number', 'fullname', 'created_by', 'user_type'],
});

const UserRoleModel = sql.define({
  name: 'user_role',
  columns: ['user_id', 'role_id'],
});

const AddressModel = sql.define({
  name: 'address',
  columns: ['user_id', 'address_no', 'moo', 'road', 'zip_code', 'created_by'],
});

const JobModel = sql.define({
  name: 'job',
  columns: [
    'offered_total',
    'created_user',
    'updated_user',
    'user_id',
    'product_type_id',
    'product_name',
    'total_weight',
    'truck_type',
    'loading_datetime',
    'loading_address',
    'loading_longitude',
    'loading_latitude',
    'loading_contact_name',
    'loading_contact_phone',
    'truck_amount',
    'platform',
    'price_type',
    'tipper',
    'full_text_search',
    'status',
  ],
});

const ShipmentModel = sql.define({
  name: 'shipment',
  columns: [
    'job_id',
    'address_dest',
    'longitude_dest',
    'latitude_dest',
    'fullname_dest',
    'phone_dest',
    'created_user',
    'updated_user',
    'status',
  ],
});

const TruckModel = sql.define({
  name: 'shipment',
  columns: [
    'carrier_id',
    'registration_number',
    'loading_weight',
    'created_user',
    'updated_user',
    'truck_type',
    'approve_status',
    'approve_date',
    'is_tipper',
    'stall_height',
  ],
});

const JobCarrierModel = sql.define({
  name: 'job_carrier',
  columns: ['job_id', 'carrier_id'],
});

const TripModel = sql.define({
  name: 'trip',
  columns: [
    'job_carrier_id',
    'truck_id',
    'price_type',
    'status',
    'created_user',
    'updated_user',
    'start_date',
    'weight_start',
    'weight_end',
  ],
});

const BankAccountModel = sql.define({
  name: 'bank_account',
  columns: [
    'user_id',
    'account_name',
    'account_no',
    'bank_name',
    'created_at',
    'updated_at',
    'created_user',
    'updated_user',
  ],
});

const PaymentShipperModel = sql.define({
  name: 'payment_shipper',
  columns: [
    'trip_id',
    'price_per_ton',
    'amount',
    'fee_amount',
    'fee_percentage',
    'net_amount',
    'payment_status',
    'bill_start_date',
    'payment_date',
    'created_at',
    'updated_at',
    'created_user',
    'updated_user',
  ],
});

const PaymentCarrierModel = sql.define({
  name: 'payment_carrier',
  columns: [
    'trip_id',
    'bank_account_id',
    'price_per_ton',
    'amount',
    'fee_amount',
    'fee_percentage',
    'net_amount',
    'payment_status',
    'payment_date',
    'created_at',
    'updated_at',
    'created_user',
    'updated_user',
  ],
});

const createUser = async (username, password, userId) => {
  const params = {
    UserPoolId: UserPoolId,
    Username: username,
    TemporaryPassword: password,
    MessageAction: 'SUPPRESS',
    UserAttributes: [
      {
        Name: 'custom:userId',
        Value: userId,
      },
    ],
  };
  return cognitoidentityserviceprovider.adminCreateUser(params).promise();
};

const setUserPassword = async (username, password) => {
  const params = {
    UserPoolId: UserPoolId,
    Username: username,
    Password: password,
    Permanent: true,
  };
  return cognitoidentityserviceprovider.adminSetUserPassword(params).promise();
};

const generatePassword = (length) => {
  return cryptoRandomString.default({ length: length, type: 'base64' });
};

const encryptByKms = async (source) => {
  const params = {
    KeyId: kmsKey,
    Plaintext: source,
  };
  const { CiphertextBlob } = await kms.encrypt(params).promise();
  return CiphertextBlob.toString('hex');
};

const bulkInsert = async (data) => {
  const params = {
    RequestItems: {
      cgl_user: data,
    },
  };
  return documentClient.batchWrite(params).promise();
};

const truckType = {
  เทรนเลอร์พื้นเรียบ: 22,
  กระบะตู้ทึบ: 4,
  สิบล้อพ่วงคอก: 15,
  'รถ 6 ล้อ ตู้ทึบ เปิดข้าง': 10,
  'รถ 10 ล้อเดี่ยว': 14,
  'รถ 10 ล้อตู้ทึบเปิดข้าง': 16,
  พ่วงคอก: 24,
};

const convertStringNumberToNumeric = (num) => {
  if (!num) return '0';
  return +num.toString().trim().replaceAll(',', '');
};

const checkTipper = (type) => type.includes('(ดั้ม');

// const checkTruckType = (type) => (type.split('(')[0] === 'พ่วงคอก' ? 24 : 1);

const checkTruckType = (type) => {
  const t = type.split('(')[0].trim();
  return truckType[t] || 29;
};

const converPhoneNumberFormat = (phoneNumber) => {
  const p = phoneNumber.replaceAll('-', '');
  if (p.slice(0, 1) === '0') {
    return `+66${p.slice(1)}`;
  }
  return p;
};

const randomPhoneNumber = () => {
  const phoneNumber = `+665${Date.now() % 10000000}`;
  return phoneNumber.length < 12 ? phoneNumber + '0' : phoneNumber;
};

const getLatLng = async (address) => {
  console.log('address :>> ', address);
  const options = {
    provider: 'google',
    apiKey: 'AIzaSyD_xZbQQVruH1NWLqCE2kgSWBPoWH7l3Sw',
    formatter: null,
  };

  const geocoder = NodeGeocoder(options);

  const result = await geocoder.geocode(address);
  const { latitude, longitude } = result[0];
  console.log('latitude :>> ', latitude);
  console.log('longitude :>> ', longitude);
  return [latitude, longitude];
};

const convertDate = (date) => {
  if (date.split('/').length > 1) {
    const newDate = date.split('/');
    newDate[newDate.length - 1] = +newDate[2] - 543;
    return newDate.reverse().join('-');
  }
  const newDate = date.split('-');
  newDate[newDate.length - 1] = +newDate[2] - 543;
  return newDate.reverse().join('-');
};

const run = async () => {
  // const clientUser = new Pool({
  //   host: 'localhost',
  //   user: 'postgres',
  //   password: '@t;ll4RT10032538',
  //   database: 'db_test_v2',
  //   port: 5432,
  // });
  // const clientTruck = new Pool({
  //   host: 'localhost',
  //   user: 'postgres',
  //   password: '@t;ll4RT10032538',
  //   database: 'db_test_v2',
  //   port: 5432,
  // });
  // const clientJob = new Pool({
  //   host: 'localhost',
  //   user: 'postgres',
  //   password: '@t;ll4RT10032538',
  //   database: 'db_test_v2',
  //   port: 5432,
  // });
  // const clientTrip = new Pool({
  //   host: 'localhost',
  //   user: 'postgres',
  //   password: '@t;ll4RT10032538',
  //   database: 'db_test_v2',
  //   port: 5432,
  // });
  // const clientPayment = new Pool({
  //   host: 'localhost',
  //   user: 'postgres',
  //   password: '@t;ll4RT10032538',
  //   database: 'db_test_v2',
  //   port: 5432,
  // });

  const clientUser = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'user_service',
    port: process.env.DB_PORT,
  });
  const clientTruck = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'truck_service',
    port: process.env.DB_PORT,
  });
  const clientJob = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'job_service',
    port: process.env.DB_PORT,
  });
  const clientTrip = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'booking_service',
    port: process.env.DB_PORT,
  });
  const clientPayment = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'payment_service',
    port: process.env.DB_PORT,
  });

  const connectUser = await clientUser.connect();
  const connectTruck = await clientTruck.connect();
  const connectJob = await clientJob.connect();
  const connectTrip = await clientTrip.connect();
  const connectPayment = await clientPayment.connect();

  const getUserByPhoneNumber = async (phoneNumber) => {
    const { rows } = await connectUser.query(
      `SELECT id FROM user_profile WHERE phone_number = '${phoneNumber}' LIMIT 1;`
    );
    return rows[0];
  };

  const getUserByName = async (name) => {
    const { rows } = await connectUser.query(
      `SELECT id FROM user_profile WHERE fullname = '${name}' AND phone_number LIKE '+665%' LIMIT 1;`
    );
    return rows[0];
  };

  const addUser = async (userData) => {
    const { rows } = await connectUser.query(
      `INSERT INTO user_profile(phone_number, fullname, created_by, user_type)
    VALUES ($1, $2, $3, $4) RETURNING id`,
      userData
    );
    return rows[0];
  };

  const addUserRole = async (userRoleData) => {
    const rowQueryUserRole = UserRoleModel.insert(userRoleData).toQuery();
    return connectUser.query(rowQueryUserRole);
  };

  const getTruckByRegistrationNumber = async (registrationNumber) => {
    const { rows } = await connectTruck.query(
      `SELECT id FROM truck WHERE registration_number = '${registrationNumber.trim()}' LIMIT 1;`
    );
    return rows[0];
  };

  const addTruck = async (truckData) => {
    const { rows } = await connectTruck.query(
      `INSERT INTO truck(carrier_id, registration_number, loading_weight, created_user, updated_user, truck_type, approve_status, approve_date, is_tipper, stall_height)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
      truckData
    );
    return rows[0];
  };

  const addTruckWorkingZone = async (truckData) => {
    const { rows } = await connectTruck.query(
      `INSERT INTO truck_working_zone(truck_id, region, created_user, updated_user)
    VALUES ($1, $2, $3, $4) RETURNING id`,
      truckData
    );
    return rows[0];
  };

  const addJob = async (jobData) => {
    const { rows } = await connectJob.query(
      `INSERT INTO job(offered_total, created_user, updated_user, user_id, product_type_id, product_name, total_weight, truck_type, loading_datetime, loading_address, loading_longitude, loading_latitude, truck_amount, platform, price_type, tipper, full_text_search, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING id`,
      jobData
    );
    return rows[0];
  };

  const addTrip = async (tripData) => {
    const { rows } = await connectTrip.query(
      `INSERT INTO trip(job_carrier_id, truck_id, price_type, status, created_user, updated_user, start_date, weight_start, weight_end)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      tripData
    );
    return rows[0];
  };

  const getJobCarrier = async (jobId, carrierId) => {
    const { rows } = await connectTrip.query(
      `SELECT id FROM job_carrier WHERE job_id = ${jobId} AND carrier_id = ${carrierId} LIMIT 1;`
    );
    return rows[0];
  };

  const addJobCarrier = async (jobCarriereData) => {
    const { rows } = await connectTrip.query(
      `INSERT INTO job_carrier(job_id, carrier_id)
      VALUES ($1, $2) RETURNING id`,
      jobCarriereData
    );
    return rows[0];
  };

  const addPaymentShipper = async (paymentShipperData) => {
    const { rows } = await connectPayment.query(
      `INSERT INTO payment_shipper(trip_id, price_per_ton, amount, fee_amount, fee_percentage, net_amount, payment_status, bill_start_date, payment_date, created_at, updated_at, created_user, updated_user)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
      paymentShipperData
    );
    return rows[0];
  };

  const addPaymentCarrier = async (paymentCarrierData) => {
    const { rows } = await connectPayment.query(
      `INSERT INTO payment_carrier(trip_id, bank_account_id, price_per_ton, amount, fee_amount, fee_percentage, net_amount, payment_status, payment_date, created_at, updated_at, created_user, updated_user)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id`,
      paymentCarrierData
    );
    return rows[0];
  };

  const getBankAccount = async (userId, accountNo) => {
    const { rows } = await connectPayment.query(
      `SELECT id FROM bank_account WHERE user_id = ${userId} AND account_no = '${accountNo}' LIMIT 1;`
    );
    return rows[0];
  };

  const addBankAccount = async (bankData) => {
    const { rows } = await connectPayment.query(
      `INSERT INTO bank_account(user_id, account_name, account_no, bank_name, created_at, updated_at, created_user, updated_user)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      bankData
    );
    return rows[0];
  };

  const addShipment = async (shipmentData) => {
    const rowQueryShipment = ShipmentModel.insert(shipmentData).toQuery();
    return connectJob.query(rowQueryShipment);
  };

  const getFullTextSearch = async ({
    productName,
    ownerName,
    loadingAddress,
    loadingContactName,
    loadingContactPhone,
    shipmentAddress,
    shipmentContactName,
    shipmentContactPhone,
  }) => {
    const { rows } = await connectJob.query(`SELECT 
    setweight(to_tsvector('english', COALESCE('${productName}', '')), 'A')
    || setweight(to_tsvector('english', COALESCE('${ownerName}', '')), 'B')
    
    || (setweight(to_tsvector('english', COALESCE('${loadingAddress}', '')), 'C')
    || setweight(to_tsvector('english', COALESCE('${loadingContactName}', '')), 'C')
    || setweight(to_tsvector('english', COALESCE('${loadingContactPhone}', '')), 'C'))
    
    || (setweight(to_tsvector('english', COALESCE('${shipmentAddress}', '')), 'D')
    || setweight(to_tsvector('english', COALESCE('${shipmentContactName}', '')), 'D')
    || setweight(to_tsvector('english', COALESCE('${shipmentContactPhone}', '')), 'D')) AS full_text_search;`);
    return rows[0].full_text_search;
  };

  const data = [sheet1, sheet2, sheet3, sheet4, sheet5, sheet6, sheet7, sheet8, sheet9, ...sheet11];
  // const data = [...sheet11];

  const createdBy = 'system';
  const userIntoCognito = [];
  const users = [];

  for (const key of data) {
    const user = await getUserByPhoneNumber(key.phoneNumber);

    let shipperUserId = null;
    if (!user) {
      // add new shipper
      console.log('add new shipper');
      const shipperData = [key.phoneNumber, key.fullName, createdBy, 'SHIPPER'];
      // const rowQueryUser = UserProfileModel.insert(shipperData).toQuery();
      const shipper = await addUser(shipperData);
      console.log('shipper :>> ', shipper);
      shipperUserId = shipper.id;

      users.push({
        id: shipperUserId,
        phoneNumber: key.phoneNumber,
      });

      // add new user role
      console.log('add new user role');
      await addUserRole({
        user_id: shipperUserId,
        role_id: 5,
      });

      if (key.addressNo || key.moo || key.road || key.zipCode) {
        // add new address
        console.log('add new address');
        const addressData = {
          user_id: shipperUserId,
          address_no: key.addressNo,
          moo: key.moo,
          road: key.road,
          zip_code: key.zipCode,
          created_by: createdBy,
        };
        const rowQueryAddress = AddressModel.insert(JSON.parse(JSON.stringify(addressData))).toQuery();
        await connectUser.query(rowQueryAddress);
      }
    } else {
      shipperUserId = user.id;
    }

    const arrayDate = {};
    let jobId;
    for (const attr of key.trips) {
      if (!arrayDate[attr['วันที่ขึ้นสินค้า'].trim()]) {
        const [lat, lng] = await getLatLng(attr['สถานที่ขึ้นสินค้า'].trim());
        // add new job
        console.log('add new job');
        const jobData = [
          convertStringNumberToNumeric(attr['ราคารวมตัน'] || attr['ราคาที่ Shipper จ่าย']),
          createdBy,
          createdBy,
          shipperUserId,
          key.productTypeId,
          key.productName,
          attr['เลขใบชั่งต้นทาง'] === '-' || !attr['เลขใบชั่งต้นทาง'] ? '0' : attr['เลขใบชั่งต้นทาง'].toString().trim(),
          checkTruckType(attr['ประเภท'].trim()),
          convertDate(attr['วันที่ขึ้นสินค้า'].trim()),
          attr['สถานที่ขึ้นสินค้า'].trim(),
          lng,
          lat,
          // 'loading_contact_nameattr.,
          // 'loading_contact_phoneattr.,
          1,
          1,
          'PER_TON',
          checkTipper(attr['ประเภท'].trim()),
          await getFullTextSearch({
            productName: key.productName,
            ownerName: attr['บริษัท/ บุคคล ชื่อ'],
            loadingAddress: attr['สถานที่ขึ้นสินค้า'].trim(),
            loadingContactName: '',
            loadingContactPhone: '',
            shipmentAddress: attr['สถานที่ลงสินค้า'],
            shipmentContactName: '',
            shipmentContactPhone: '',
          }),
          attr['เลขใบชั่งปลายทาง'] ? 'DONE' : 'INPROGRESS',
        ];
        console.log('jobData :>> ', jobData);

        // const rowQueryJob = JobModel.insert(jobData).toQuery();
        // await connectJob.query(rowQueryJob);

        const job = await addJob(jobData);
        jobId = job.id;

        // add new shipment
        console.log('add new shipment');
        const [latDest, lngDest] = await getLatLng(attr['สถานที่ขึ้นสินค้า'].trim());
        const shipmentData = {
          job_id: jobId,
          address_dest: attr['สถานที่ลงสินค้า'].trim(),
          longitude_dest: latDest,
          latitude_dest: lngDest,
          fullname_dest: '',
          phone_dest: '',
          created_user: createdBy,
          updated_user: createdBy,
          status: attr['เลขใบชั่งปลายทาง'] ? 'DONE' : 'INPROGRESS',
        };
        await addShipment(shipmentData);

        let carrier = await getUserByName(attr['บริษัท/ บุคคล ชื่อ'].trim());
        if (!carrier) {
          // add new carrier
          console.log('add new carrier');
          const phoneNumber = randomPhoneNumber();
          const carrierData = [phoneNumber, attr['บริษัท/ บุคคล ชื่อ'].trim(), createdBy, 'CARRIER'];
          carrier = await addUser(carrierData);

          // add new user role
          console.log('add new user role');
          await addUserRole({
            user_id: carrier.id,
            role_id: 5,
          });

          users.push({
            id: carrier.id,
            phoneNumber: phoneNumber,
          });
        }
        const carrierId = carrier.id;

        let truck = await getTruckByRegistrationNumber(attr['ทะเบียนรถ'].trim());
        if (!truck) {
          // add new truck
          console.log('add new truck');
          const truckData = [
            carrierId,
            attr['ทะเบียนรถ'].trim(),
            attr['เลขใบชั่งต้นทาง'] === '-' || !attr['เลขใบชั่งต้นทาง']
              ? null
              : attr['เลขใบชั่งต้นทาง'].toString().trim(),
            createdBy,
            createdBy,
            checkTruckType(attr['ประเภท'].trim()),
            'ACTIVE',
            mmtz(new Date()).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss'),
            checkTipper(attr['ประเภท'].trim()),
            'MEDIUM',
          ];
          console.log('truckData :>> ', truckData);
          truck = await addTruck(truckData);

          await addTruckWorkingZone([truck.id, 7, createdBy, createdBy]);
        }
        const truckId = truck.id;

        let jobCarrier = await getJobCarrier(jobId, carrierId);
        if (!jobCarrier) {
          // add new job carrier
          console.log('add new job carrier');
          jobCarrier = await addJobCarrier([jobId, carrierId]);
        }

        // add new trip
        console.log('add new trip');
        const tripData = [
          jobCarrier.id,
          truckId,
          attr['ส่วนต่างที่ CGL ได้รับ'] ? 'PER_TRIP' : 'PER_TON',
          attr['เลขใบชั่งปลายทาง'] || attr['ส่วนต่างที่ CGL ได้รับ'] ? 'DONE' : 'INPROGRESS',
          createdBy,
          createdBy,
          convertDate(attr['วันที่ขึ้นสินค้า'].trim()),
          attr['เลขใบชั่งต้นทาง'] === '-' || !attr['เลขใบชั่งต้นทาง']
            ? null
            : attr['เลขใบชั่งต้นทาง'].toString().trim(),
          attr['เลขใบชั่งปลายทาง'] === '-' || !attr['เลขใบชั่งปลายทาง']
            ? null
            : attr['เลขใบชั่งปลายทาง'].toString().trim(),
        ];
        const trip = await addTrip(tripData);

        let bankAccount = await getBankAccount(carrierId, attr['เลขบัญชี'].trim());
        if (!bankAccount) {
          // add new bank account
          console.log('add new bank account');
          bankAccount = await addBankAccount([
            carrierId,
            attr['ชื่อบัญชี'].trim(),
            attr['เลขบัญชี'].trim(),
            attr['ธนาคาร'].trim(),
            mmtz(new Date()).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss'),
            mmtz(new Date()).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss'),
            createdBy,
            createdBy,
          ]);
        }

        // add new payment shipper
        console.log('add new payment shipper');
        await addPaymentShipper([
          trip.id,
          attr['ราคา'] === '-' || !attr['ราคา'] ? null : convertStringNumberToNumeric(attr['ราคา'].toString().trim()),
          convertStringNumberToNumeric(attr['ราคารวมตัน'] || attr['ราคาที่ Shipper จ่าย']), // amount
          attr['note'] || !attr['หัก 1 %'] || attr['หัก 1 %'] === '-' ? '0' : attr['หัก 1 %'].toString().trim(), // fee_amount
          attr['note'] || !attr['หัก 1 %'] || attr['หัก 1 %'] === '-' ? '0' : '1', // fee_percentage
          attr['ยอดรับ']
            ? convertStringNumberToNumeric(attr['ยอดรับ'])
            : convertStringNumberToNumeric(attr['ราคารวมตัน']), // net_amount
          attr['Shipper โอนเงินวันที่'] ? 'PAID' : 'PAYMENT_DUE',
          attr['วันที่วางบิล'] ? convertDate(attr['วันที่วางบิล'].trim()) : null, // bill_start_date
          // mmtz(convertDate(attr['Shipper โอนเงินวันที่'].trim()))
          //       .tz('Asia/Bangkok')
          //       .add(-1, 'd')
          //       .format('YYYY-MM-DD')
          mmtz(new Date()).tz('Asia/Bangkok').format('YYYY-MM-DD'), //payment_date,
          mmtz(new Date()).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss'),
          mmtz(new Date()).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss'),
          createdBy,
          createdBy,
        ]);

        // add new payment carrier
        console.log('add new payment carrier');
        await addPaymentCarrier([
          trip.id,
          bankAccount.id,
          !attr['ราคาต่อตัน'] || attr['ราคาต่อตัน'] === '-'
            ? null
            : convertStringNumberToNumeric(attr['ราคาต่อตัน'].toString().trim()),
          convertStringNumberToNumeric(attr['จำนวนเงิน']), // amount
          convertStringNumberToNumeric(attr['หัก 1%']), // fee_amount
          '1', // fee_percentage
          convertStringNumberToNumeric(attr['ยอดจ่าย']), // net_amount
          attr['สถานะ การโอน'] ? 'PAID' : 'AWAITING',
          mmtz(new Date()).tz('Asia/Bangkok').format('YYYY-MM-DD'), //payment_date,
          mmtz(new Date()).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss'),
          mmtz(new Date()).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss'),
          createdBy,
          createdBy,
        ]);

        const driverPhone = converPhoneNumberFormat(attr['เบอร์ พขร.'].toString().trim());
        const userDriver = await getUserByPhoneNumber(driverPhone);
        if (!userDriver) {
          // add new driver
          console.log('add new driver');
          const driverData = [driverPhone, attr['พขร.'].trim(), createdBy, null];
          const driver = await addUser(driverData);

          users.push({
            id: driver.id,
            phoneNumber: driverPhone,
          });

          await addUserRole({
            user_id: driver.id,
            role_id: 3,
          });
        }

        arrayDate[attr['วันที่ขึ้นสินค้า'].trim()] = jobId;
      } else {
        const [latDest, lngDest] = await getLatLng(attr['สถานที่ขึ้นสินค้า'].trim());
        const shipmentData = {
          job_id: arrayDate[attr['วันที่ขึ้นสินค้า'].trim()],
          address_dest: attr['สถานที่ลงสินค้า'].trim(),
          longitude_dest: latDest,
          latitude_dest: lngDest,
          fullname_dest: '',
          phone_dest: '',
          created_user: createdBy,
          updated_user: createdBy,
          status: attr['เลขใบชั่งปลายทาง'] ? 'DONE' : 'INPROGRESS',
        };
        await addShipment(shipmentData);

        let carrier = await getUserByName(attr['บริษัท/ บุคคล ชื่อ'].trim());
        if (!carrier) {
          // add new carrier
          console.log('add new carrier');
          const phoneNumber = randomPhoneNumber();
          const carrierData = [phoneNumber, attr['บริษัท/ บุคคล ชื่อ'].trim(), createdBy, 'CARRIER'];
          carrier = await addUser(carrierData);

          // add new user role
          console.log('add new user role');
          await addUserRole({
            user_id: carrier.id,
            role_id: 5,
          });

          users.push({
            id: carrier.id,
            phoneNumber: phoneNumber,
          });
        }
        const carrierId = carrier.id;

        let truck = await getTruckByRegistrationNumber(attr['ทะเบียนรถ'].trim());
        if (!truck) {
          // add new truck
          console.log('add new truck');
          const truckData = [
            carrierId,
            attr['ทะเบียนรถ'].trim(),
            attr['เลขใบชั่งต้นทาง'] === '-' || !attr['เลขใบชั่งต้นทาง']
              ? null
              : attr['เลขใบชั่งต้นทาง'].toString().trim(),
            createdBy,
            createdBy,
            checkTruckType(attr['ประเภท'].trim()),
            'ACTIVE',
            mmtz(new Date()).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss'),
            checkTipper(attr['ประเภท'].trim()),
            'MEDIUM',
          ];
          console.log('truckData :>> ', truckData);
          truck = await addTruck(truckData);

          await addTruckWorkingZone([truck.id, 7, createdBy, createdBy]);
        }
        const truckId = truck.id;

        let jobCarrier = await getJobCarrier(jobId, carrierId);
        if (!jobCarrier) {
          // add new job carrier
          console.log('add new job carrier');
          jobCarrier = await addJobCarrier([jobId, carrierId]);
        }

        // add new trip
        console.log('add new trip');
        const tripData = [
          jobCarrier.id,
          truckId,
          attr['ส่วนต่างที่ CGL ได้รับ'] ? 'PER_TRIP' : 'PER_TON',
          attr['เลขใบชั่งปลายทาง'] || attr['ส่วนต่างที่ CGL ได้รับ'] ? 'DONE' : 'INPROGRESS',
          createdBy,
          createdBy,
          convertDate(attr['วันที่ขึ้นสินค้า'].trim()),
          attr['เลขใบชั่งต้นทาง'] === '-' || !attr['เลขใบชั่งต้นทาง']
            ? null
            : attr['เลขใบชั่งต้นทาง'].toString().trim(),
          attr['เลขใบชั่งปลายทาง'] === '-' || !attr['เลขใบชั่งปลายทาง']
            ? null
            : attr['เลขใบชั่งปลายทาง'].toString().trim(),
        ];
        const trip = await addTrip(tripData);

        let bankAccount = await getBankAccount(carrierId, attr['เลขบัญชี']);
        if (!bankAccount) {
          // add new bank account
          console.log('add new bank account');
          bankAccount = await addBankAccount([
            carrierId,
            attr['ชื่อบัญชี'].trim(),
            attr['เลขบัญชี'].trim(),
            attr['ธนาคาร'].trim(),
            mmtz(new Date()).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss'),
            mmtz(new Date()).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss'),
            createdBy,
            createdBy,
          ]);
        }

        // add new payment shipper
        console.log('add new payment shipper');
        await addPaymentShipper([
          trip.id,
          attr['ราคา'] === '-' || !attr['ราคา'] ? null : convertStringNumberToNumeric(attr['ราคา'].toString().trim()),
          convertStringNumberToNumeric(attr['ราคารวมตัน'] || attr['ราคาที่ Shipper จ่าย']), // amount
          attr['note'] || !attr['หัก 1 %'] || attr['หัก 1 %'] === '-' ? '0' : attr['หัก 1 %'].toString().trim(), // fee_amount
          attr['note'] || !attr['หัก 1 %'] || attr['หัก 1 %'] === '-' ? '0' : '1', // fee_percentage
          attr['ยอดรับ']
            ? convertStringNumberToNumeric(attr['ยอดรับ'])
            : convertStringNumberToNumeric(attr['ราคารวมตัน']), // net_amount
          attr['Shipper โอนเงินวันที่'] ? 'PAID' : 'PAYMENT_DUE',
          attr['วันที่วางบิล'] ? convertDate(attr['วันที่วางบิล'].trim()) : null, // bill_start_date
          mmtz(new Date()).tz('Asia/Bangkok').format('YYYY-MM-DD'), //payment_date,
          mmtz(new Date()).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss'),
          mmtz(new Date()).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss'),
          createdBy,
          createdBy,
        ]);

        // add new payment carrier
        console.log('add new payment carrier');
        await addPaymentCarrier([
          trip.id,
          bankAccount.id,
          !attr['ราคาต่อตัน'] || attr['ราคาต่อตัน'] === '-'
            ? null
            : convertStringNumberToNumeric(attr['ราคาต่อตัน'].toString().trim()),
          convertStringNumberToNumeric(attr['จำนวนเงิน']), // amount
          convertStringNumberToNumeric(attr['หัก 1%']), // fee_amount
          '1', // fee_percentage
          convertStringNumberToNumeric(attr['ยอดจ่าย']), // net_amount
          attr['สถานะ การโอน'] ? 'PAID' : 'AWAITING',
          mmtz(new Date()).tz('Asia/Bangkok').format('YYYY-MM-DD'), //payment_date,
          mmtz(new Date()).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss'),
          mmtz(new Date()).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss'),
          createdBy,
          createdBy,
        ]);

        const driverPhone = converPhoneNumberFormat(attr['เบอร์ พขร.'].toString().trim());
        const userDriver = await getUserByPhoneNumber(driverPhone);
        if (!userDriver) {
          // add new driver
          console.log('add new driver');
          const driverData = [driverPhone, attr['พขร.'].trim(), createdBy, null];
          const driver = await addUser(driverData);

          users.push({
            id: driver.id,
            phoneNumber: driverPhone,
          });

          await addUserRole({
            user_id: driver.id,
            role_id: 3,
          });
        }
      }
    }
  }

  console.log('users :>> ', JSON.stringify(users));

  const userIntoDynamo = await Promise.all(
    users.map(async (user) => {
      const password = generatePassword(12);
      const passwordEncrypted = await encryptByKms(password);
      const item = {
        username: user.phoneNumber,
        password: password,
      };
      userIntoCognito.push({
        id: user.id,
        userId: hashids.encode(user.id),
        ...item,
      });
      return {
        PutRequest: {
          Item: { ...item, password: passwordEncrypted },
        },
      };
    })
  );

  console.log('userIntoCognito :>> ', JSON.stringify(userIntoCognito));

  const lengthOfUser = Math.ceil(userIntoDynamo.length / 20);
  console.log('lengthOfUser :>> ', lengthOfUser);

  const userIntoDynamoChunks = Array.from({ length: lengthOfUser }, (_) => []);
  userIntoDynamo.forEach((value, index) => userIntoDynamoChunks[index % userIntoDynamoChunks.length].push(value));

  const userIntoCognitoChunks = Array.from({ length: lengthOfUser }, (_) => []);
  userIntoCognito.forEach((value, index) => userIntoCognitoChunks[index % userIntoCognitoChunks.length].push(value));

  console.log('userIntoDynamoChunks :>> ', JSON.stringify(userIntoDynamoChunks));
  console.log('userIntoCognitoChunks :>> ', JSON.stringify(userIntoCognitoChunks));

  await Promise.all(
    userIntoDynamoChunks.map(async (attr, index) => {
      setTimeout(async () => {
        console.log('attr.length :>> ', attr.length);
        console.log('index :>> ', index);
        return bulkInsert(attr);
      }, 1000 * index);
    })
  );

  let i = 0;

  async function insertIntoCognito(userData) {
    setTimeout(async () => {
      await Promise.all(
        userData[i].map(async (user) => {
          await createUser(user.username, user.password, user.userId);
          await setUserPassword(user.username, user.password);
          return true;
        })
      );
      console.log('loop count :>>', i);
      i++;
      if (i < userData.length) {
        return insertIntoCognito(userData);
      }
      console.log('loop end');
      console.log('Finished!!');
    }, 2000);
  }

  await insertIntoCognito(userIntoCognitoChunks);
};

run().catch((err) => console.log('error :>> ', err));

/*
SELECT setval('product_type_id_seq', COALESCE((SELECT MAX(id)+1 FROM product_type), 1), false);
SELECT setval('address_id_seq', COALESCE((SELECT MAX(id)+1 FROM address), 1), false);
SELECT setval('booking_seq', COALESCE((SELECT MAX(id)+1 FROM booking), 1), false);
SELECT setval('job_id_seq', COALESCE((SELECT MAX(id)+1 FROM job), 1), false);
SELECT setval('job_carrier_id_seq', COALESCE((SELECT MAX(id)+1 FROM job_carrier), 1), false);
SELECT setval('payment_carrier_id_seq', COALESCE((SELECT MAX(id)+1 FROM payment_carrier), 1), false);
SELECT setval('payment_shipper_id_seq', COALESCE((SELECT MAX(id)+1 FROM payment_shipper), 1), false);
SELECT setval('shipment_id_seq', COALESCE((SELECT MAX(id)+1 FROM shipment), 1), false);
SELECT setval('trip_id_seq', COALESCE((SELECT MAX(id)+1 FROM trip), 1), false);
SELECT setval('truck_seq', COALESCE((SELECT MAX(id)+1 FROM truck), 1), false);
SELECT setval('truck_working_zone_seq', COALESCE((SELECT MAX(id)+1 FROM truck_working_zone), 1), false);
SELECT setval('user_profile_id_seq', COALESCE((SELECT MAX(id)+1 FROM user_profile), 1), false);
SELECT setval('user_role_id_seq', COALESCE((SELECT MAX(id)+1 FROM user_role), 1), false);
*/
