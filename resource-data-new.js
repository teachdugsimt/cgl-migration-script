const resourceActionData = [
  {
    role_id: 1,
    resource_id: 1,
    action: 'read:any',
    url: '/api/v1/users',
  },
  {
    role_id: 1,
    resource_id: 1,
    action: 'read:any',
    url: '/api/v1/users/me',
  },
  {
    role_id: 1,
    resource_id: 1,
    action: 'update:any',
    url: '/api/v1/users/me',
  },
  {
    role_id: 1,
    resource_id: 1,
    action: 'read:any',
    url: '/api/v1/users/:userId',
  },
  {
    role_id: 1,
    resource_id: 1,
    action: 'update:any',
    url: '/api/v1/users/:userId',
  },
  {
    role_id: 1,
    resource_id: 1,
    action: 'read:any',
    url: '/api/v1/users/profiles/truck-summary',
  },
  {
    role_id: 1,
    resource_id: 1,
    action: 'create:any',
    url: '/api/v1/users/:id/gen-doc-upload-link',
  },
  {
    role_id: 1,
    resource_id: 1,
    action: 'create:any',
    url: '/api/v1/users/:id/clear-upload-link',
  },
  {
    role_id: 1,
    resource_id: 2,
    action: 'read:any',
    url: '/api/v1/jobs',
  },
  {
    role_id: 1,
    resource_id: 2,
    action: 'read:any',
    url: '/api/v1/jobs/:id',
  },
  {
    role_id: 1,
    resource_id: 2,
    action: 'create:any',
    url: '/api/v1/jobs',
  },
  {
    role_id: 1,
    resource_id: 2,
    action: 'update:any',
    url: '/api/v1/jobs/:id',
  },
  {
    role_id: 1,
    resource_id: 2,
    action: 'delete:any',
    url: '/api/v1/jobs/:id',
  },
  {
    role_id: 1,
    resource_id: 2,
    action: 'read:any',
    url: '/api/v1/jobs/favorite',
  },
  {
    role_id: 1,
    resource_id: 2,
    action: 'create:any',
    url: '/api/v1/jobs/favorite',
  },
  {
    role_id: 1,
    resource_id: 2,
    action: 'read:any',
    url: '/api/v1/jobs/me',
  },
  {
    role_id: 1,
    resource_id: 2,
    action: 'create:any',
    url: '/api/v1/jobs/rating',
  },
  {
    role_id: 1,
    resource_id: 2,
    action: 'create:any',
    url: '/api/v1/jobs/users',
  },
  {
    role_id: 1,
    resource_id: 2,
    action: 'read:any',
    url: '/api/v1/jobs/history/call',
  },
  {
    role_id: 1,
    resource_id: 2,
    action: 'create:any',
    url: '/api/v1/jobs/history/call',
  },
  {
    role_id: 1,
    resource_id: 3,
    action: 'read:any',
    url: '/api/v1/trucks',
  },
  {
    role_id: 1,
    resource_id: 3,
    action: 'read:any',
    url: '/api/v1/trucks/:id',
  },
  {
    role_id: 1,
    resource_id: 3,
    action: 'create:any',
    url: '/api/v1/trucks',
  },
  {
    role_id: 1,
    resource_id: 3,
    action: 'update:any',
    url: '/api/v1/trucks/:id',
  },
  {
    role_id: 1,
    resource_id: 3,
    action: 'delete:any',
    url: '/api/v1/trucks/:id',
  },
  {
    role_id: 1,
    resource_id: 3,
    action: 'read:any',
    url: '/api/v1/trucks/favorite',
  },
  {
    role_id: 1,
    resource_id: 3,
    action: 'create:any',
    url: '/api/v1/trucks/favorite',
  },
  {
    role_id: 1,
    resource_id: 3,
    action: 'read:any',
    url: '/api/v1/trucks/me',
  },
  {
    role_id: 1,
    resource_id: 3,
    action: 'read:any',
    url: '/api/v1/trucks/quotation/:id',
  },
  {
    role_id: 1,
    resource_id: 3,
    action: 'read:any',
    url: '/api/v1/trucks/users',
  },
  {
    role_id: 1,
    resource_id: 3,
    action: 'read:any',
    url: '/api/v1/trucks/history/call',
  },
  {
    role_id: 1,
    resource_id: 3,
    action: 'create:any',
    url: '/api/v1/trucks/history/call',
  },
  {
    role_id: 1,
    resource_id: 5,
    action: 'create:any',
    url: '/api/v1/messaging/email',
  },
  {
    role_id: 1,
    resource_id: 5,
    action: 'create:any',
    url: '/api/v1/messaging/email/template',
  },
  {
    role_id: 1,
    resource_id: 5,
    action: 'create:any',
    url: '/api/v1/messaging/sms',
  },
  {
    role_id: 1,
    resource_id: 5,
    action: 'create:any',
    url: '/api/v1/messaging/line',
  },
  {
    role_id: 1,
    resource_id: 5,
    action: 'create:any',
    url: '/api/v1/messaging/push-notification',
  },
  {
    role_id: 1,
    resource_id: 6,
    action: 'create:any',
    url: '/api/v1/media/uploads',
  },
  {
    role_id: 1,
    resource_id: 6,
    action: 'create:any',
    url: '/api/v1/media/confirm',
  },
  // ------>
  {
    role_id: 4,
    resource_id: 1,
    action: 'read:any',
    url: '/api/v1/users/me',
  },
  {
    role_id: 4,
    resource_id: 1,
    action: 'update:any',
    url: '/api/v1/users/me',
  },
  {
    role_id: 4,
    resource_id: 1,
    action: 'read:owner',
    url: '/api/v1/users/profiles/truck-summary',
  },
  {
    role_id: 4,
    resource_id: 2,
    action: 'read:any',
    url: '/api/v1/jobs',
  },
  {
    role_id: 4,
    resource_id: 2,
    action: 'read:any',
    url: '/api/v1/jobs/:id',
  },
  {
    role_id: 4,
    resource_id: 2,
    action: 'create:owner',
    url: '/api/v1/jobs',
  },
  {
    role_id: 4,
    resource_id: 2,
    action: 'update:owner',
    url: '/api/v1/jobs/:id',
  },
  {
    role_id: 4,
    resource_id: 2,
    action: 'delete:owner',
    url: '/api/v1/jobs/:id',
  },
  {
    role_id: 4,
    resource_id: 2,
    action: 'read:owner',
    url: '/api/v1/jobs/favorite',
  },
  {
    role_id: 4,
    resource_id: 2,
    action: 'create:owner',
    url: '/api/v1/jobs/favorite',
  },
  {
    role_id: 4,
    resource_id: 2,
    action: 'read:owner',
    url: '/api/v1/jobs/me',
  },
  {
    role_id: 4,
    resource_id: 2,
    action: 'create:owner',
    url: '/api/v1/jobs/rating',
  },
  {
    role_id: 4,
    resource_id: 2,
    action: 'create:owner',
    url: '/api/v1/jobs/users',
  },
  {
    role_id: 4,
    resource_id: 2,
    action: 'read:owner',
    url: '/api/v1/jobs/history/call',
  },
  {
    role_id: 4,
    resource_id: 2,
    action: 'create:owner',
    url: '/api/v1/jobs/history/call',
  },
  {
    role_id: 4,
    resource_id: 3,
    action: 'read:any',
    url: '/api/v1/trucks',
  },
  {
    role_id: 4,
    resource_id: 3,
    action: 'read:any',
    url: '/api/v1/trucks/:id',
  },
  {
    role_id: 4,
    resource_id: 3,
    action: 'create:owner',
    url: '/api/v1/trucks',
  },
  {
    role_id: 4,
    resource_id: 3,
    action: 'update:owner',
    url: '/api/v1/trucks/:id',
  },
  {
    role_id: 4,
    resource_id: 3,
    action: 'delete:owner',
    url: '/api/v1/trucks/:id',
  },
  {
    role_id: 4,
    resource_id: 3,
    action: 'read:owner',
    url: '/api/v1/trucks/favorite',
  },
  {
    role_id: 4,
    resource_id: 3,
    action: 'create:owner',
    url: '/api/v1/trucks/favorite',
  },
  {
    role_id: 4,
    resource_id: 3,
    action: 'read:owner',
    url: '/api/v1/trucks/me',
  },
  {
    role_id: 4,
    resource_id: 3,
    action: 'read:owner',
    url: '/api/v1/trucks/quotation/:id',
  },
  {
    role_id: 4,
    resource_id: 3,
    action: 'read:owner',
    url: '/api/v1/trucks/users',
  },
  {
    role_id: 4,
    resource_id: 3,
    action: 'read:owner',
    url: '/api/v1/trucks/history/call',
  },
  {
    role_id: 4,
    resource_id: 3,
    action: 'create:owner',
    url: '/api/v1/trucks/history/call',
  },
  {
    role_id: 4,
    resource_id: 5,
    action: 'create:any',
    url: '/api/v1/messaging/email',
  },
  {
    role_id: 4,
    resource_id: 5,
    action: 'create:any',
    url: '/api/v1/messaging/email/template',
  },
  {
    role_id: 4,
    resource_id: 5,
    action: 'create:any',
    url: '/api/v1/messaging/sms',
  },
  {
    role_id: 4,
    resource_id: 5,
    action: 'create:any',
    url: '/api/v1/messaging/line',
  },
  {
    role_id: 4,
    resource_id: 5,
    action: 'create:any',
    url: '/api/v1/messaging/push-notification',
  },
  {
    role_id: 4,
    resource_id: 6,
    action: 'create:any',
    url: '/api/v1/media/uploads',
  },
  {
    role_id: 4,
    resource_id: 6,
    action: 'create:any',
    url: '/api/v1/media/confirm',
  },
];

