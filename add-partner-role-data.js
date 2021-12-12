require('dotenv').config();
const { Pool } = require('pg');

const sqlCreateNewTblUserProfile = `INSERT INTO "public"."role" ("fullname", "name", "created_by") VALUES
('Partner', 'ROLE_PARTNER', 'system');`;

const run = async () => {
  const clientTo = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'user_service',
    port: process.env.DB_PORT,
  });

  const connectTo = await clientTo.connect();

  await connectTo.query(sqlCreateNewTblUserProfile);

  console.log('Finished!!');

  return true;
};

run();
