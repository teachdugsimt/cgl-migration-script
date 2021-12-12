require('dotenv').config();
const AWS = require('aws-sdk');

const documentClient = new AWS.DynamoDB.DocumentClient();

const findById = async (id) => {
  const params = {
    TableName: 'cgl_user_reset_pass',
    Key: {
      id: id,
    },
  };

  const { Item } = await documentClient.get(params).promise();
  console.log('Item :>> ', Item);
  return Item;
};

// findById(652);

const countAll = async () => {
  const params = {
    TableName: 'cgl_user',
    Select: 'COUNT',
  };

  const { Item } = await documentClient.scan(params).promise();
  console.log('Item :>> ', Item);
  return Item;
};

countAll(652);
// aws dynamodb scan --table-name cgl_user --select COUNT
