const cartAvaliable = [
  {
    promotion_id: '6ab65dc892f3498b8073d0ed20cfc11b',
    promotion_type: 'discount_tier',
    promotion_name: 'รายการ ส่วนลดพรีคีดท์ 10 Rev.1',
    promotion_image: null,
    item_id: 'b4e5f78e6bfa494a92e273b5ac6ecfb2',
    item_name: 'พรีดิคท์ 10%',
  },
  {
    promotion_id: '0d40f804ef6e412497ba60340bbaf5bf',
    promotion_type: 'premium_tier_compound',
    promotion_name: 'รายการ แถมทูโฟฟอส Rev.1',
    promotion_image: null,
    item_id: '4b96a784f827482a8b4a06358b6ef743',
    item_name: 'ทูโฟฟอส',
  },
];

const cartApply = [
  {
    promotion_id: '0d40f804ef6e412497ba60340bbaf5bf',
    promotion_type: 'premium_tier_compound',
    promotion_name: 'รายการ แถมทูโฟฟอส Rev.1',
    promotion_image: null,
    item_id: '4b96a784f827482a8b4a06358b6ef743',
    item_name: 'ทูโฟฟอส',
  },
];

const applyFilter = cartApply.length ? cartApply.map((ap) => ap.promotion_id) : [];

const newAvaliable = cartAvaliable.map((av) => ({
  ...av,
  checked: applyFilter.includes(av.promotion_id),
}));

console.log('newAvaliable :>> ', newAvaliable);
