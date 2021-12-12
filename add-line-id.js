require('dotenv').config();
const { Pool } = require('pg');

const run = async () => {
  const clientUser = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'user_service',
    port: process.env.DB_PORT,
  });

  const connectUser = await clientUser.connect();

  await connectUser.query(`ALTER TABLE user_profile ADD line_id VARCHAR(50)`);
  await connectUser.query('ALTER TABLE user_profile ADD CONSTRAINT constraint_line_id UNIQUE (line_id);');

  console.log('Finished !!');
};

run();
