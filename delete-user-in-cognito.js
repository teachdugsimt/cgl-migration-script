require('dotenv').config();
const AWS = require('aws-sdk');

const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();

const UserPoolId = 'ap-southeast-1_tfXXNZA76';

const getUsers = async () => {
  const params = {
    UserPoolId: UserPoolId,
    // AttributesToGet: ['Username'],
  };
  const { Users } = await cognitoidentityserviceprovider.listUsers(params).promise();
  return Users;
};

const deleteUser = async (username) => {
  const params = {
    UserPoolId: UserPoolId,
    Username: username,
  };
  return cognitoidentityserviceprovider.adminDeleteUser(params).promise();
};

const run = async () => {
  const users = await getUsers();
  await Promise.all(
    users.map(async (user) => {
      return await deleteUser(user.Username);
    })
  );
  return true;
};

run();
