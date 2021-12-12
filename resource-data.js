const roles = [
  {
    id: 1,
    fullname: 'Admin',
    name: 'ROLE_ADMIN',
    version: 0,
    created_at: '2019-07-18 09:01:49',
    updated_at: '2019-07-18 09:01:49',
    created_user: null,
    updated_user: null,
    is_deleted: false,
  },
  {
    id: 2,
    fullname: 'Shipper',
    name: 'ROLE_SHIPPER',
    version: 0,
    created_at: '2019-07-18 09:01:49',
    updated_at: '2019-07-18 09:01:49',
    created_user: null,
    updated_user: null,
    is_deleted: false,
  },
  {
    id: 3,
    fullname: 'Carrier',
    name: 'ROLE_CARRIER',
    version: 0,
    created_at: '2019-07-18 09:01:49',
    updated_at: '2019-07-18 09:01:49',
    created_user: null,
    updated_user: null,
    is_deleted: false,
  },
  {
    id: 4,
    fullname: 'Driver',
    name: 'ROLE_DRIVER',
    version: 0,
    created_at: '2019-07-18 09:01:49',
    updated_at: '2019-07-18 09:01:49',
    created_user: null,
    updated_user: null,
    is_deleted: false,
  },
  {
    id: 5,
    fullname: 'Finance',
    name: 'ROLE_FINANCE',
    version: 0,
    created_at: '2019-12-03 02:44:12',
    updated_at: '2019-12-03 02:44:12',
    created_user: null,
    updated_user: null,
    is_deleted: false,
  },
  {
    id: 6,
    fullname: 'Operation manager',
    name: 'ROLE_OPERATION',
    version: 0,
    created_at: '2019-12-03 02:44:12',
    updated_at: '2019-12-03 02:44:12',
    created_user: null,
    updated_user: null,
    is_deleted: false,
  },
  {
    id: 7,
    fullname: 'Sale',
    name: 'ROLE_SALE',
    version: 0,
    created_at: '2020-01-03 06:31:31',
    updated_at: '2020-01-03 06:31:31',
    created_user: null,
    updated_user: null,
    is_deleted: false,
  },
  {
    id: 8,
    fullname: 'User',
    name: 'ROLE_USER',
    version: 0,
    created_at: '2021-05-28 07:38:46',
    updated_at: '2021-05-28 07:38:46',
    created_user: null,
    updated_user: null,
    is_deleted: false,
  },
];

const resourceData = [
  {
    id: 1,
    name: 'USER_MANAGEMENT',
  },
  {
    id: 2,
    name: 'JOB_MANAGEMENT',
  },
  {
    id: 3,
    name: 'TRUCK_MANAGEMENT',
  },
  {
    id: 4,
    name: 'BOOKING_MANAGEMENT',
  },
  {
    id: 5,
    name: 'MEDIA_MANAGEMENT',
  },
];

