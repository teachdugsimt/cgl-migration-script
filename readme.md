# Initial CargoLink Service

## How to using

1. run script below
  
  ```
  $ npm install
  ```

2. สร้างไฟล์ .env โดยใส่ข้อมูลอิงตามนี้
  
  ```
  DB_HOST = HOST
  DB_USERNAME = USERNAME
  DB_PASSWORD = PASSWORD
  DB_PORT = 5432
  DB_LEGACY = ชื่อ db หลักที่ต้องการ clone ข้อมูล
  USER_POOL_ID = COGNITO_POOL_ID
  APP_CLIENT = COGNITO_APP_CLIENT
  KMS_MASTER_KEY = KMS_KEY
  AWS_REGION = ap-southeast-1
  ```

3. export profile AWS ให้เป็น profile ที่ต้องการ

  ```
  $ export AWS_PROFILE=SOMETHING
  ```

4. รันคำสั่ง ```$ node fileName``` (ให้เปลี่ยน fileName เป็นชื่อไฟล์ตามด้านล่างและต้องรันตามลำดับจากบนลงล่าง และเมื่อไหร่ที่รันเสร็จจะมี log ขึ้นว่า finished เมื่อขึ้น log แบบนี้ให้กด ```command + c```(mac) หรือ ```ctrl + c```(window))

    - move-dtb_user-to-user_profile.js
    - clear-dummy-user.js
    - backup-user-id.js
    - clear-duplicate-user.js
    - initial-user.js
    - initial-resource-action.js
    - initial-sub-district **------** [ run ครั้งเดียวตอน env dev ที่เหลือ(stg, prod) ใช้ clone จากไฟล์ clone-master-data.js ]
    - update-district-name **------** [ run ครั้งเดียวตอน env dev ที่เหลือ(stg, prod) ใช้ clone จากไฟล์ clone-master-data.js ]
    - clone-master-data.js **------** [ ในกรณีที่ env เป็น dev ไม่ต้องรัน file นี้ ]
    - create-new-user-by-command.js
    - add-column-status-to-user.js
    - add-column-user-doc.js
    - move-dtb-job.js
    - add-full-text-search-and-view-list-job.js
    - // run booking service ของ Art
    - initial-truck.js
    - initial-booking.js
    - replace-view-job.js
    - move-dtb-favorite-job.js
    - move-dtb-history.js
    - update-job-status.js
    - update-shipment-status.js
    - update-user-id-into-job.js
    - update-user-id-into-shipment.js
    - update-user-id-into-favorite-job.js
    - update-user-id-into-job-history-call.js
    - update-user-id-into-truck-history-call.js
    - alter-column-public-as-cgl-into-job.js
    - replace-view-job-with-public-as-clg.js
    - add-term-of-service.js
    - create-view-user-job-summary.js
    - alter-user-type-and-term-of-service.js
    - alter-unique-phone-number.js

5. ถ้าต้องการสร้าง admin คนใหม่ให้รัน (ต้อง**ไม่มี** user อยู่ใน table user_profile)
  
  ```
  $ node create-new-user-by-command.js
  ```

6. ถ้าต้องการเปลี่ยน member ไปเป็น admin ให้รัน (ต้อง**มี** user อยู่ใน table user_profile)

  ```
  $ node change-member-to-admin.js
  ```

*Note: จำเป็นต้องมี email เพราะจะเปลี่ยน username จาก phoneNumber เป็น email\*
