const { TestGroup, RouteTest } = require("./report-builder");

module.exports = async function (credentials) {
  const testGroup = new TestGroup("Route /update-password");

  let apiCall = testGroup.newApiCall("POST", "/update-password", "with null body", null);
  await apiCall.checkStatus([400, 401]);

  apiCall = testGroup.newApiCall("POST", "/update-password", "with empty body", {});
  await apiCall.checkStatus([400, 401]);

  apiCall = testGroup.newApiCall("POST", "/update-password", "with missing userId", { password: "password" });
  await apiCall.checkStatus([400, 401]);

  apiCall = testGroup.newApiCall("POST", "/update-password", "with missing newPassword", credentials);
  await apiCall.security().checkStatus([400, 401]);

  apiCall = testGroup.newApiCall("POST", "/update-password", "with bad password", {
    userId: credentials.userId,
    password: "BadPassword",
    newPassword: "NewPassword",
  });
  await apiCall.security().checkStatus([401]);

  apiCall = testGroup.newApiCall("POST", "/update-password", "with correct credentials", {
    ...credentials,
    newPassword: "NewPassword",
  });
  const status = await apiCall.checkStatus([200, 403]);
  if (status === 403) {
    const body = await apiCall.getJSON();
    if (body) {
      apiCall.addBodyCheck("returns a 'message' if status is 403 - received " + body.message, !!body.message);
    }
  }
  if (status === 200) {
    apiCall = testGroup.newApiCall("POST", "/update-password", "when using old credentials", {
      ...credentials,
      newPassword: "NewPassword",
    });
    await apiCall.security().checkStatus([401]);

    return { testGroup, userId: credentials.userId, password: "NewPassword" };
  }
  return { testGroup, userId: credentials.userId, password: credentials.password };
};
