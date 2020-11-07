const { TestGroup, RouteTest } = require("./report-builder");

module.exports = async function (credentials) {
  const testGroup = new TestGroup("Route /get-account-deletion-status");

  let apiCall = testGroup.newApiCall("POST", "/get-account-deletion-status", "when body is null", null);
  await apiCall.checkStatus([400, 401]);

  apiCall = testGroup.newApiCall("POST", "/get-account-deletion-status", "when body is empty", {});
  await apiCall.checkStatus([400, 401]);

  apiCall = testGroup.newApiCall("POST", "/get-account-deletion-status", "when userId is missing", {
    password: "password",
  });
  await apiCall.checkStatus([400, 401]);

  apiCall = testGroup.newApiCall("POST", "/get-account-deletion-status", "when password is missing", {
    userId: credentials.userId,
  });
  await apiCall.checkStatus([400, 401]);

  apiCall = testGroup.newApiCall("POST", "/get-account-deletion-status", "when password is wrong", {
    userId: credentials.userId,
    password: "BadPassword",
  });
  await apiCall.checkStatus([401]);

  apiCall = testGroup.newApiCall("POST", "/get-account-deletion-status", "when account no longer exists", {
    userId: "c309faba-e7d5-4ea3-bf4f-f888b069197e",
    password: "anyPassword",
  });
  await apiCall.checkStatus([200]);
  let body = await apiCall.getJSON();
  if (body) {
    apiCall.addBodyCheck(
      "returns 'deletionStatus: DONE' when account does not exist - received " + body.deletionStatus,
      body.deletionStatus === "DONE"
    );
  }

  apiCall = testGroup.newApiCall("POST", "/get-account-deletion-status", "with correct credentials", credentials);
  await apiCall.checkStatus([200]);
  body = await apiCall.getJSON();
  if (body) {
    apiCall.addBodyCheck(
      "returns 'deletionStatus: CANCELED' or 'deletionStatus: PENDING' - received " + body.deletionStatus,
      body.deletionStatus === "CANCELED" || body.deletionStatus === "PENDING"
    );
  }
  return testGroup;
};
