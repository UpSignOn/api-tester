const { head, post, displayBold, check, checkSecurity, attempt } = require("./helpers");

const testConnectErrorCases = async () => {
  displayBold("Testing /connect error cases");
  let response = await post("/connect", null);
  check(
    "returns a 400 or 401 with a null body - received " + response.status,
    response.status === 401 || response.status === 400
  );

  response = await post("/connect", { body: JSON.stringify({}) });
  check(
    "returns a 400 or 401 with an empty body - received " + response.status,
    response.status === 401 || response.status === 400
  );

  response = await post("/connect", { body: JSON.stringify({ password: "password" }) });
  check(
    "returns a 400 or 401 when userId is missing - received " + response.status,
    response.status === 401 || response.status === 400
  );

  response = await post("/connect", { body: JSON.stringify({ userId: "badId" }) });
  checkSecurity(
    "returns a 400 or 401 when password is missing - received " + response.status,
    response.status === 401 || response.status === 400
  );

  response = await post("/connect", { body: JSON.stringify({ userId: "badId", password: "badPassword" }) });
  checkSecurity("returns a 401 whith bad credentials - received " + response.status, response.status === 401);
};

const testConnect = async (credentials) => {
  displayBold("Testing /connect for user " + credentials.userId);
  let response = await post("/connect", {
    body: JSON.stringify({ userId: credentials.userId, password: "badPassword" }),
  });
  checkSecurity(
    "should return a 401 for a bad password but a correct userId - received " + response.status,
    response.status === 401
  );
  const buttonId = "buttonIdThatTestsOpenRedirectBreaches";
  response = await post("/connect", {
    body: JSON.stringify({ userId: credentials.userId, password: credentials.password, buttonId: buttonId }),
  });
  check("should connect user and return a 200 - received " + response.status, response.status === 200);
  const body = await attempt("should return a JSON body", response.json());
  if (body) {
    check("response should contain a 'connectionToken' - received " + body.connectionToken, !!body.connectionToken);
    checkSecurity(
      "'connectionToken' should be a UUID",
      /^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/.test(body.connectionToken)
    );
    check("response should contain a 'redirectionUri' - received " + body.redirectionUri, !!body.redirectionUri);
    check("redirectionUri should not contain anchors", body.redirectionUri.indexOf("#") === -1);
    checkSecurity(
      "redirectionUri should not contain an unchecked buttonId (Open Redirect breach)",
      body.redirectionUri.indexOf(buttonId) === -1
    );
    let uriResponse = await head(body.redirectionUri);
    check(
      "'redirectionUri' should not return a 200 on GET without token - received " + uriResponse.status,
      uriResponse.status !== 200
    );
    uriResponse = await head(body.redirectionUri + "?userId=" + credentials.userId + "&connectionToken=falseToken");
    checkSecurity(
      "'redirectionUri' should not return a 200 on GET with a bad token - received " + uriResponse.status,
      uriResponse.status !== 200
    );
    uriResponse = await head(
      body.redirectionUri + "?userId=" + credentials.userId + "&connectionToken=" + body.connectionToken
    );
    check(
      "'redirectionUri' should return a 200 on GET with a good token - received " + uriResponse.status,
      uriResponse.status === 200
    );
    uriResponse = await head(
      body.redirectionUri + "?userId=" + credentials.userId + "&connectionToken=" + body.connectionToken
    );
    checkSecurity(
      "'redirectionUri' should not return a 200 on GET with a reused token - received " + uriResponse.status,
      uriResponse.status !== 200
    );
  }
};

module.exports = {
  testConnectErrorCases,
  testConnect,
};
