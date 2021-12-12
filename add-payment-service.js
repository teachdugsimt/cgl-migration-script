require('dotenv').config();
const { Pool } = require('pg');

const sqlAddPaymentDB = `CREATE DATABASE payment_service`;

const sqlAddEnumPaymentShipper = `CREATE TYPE enum_payment_shipper AS ENUM ('PAYMENT_DUE', 'PAID', 'VOID');`;
const sqlAddEnumPaymentCarrier = `CREATE TYPE enum_payment_carrier AS ENUM ('AWAITING', 'APPROVED', 'REJECTED', 'ISSUED', 'PAID');`;

const sqlCreateBankAccount = `CREATE TABLE bank_account(
	id SERIAL PRIMARY KEY,
	user_id INTEGER NOT NULL,
	account_name VARCHAR(150) NOT NULL,
	account_no VARCHAR(20) NOT NULL,
	bank_name VARCHAR(100),
	created_at TIMESTAMP,
	updated_at TIMESTAMP,
	created_user VARCHAR(100),
	updated_user VARCHAR(100),
	is_deleted BOOLEAN DEFAULT FALSE
);`;

const sqlCreatePaymentShipper = `CREATE TABLE payment_shipper(
	id BIGSERIAL PRIMARY KEY,
	trip_id INTEGER NOT NULL,
	price_per_ton numeric,
	amount numeric,
	fee_amount numeric,
	fee_percentage numeric DEFAULT 1,
	net_amount numeric,
	payment_status enum_payment_shipper,
	bill_start_date DATE,
	payment_date DATE,
	created_at TIMESTAMP,
	updated_at TIMESTAMP,
	created_user VARCHAR(100),
	updated_user VARCHAR(100),
	is_deleted BOOLEAN DEFAULT FALSE
);`;

const sqlCreatePaymentCarrier = `CREATE TABLE payment_carrier(
	id BIGSERIAL PRIMARY KEY,
	trip_id INTEGER NOT NULL,
	bank_account_id INTEGER,
	price_per_ton numeric,
	amount numeric,
	fee_amount numeric,
	fee_percentage numeric DEFAULT 1,
	net_amount numeric,
	payment_status enum_payment_carrier,
	payment_date DATE,
	created_at TIMESTAMP,
	updated_at TIMESTAMP,
	created_user VARCHAR(100),
	updated_user VARCHAR(100),
	is_deleted BOOLEAN DEFAULT FALSE
);`;

const run = async () => {
  const client = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });
  const connect = await client.connect();
  await connect.query(sqlAddPaymentDB);

  const clientFrom = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'payment_service',
    port: process.env.DB_PORT,
  });

  const connectFrom = await clientFrom.connect();

  await connectFrom.query(sqlAddEnumPaymentShipper);
  await connectFrom.query(sqlAddEnumPaymentCarrier);
  await connectFrom.query(sqlCreateBankAccount);
  await connectFrom.query(sqlCreatePaymentShipper);
  await connectFrom.query(sqlCreatePaymentCarrier);

  clientFrom.end();
  console.log('Finished');
  return true;
};

run();
