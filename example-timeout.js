const bulkInsert = async (attr) => {
  return new Promise((res, rej) =>
    setTimeout(() => {
      res(console.log(attr));
    }, 1000)
  );
};

const funcTimeout = async (data) => {
  return new Promise(async (res, rej) =>
    data.map(async (attr, index) => {
      setTimeout(async () => {
        return res(bulkInsert(attr));
      }, 2500 * index);
    })
  );
};

const run = async (data) => {
  await Promise.all(
    data.map(async (attr, index) => {
      setTimeout(async () => {
        return bulkInsert(attr);
      }, 2500 * index);
    })
  );
};

const data = [1, 2, 3];
run(data);
