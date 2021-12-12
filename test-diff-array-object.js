const _ = require('lodash');
const date = require('date-and-time');

const dataNew = [
  {
    name: 'เกาะลอย อำเภอศรีราชา ชลบุรี ประเทศไทย',
    dateTime: '03-07-2021 16:12:33',
    contactName: 'Um',
    contactMobileNo: '0988880000',
    lat: '13.173935',
    lng: '100.9203128',
  },
  {
    name: 'ถนนเขาทุเรียน-เขาน้อย ตำบล เขาพระ อำเภอเมืองนครนายก นครนายก 26000 ประเทศไทย',
    dateTime: '01-06-2021 09:12:33',
    contactName: 'Fun',
    contactMobileNo: '0900011111',
    lat: '14.240156708205872',
    lng: '101.2658803537488',
  },
];

const dataInDB = [
  {
    id: 3233,
    name: 'ถนนเขาทุเรียน-เขาน้อย ตำบล เขาพระ อำเภอเมืองนครนายก นครนายก 26000 ประเทศไทย',
    lng: '101.2658803537488',
    lat: '14.240156708205872',
    contactName: 'Fun',
    contactMobileNo: '0900011111',
    dateTime: '2021-06-01T02:12:33.000Z',
  },
  {
    id: 3234,
    name: 'เกาะลอย อำเภอศรีราชา ชลบุรี ประเทศไทย',
    lng: '100.9203128',
    lat: '13.173935',
    contactName: 'Um',
    contactMobileNo: '0988880000',
    dateTime: '2021-07-03T09:12:33.000Z',
  },
];
// 'name',
// 'lng',
// 'lat',
// 'contactName',
// 'contactMobileNo',
// 'dateTime',
const listForDelete = _.differenceWith(
  dataInDB,
  dataNew,
  (a, b) =>
    _.isEqual(a.contactMobileNo, b.contactMobileNo) &&
    _.isEqual(a.contactName, b.contactName) &&
    _.isEqual(date.format(new Date(a.dateTime), 'DD-MM-YYYY HH:mm:ss'), b.dateTime) &&
    _.isEqual(a.name, b.name) &&
    _.isEqual(a.lat, b.lat) &&
    _.isEqual(a.lng, b.lng)
);

const listForAdd = _.differenceWith(
  dataNew,
  dataInDB,
  (a, b) =>
    _.isEqual(a.contactMobileNo, b.contactMobileNo) &&
    _.isEqual(a.contactName, b.contactName) &&
    _.isEqual(a.dateTime, date.format(new Date(b.dateTime), 'DD-MM-YYYY HH:mm:ss')) &&
    _.isEqual(a.name, b.name) &&
    _.isEqual(a.lat, b.lat) &&
    _.isEqual(a.lng, b.lng)
);

console.log('listForDelete :>> ', listForDelete);
console.log('listForAdd :>> ', listForAdd);

// const presents = _.intersectionWith(array1, array2, ['name']);
// const dif = _.differenceWith(array1, array2, ['name']);
// const presents2 = _.intersectionWith(array2, array1, _.isEqual);
// const dif2 = _.differenceWith(array2, array1, _.isEqual);

// console.log('presents :>> ', presents);
// console.log('dif :>> ', dif);

// console.log('presents2 :>> ', presents2);
// console.log('dif2 :>> ', dif2);

// for (let i = 0; i < newArrayOne.length; i++) {}

// let x = [];
// const newArrayOne = arrayOne.sort((a, b) => (a.dateTime > b.dateTime ? 1 : b.dateTime > a.dateTime ? -1 : 0));

// const results = arrayOne.filter(
//   ({ name: n1, dateTime: dt1, contactName: ctn1, contactMobileNo: ctm1, lat: lat1, lng: lng1 }) =>
//     !arrayTwo.some(
//       ({
//         id,
//         addressDest: n2,
//         deliveryDatetime: dt2,
//         fullnameDest: ctn2,
//         phoneDest: ctm2,
//         latitudeDest: lat2,
//         longitudeDest: lng2,
//       }) =>
//         n2 === n1 &&
//         date.format(new Date(dt2), 'DD-MM-YYYY HH:mm:ss') === dt1 &&
//         ctn2 === ctn1 &&
//         ctm2 === ctm1 &&
//         lat2 === lat1 &&
//         lng2 === lng1
//     )
// );

// console.log(results);
// console.log('x :>> ', x);
// console.log('newArrayOne :>> ', newArrayOne);