module.exports = {
  resourceActionData,
};

/*

// USER
GET	/api/v1/users
GET	/api/v1/users/me
PATCH	/api/v1/users/me
GET	/api/v1/users/:userId
PATCH	/api/v1/users/:userId
GET	/api/v1/users/profiles/truck-summary
POST	/api/v1/users/:id/gen-doc-upload-link
POST	/api/v1/users/:id/clear-upload-link


// JOB
GET	/api/v1/jobs
GET	/api/v1/jobs/:id
POST	/api/v1/jobs
PUT	/api/v1/jobs/:id
DELETE	/api/v1/jobs/:id
GET	/api/v1/jobs/favorite
POST	/api/v1/jobs/favorite
GET	/api/v1/jobs/me
POST	/api/v1/jobs/rating
POST	/api/v1/jobs/users
GET	/api/v1/jobs/history/call
POST	/api/v1/jobs/history/call


// VEHICLE
GET	/api/v1/trucks
GET	/api/v1/trucks/:id
POST	/api/v1/trucks
PUT	/api/v1/trucks/:id
DELETE	/api/v1/trucks/:id
GET	/api/v1/trucks/favorite
POST	/api/v1/trucks/favorite
GET	/api/v1/trucks/me
GET	/api/v1/trucks/quotation/:id
GET	/api/v1/trucks/users
GET	/api/v1/trucks/history/call
POST	/api/v1/trucks/history/call


// MESSAGING
POST	/api/v1/messaging/email
POST	/api/v1/messaging/email/template
POST	/api/v1/messaging/sms
POST	/api/v1/messaging/line
POST	/api/v1/messaging/push-notification

// MEDIA
POST	/api/v1/media/uploads
POST	/api/v1/media/confirm

*/
