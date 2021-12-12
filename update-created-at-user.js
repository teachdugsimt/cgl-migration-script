require('dotenv').config();
const mmtz = require('moment-timezone');
const { Pool } = require('pg');

const run = async () => {
  const clientFrom = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_LEGACY,
    port: process.env.DB_PORT,
  });
  const clientTo = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: 'user_service',
    port: process.env.DB_PORT,
  });

  const connectFrom = await clientFrom.connect();
  const connectTo = await clientTo.connect();

  const { rows: userOld } = await connectFrom.query('SELECT id, email, phone_number, created_at FROM dtb_user');

  // userOld.forEach(async (user) => {
  //   const oldTime = mmtz(user.created_at).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss');
  //   if (user.email) {
  //     await connectTo.query(`UPDATE user_profile SET created_at = '${oldTime}' WHERE email = '${user.email}'`);
  //   }
  //   if (user.phone_number) {
  //     await connectTo.query(
  //       `UPDATE user_profile SET created_at = '${oldTime}' WHERE phone_number = '${user.phone_number}'`
  //     );
  //   }
  // });

  for (const user of userOld) {
    const oldTime = mmtz(user.created_at).tz('Asia/Bangkok').format('YYYY-MM-DD HH:mm:ss');
    if (user.email) {
      await connectTo.query(`UPDATE user_profile SET created_at = '${oldTime}' WHERE email = '${user.email}'`);
    }
    if (user.phone_number) {
      await connectTo.query(
        `UPDATE user_profile SET created_at = '${oldTime}' WHERE phone_number = '${user.phone_number}'`
      );
    }
  }

  console.log('Finished !!');
};

run();