const resourceActionData = [
  {
    role_id: 1,
    resource_id: 1,
    action: 'read:any',
    url: '/api/v1/users/profiles',
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
    url: '/api/v1/users/profiles',
  },
  {
    role_id: 1,
    resource_id: 1,
    action: 'read:any',
    url: '/api/v1/users/profiles/:id',
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
    url: '/api/v1/jobs/owner',
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
    action: 'create:any',
    url: '/api/v1/jobs/rating',
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
    resource_id: 3,
    action: 'create:any',
    url: '/api/v1/trucks',
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
    action: 'read:any',
    url: '/api/v1/trucks/owner',
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
    action: 'read:any',
    url: '/api/v1/trucks/quotation/:id',
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
    resource_id: 3,
    action: 'read:any',
    url: '/api/v1/trucks/users',
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
    resource_id: 5,
    action: 'create:any',
    url: '/api/v1/media/uploads/images',
  },
  // ----- >
  {
    role_id: 8,
    resource_id: 1,
    action: 'read:owner',
    url: '/api/v1/users/profiles',
  },
  {
    role_id: 8,
    resource_id: 1,
    action: 'read:owner',
    url: '/api/v1/users/profiles/truck-summary',
  },
  {
    role_id: 8,
    resource_id: 1,
    action: 'create:owner',
    url: '/api/v1/users/profiles',
  },
  {
    role_id: 8,
    resource_id: 1,
    action: 'read:owner',
    url: '/api/v1/users/profiles/:id',
  },
  {
    role_id: 8,
    resource_id: 2,
    action: 'read:any',
    url: '/api/v1/jobs',
  },
  {
    role_id: 8,
    resource_id: 2,
    action: 'read:owner',
    url: '/api/v1/jobs/:id',
  },
  {
    role_id: 8,
    resource_id: 2,
    action: 'create:owner',
    url: '/api/v1/jobs',
  },
  {
    role_id: 8,
    resource_id: 2,
    action: 'update:owner',
    url: '/api/v1/jobs/:id',
  },
  {
    role_id: 8,
    resource_id: 2,
    action: 'delete:owner',
    url: '/api/v1/jobs/:id',
  },
  {
    role_id: 8,
    resource_id: 2,
    action: 'read:owner',
    url: '/api/v1/jobs/owner',
  },
  {
    role_id: 8,
    resource_id: 2,
    action: 'read:owner',
    url: '/api/v1/jobs/history/call',
  },
  {
    role_id: 8,
    resource_id: 2,
    action: 'create:owner',
    url: '/api/v1/jobs/history/call',
  },
  {
    role_id: 8,
    resource_id: 2,
    action: 'read:owner',
    url: '/api/v1/jobs/favorite',
  },
  {
    role_id: 8,
    resource_id: 2,
    action: 'create:owner',
    url: '/api/v1/jobs/favorite',
  },
  {
    role_id: 8,
    resource_id: 2,
    action: 'create:owner',
    url: '/api/v1/jobs/rating',
  },
  {
    role_id: 8,
    resource_id: 2,
    action: 'create:owner',
    url: '/api/v1/jobs/rating',
  },
  {
    role_id: 8,
    resource_id: 2,
    action: 'create:owner',
    url: '/api/v1/jobs/users',
  },
  {
    role_id: 8,
    resource_id: 3,
    action: 'create:owner',
    url: '/api/v1/trucks',
  },
  {
    role_id: 8,
    resource_id: 3,
    action: 'read:any',
    url: '/api/v1/trucks',
  },
  {
    role_id: 8,
    resource_id: 3,
    action: 'read:owner',
    url: '/api/v1/trucks/:id',
  },
  {
    role_id: 8,
    resource_id: 3,
    action: 'read:owner',
    url: '/api/v1/trucks/owner',
  },
  {
    role_id: 8,
    resource_id: 3,
    action: 'update:owner',
    url: '/api/v1/trucks/:id',
  },
  {
    role_id: 8,
    resource_id: 3,
    action: 'read:owner',
    url: '/api/v1/trucks/quotation/:id',
  },
  {
    role_id: 8,
    resource_id: 3,
    action: 'read:owner',
    url: '/api/v1/trucks/history/call',
  },
  {
    role_id: 8,
    resource_id: 3,
    action: 'create:owner',
    url: '/api/v1/trucks/history/call',
  },
  {
    role_id: 8,
    resource_id: 3,
    action: 'read:owner',
    url: '/api/v1/trucks/users',
  },
  {
    role_id: 8,
    resource_id: 3,
    action: 'read:owner',
    url: '/api/v1/trucks/favorite',
  },
  {
    role_id: 8,
    resource_id: 3,
    action: 'create:owner',
    url: '/api/v1/trucks/favorite',
  },
  {
    role_id: 8,
    resource_id: 5,
    action: 'create:owner',
    url: '/api/v1/media/uploads/images',
  },
];

const newDate = new Date();

const dateNow = newDate.toISOString().replace('T', ' ').slice(0, -5);

const resources = resourceData.map((attr) => ({
  ...attr,
  version: 0,
  created_at: dateNow,
  updated_at: dateNow,
  is_deleted: false,
}));

const resourceAction = resourceActionData.map((attr, index) => ({
  id: index + 1,
  ...attr,
}));

module.exports = {
  resources,
  resourceAction,
};

/*
v2 Method	v2 Endpoint
GET	/api/v1/master-data/province
GET	/api/v1/master-data/zone
GET	/api/v1/master-data/product-type
GET	/api/v1/master-data/truck-type
GET	/api/v1/master-data/truck-type/group

POST /api/v1/auth/otp-request
POST /api/v1/auth/otp-verify
GET	/api/v1/users/:id/term-of-service
POST /api/v1/auth/login


GET	/api/v1/users/profiles
GET	/api/v1/users/profiles/truck-summary
POST /api/v1/users/profiles
GET	/api/v1/users/profiles/:id
	
GET	/api/v1/jobs
GET	/api/v1/jobs/:id
POST /api/v1/jobs
PUT	/api/v1/jobs/:id
DELETE /api/v1/jobs/:id
GET	/api/v1/jobs/owner
GET	/api/v1/jobs/history/call
POST /api/v1/jobs/history/call
GET	/api/v1/jobs/favorite
POST /api/v1/jobs/favorite
POST /api/v1/jobs/rating
POST /api/v1/jobs/users

POST /api/v1/trucks
GET	/api/v1/trucks
GET	/api/v1/trucks/:id
GET	/api/v1/trucks/owner
PUT	/api/v1/trucks/:id
GET	/api/v1/trucks/quotation/:id
GET	/api/v1/trucks/history/call
POST /api/v1/trucks/history/call
GET	/api/v1/trucks/users
GET	/api/v1/trucks/favorite
POST /api/v1/trucks/favorite

POST /api/v1/media/uploads/images

*/
