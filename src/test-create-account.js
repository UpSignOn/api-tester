const { TestGroup } = require('./report-builder');

module.exports = async function () {
  const testGroup = new TestGroup('Route /create-account');

  let apiCall = testGroup.newApiCall('POST', '/create-account', 'when body is null', null);
  await apiCall.checkStatus([400]);

  apiCall = testGroup.newApiCall('POST', '/create-account', 'when body is empty', {});
  await apiCall.checkStatus([400]);

  apiCall = testGroup.newApiCall('POST', '/create-account', 'when password is provided', {
    password: 'password',
  });
  let status = await apiCall.checkStatus([200, 403]);
  let body = await apiCall.getJSON();
  if (body) {
    if (status === 200)
      apiCall.addBodyCheck(
        "returns a 'userId' when status is 200 - received " + body.userId,
        !!body.userId,
      );
    if (status === 403)
      apiCall.addBodyCheck(
        "returns a 'message' if status is 403 - received " + body.message,
        !!body.message,
      );
  }

  apiCall = testGroup.newApiCall('POST', '/create-account', 'when password is provided with data', {
    password: 'password',
    data: [{ type: 'email', key: 'email1', value: { address: 'test@test.com' } }],
  });
  status = await apiCall.checkStatus([200, 403]);
  body = await apiCall.getJSON();
  if (body) {
    if (status === 200)
      apiCall.addBodyCheck(
        "returns a 'userId' when status is 200 - received " + body.userId,
        !!body.userId,
      );
    if (status === 403)
      apiCall.addBodyCheck(
        "returns a 'message' if status is 403 - received " + body.message,
        !!body.message,
      );
  }

  // TODO check that the partner stores the data with a route that gets all the data
  return { testGroup, userId: body ? body.userId : '', password: 'password' };
};
