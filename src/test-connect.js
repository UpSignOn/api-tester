const {
  head,
  get,
  post,
  displayBold,
  displayError,
  displayErrorTitle,
  displaySuccessTitle,
  fieldTypes,
  check,
  attempt,
} = require("./helpers");

const testConnectErrorCases = async () => {
  displayBold("Testing /connect error cases");
  let response = await post("/connect", null);
  check("returns a 401", response.status === 401);

  response = await post("/connect", { body: JSON.stringify({}) });
  check("returns a 401", response.status === 401);

  response = await post("/connect", { body: JSON.stringify({ password: "password" }) });
  check("returns a 401", response.status === 401);

  response = await post("/connect", { body: JSON.stringify({ userId: "badId" }) });
  check("returns a 401", response.status === 401);

  response = await post("/connect", { body: JSON.stringify({ userId: "badId", password: "badPassword" }) });
  check("returns a 401", response.status === 401);
};

const testConnect = async (credentials) => {
  displayBold("Testing /connect for user " + credentials.userId);
  response = await post("/connect", { body: JSON.stringify(credentials) });
  check("should connect user and return a 200", response.status === 200);
  const body = await attempt("shoudl return a JSON body", response.json());
  check("response should contain a 'connectionToken'", !!body.connectionToken);
  check(
    "'connectionToken' should be a UUID",
    /^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/.test(body.connectionToken)
  );
  check("response should contain a 'redirectionUri'", !!body.redirectionUri);
  const uriResponse = await head(body.redirectionUri);
  check("'redirectionUri' should return 200 on GET", uriResponse.status === 200);
};

module.exports = {
  testConnectErrorCases,
  testConnect,
};
