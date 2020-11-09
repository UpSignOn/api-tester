const { TestGroup } = require('./report-builder');

module.exports = async function (credentials) {
  const testGroup = new TestGroup('Route /delete-account-and-data');

  let apiCall = testGroup.newApiCall('POST', '/delete-account-and-data', 'when body is null', null);
  await apiCall.checkStatus([400]);

  apiCall = testGroup.newApiCall('POST', '/delete-account-and-data', 'when body is empty', {});
  await apiCall.checkStatus([400, 401]);

  apiCall = testGroup.newApiCall('POST', '/delete-account-and-data', 'when userId is missing', {
    password: 'password',
  });
  await apiCall.checkStatus([400, 401]);

  apiCall = testGroup.newApiCall('POST', '/delete-account-and-data', 'when password is missing', {
    userId: credentials.userId,
  });
  await apiCall.security().checkStatus([400, 401]);

  apiCall = testGroup.newApiCall('POST', '/delete-account-and-data', 'when password is wrong', {
    userId: credentials.userId,
    password: 'badPasswordldjkfh',
  });
  await apiCall.security().checkStatus([401]);

  apiCall = testGroup.newApiCall('POST', '/delete-account-and-data', 'when userId is unknown', {
    userId: 'c309faba-e7d5-4ea3-bf4f-f888b069197e',
    password: 'anyPassword',
  });
  await apiCall.checkStatus([200]);
  let body = await apiCall.getJSON();
  if (body) {
    apiCall.addBodyCheck(
      "returns 'deletionStatus: DONE' with an unknown userId - received " + body.deletionStatus,
      body.deletionStatus === 'DONE',
    );
  }

  apiCall = testGroup.newApiCall(
    'POST',
    '/delete-account-and-data',
    'for correct credentials',
    credentials,
  );
  await apiCall.checkStatus([200]);
  body = await apiCall.getJSON();
  if (body) {
    apiCall.addBodyCheck(
      "returns a 'deletionStatus' that is either 'DONE' or 'DENIED' or 'PENDING' with correct credentials - received " +
        body.deletionStatus,
      body.deletionStatus === 'DONE' ||
        body.deletionStatus === 'DENIED' ||
        body.deletionStatus === 'PENDING',
    );
  }

  return {
    testGroup,
    deletionStatus: body.deletionStatus,
  };
};
