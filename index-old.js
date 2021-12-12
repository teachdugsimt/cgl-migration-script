const { Pool, Client } = require('pg');
// const copyFrom = require('pg-copy-streams').from;
// const copyTo = require('pg-copy-streams').to;
const fs = require('fs');
const sql = require('sql');
const ssh2 = require('ssh2');

const poolFrom = new Pool({
  // host: '/remote-postgres',
  // host: '127.0.0.1',
  // port: process.env.DB_PORT
  // user: 'root',
  // password: '@n3L!nkioT',
  // database: 'cargolink',
  host: '127.0.0.1', // Important to connect to localhost after connecting via ssh in screen
  user: 'cargolink',
  password: 'cargolink',
  database: 'cargolink',
  port: process.env.DB_PORT,
});

const poolTo = new Pool({
  host: 'cgl-dev-db.chbn9ns43yos.ap-southeast-1.rds.amazonaws.com',
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: '=5BjfT_-uaa98yYymACI2415a==LA,',
  database: 'cgl-dev-db',
});

let RoleClone = sql.define({
  name: 'role_clone',
  columns: ['id', 'name'],
});

const run = async () => {
  try {
    const connectFrom = await poolFrom.connect();
    const roleFrom = await connectFrom.query('SELECT * FROM role');
    console.log('roleFrom :>> ', roleFrom.rows);
  } catch (err) {
    console.log('err :>> ', err);
  }

  // const connectTo = await poolFrom.connect();
  // // const roleTo = await connectTo.query('SELECT * FROM role_clone');
  // // console.log('roleTo :>> ', roleTo.rows);
  // const query = RoleClone.insert(roleFrom.rows).toQuery();
  // await connectTo.query(query);

  return true;
};

/*
ssh -fCPN –L 5432:127.0.0.1:5432 -p1046 root@52.221.70.224

ssh -fCPN –L 3307:10.164.172.204:3306 -p1046 rds-user@106.2.32.177

*/
run();

// const connectionString = 'postgres://user:password@127.0.0.1:5432/cargolink';
// const client = new Client(connectionString);
// client.connect((err) => {
//   if (err) {
//     console.log(err);
//   }
// });

const pgHost = 'localhost', // remote hostname/ip
  pgPort = process.env.DB_PORT;
proxyPort = process.env.DB_PORT;
ready = false;

// const proxy = require('net').createServer(function (sock) {
//   if (!ready) return sock.destroy();
//   c.forwardOut(sock.remoteAddress, sock.remotePort, pgHost, pgPort, function (err, stream) {
//     if (err) return sock.destroy();
//     sock.pipe(stream);
//     stream.pipe(sock);
//   });
// });
// proxy.listen(proxyPort, '127.0.0.1');

// const c = new ssh2();
// c.connect({
//   host: '52.221.70.224',
//   port: 22,
//   username: 'root',
// });
// c.on('connect', function () {
//   console.log('Connection :: connect');
// });
// c.on('ready', function () {
//   let ready = true;
//   const conString = 'postgres://user:password@127.0.0.1:' + proxyPort + '/cargolink';
//   const client = new Client(conString);
//   client.connect(function (err) {
//     // ....
//   });
// });

// const conString = 'postgres://cargolink:cargolink@127.0.0.1:' + proxyPort + '/cargolink';
// const client = new Client(conString);
// client.connect(function (err) {
//   // ....
//   if (err) console.log(err);
// });
