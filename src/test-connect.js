const { head } = require("./helpers");
const { TestGroup, RouteTest } = require("./report-builder");

const testConnectErrorCases = async () => {
  const testGroup = new TestGroup("Route /connect - error cases");

  let apiCall = testGroup.newApiCall("POST", "/connect", "when body is null", null);
  await apiCall.checkStatus([400, 401]);

  apiCall = testGroup.newApiCall("POST", "/connect", "when body is empty", {});
  await apiCall.checkStatus([400, 401]);

  apiCall = testGroup.newApiCall("POST", "/connect", "when userId is missing", { password: "password" });
  await apiCall.checkStatus([400, 401]);

  apiCall = testGroup.newApiCall("POST", "/connect", "when password is missing", { userId: "badId" });
  await apiCall.security().checkStatus([400, 401]);

  apiCall = testGroup.newApiCall("POST", "/connect", "when account does not exist", {
    userId: "badId",
    password: "badPassword",
  });
  await apiCall.security().checkStatus([401]);

  return { testGroup };
};

const testConnect = async (credentials) => {
  const testGroup = new TestGroup("Route /connect - for user " + credentials.userId);

  let apiCall = testGroup.newApiCall("POST", "/connect", "when password does not match a correct userId", {
    userId: credentials.userId,
    password: "badPassword",
  });
  await apiCall.security().checkStatus([401]);

  const buttonId = "buttonIdThatTestsOpenRedirectBreaches";
  apiCall = testGroup.newApiCall("POST", "/connect", "with valid credentials", {
    userId: credentials.userId,
    password: credentials.password,
    buttonId: buttonId,
  });
  await apiCall.security().checkStatus([200]);
  const body = await apiCall.getJSON();
  if (body) {
    apiCall.addBodyCheck(
      "response should contain a 'connectionToken' - received " + body.connectionToken,
      !!body.connectionToken
    );
    apiCall
      .security()
      .addBodyCheck(
        "'connectionToken' should be a UUID",
        /^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/.test(body.connectionToken)
      );
    apiCall.addBodyCheck(
      "response should contain a 'redirectionUri' - received " + body.redirectionUri,
      !!body.redirectionUri
    );
    apiCall.addBodyCheck(
      "redirectionUri should not contain anchors",
      !!body.redirectionUri && body.redirectionUri.indexOf("#") === -1
    );
    apiCall
      .security()
      .addBodyCheck(
        "redirectionUri should not contain an unchecked buttonId (Open Redirect breach)",
        !!body.redirectionUri && body.redirectionUri.indexOf(buttonId) === -1
      );
    if (body.redirectionUri) {
      try {
        let uriResponse = await head(body.redirectionUri);
        apiCall.addBodyCheck("should return valid redirectionUri", true);
        apiCall.addBodyCheck(
          "'redirectionUri' should not return a 200 on GET without token - received " + uriResponse.status,
          uriResponse.status !== 200
        );
        const redirectionWithBadToken = `${body.redirectionUri}${
          !!body.redirectionUri && body.redirectionUri.indexOf("?") !== -1 ? "&" : "?"
        }userId=${credentials.userId}&connectionToken=badToken`;
        const redirectionWithGoodToken = `${body.redirectionUri}${
          !!body.redirectionUri && body.redirectionUri.indexOf("?") !== -1 ? "&" : "?"
        }userId=${credentials.userId}&connectionToken=${body.connectionToken}`;
        uriResponse = await head(redirectionWithBadToken);
        apiCall
          .security()
          .addBodyCheck(
            "'redirectionUri' should not return a 200 on GET with a bad token - received " + uriResponse.status,
            uriResponse.status !== 200
          );
        uriResponse = await head(redirectionWithGoodToken);
        apiCall.addBodyCheck(
          "'redirectionUri' should return a 200 on GET with a good token - received " + uriResponse.status,
          uriResponse.status === 200
        );
        uriResponse = await head(redirectionWithGoodToken);
        apiCall
          .security()
          .addBodyCheck(
            "'redirectionUri' should not return a 200 on GET with a reused token - received " + uriResponse.status,
            uriResponse.status !== 200
          );
      } catch {
        apiCall.addBodyCheck("should return valid redirectionUri", false);
      }
    }
  }
  return { testGroup };
};

module.exports = {
  testConnectErrorCases,
  testConnect,
};
