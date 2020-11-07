const { TestGroup, RouteTest } = require("./report-builder");

module.exports = async function (credentials) {
  const testGroup = new TestGroup("Route /update-data");

  let apiCall = testGroup.newApiCall("POST", "/update-data", "with null body", null);
  await apiCall.checkStatus([400, 401]);

  apiCall = testGroup.newApiCall("POST", "/update-data", "with empty body", {});
  await apiCall.checkStatus([400, 401]);

  apiCall = testGroup.newApiCall("POST", "/update-data", "with missing userId", { password: "password" });
  await apiCall.checkStatus([400, 401]);

  apiCall = testGroup.newApiCall("POST", "/update-data", "with missing password", { userId: credentials.userId });
  await apiCall.security().checkStatus([400, 401]);

  apiCall = testGroup.newApiCall("POST", "/update-data", "with missing data", credentials);
  await apiCall.security().checkStatus([400, 401]);

  apiCall = testGroup.newApiCall("POST", "/update-data", "with missing credentials", { data: [] });
  await apiCall.checkStatus([400, 401]);

  apiCall = testGroup.newApiCall("POST", "/update-data", "with bad credentials", {
    userId: "badId",
    password: "badPassword",
    data: [],
  });
  await apiCall.security().checkStatus([401]);

  apiCall = testGroup.newApiCall("POST", "/update-data", "with bad password", {
    userId: credentials.userId,
    password: "badPassword",
    data: [],
  });
  await apiCall.security().checkStatus([401]);

  apiCall = testGroup.newApiCall("POST", "/update-data", "with correct credentials", {
    ...credentials,
    data: [],
  });
  const status = await apiCall.security().checkStatus([200, 403]);

  if (status === 403) {
    const body = await apiCall.getJSON();
    if (body) {
      apiCall.addBodyCheck("returns a 'message' if status is 403 - received " + body.message, !!body.message);
    }
  }

  // TODO check that the partner stores the data with a route that gets all the data
  return testGroup;
};
