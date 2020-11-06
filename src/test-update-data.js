const { post, displayBold, check, checkSecurity, attempt } = require("./helpers");

module.exports = async function (credentials) {
  displayBold("Testing /update-data");
  let response = await post("/update-data", null);
  check(
    "returns a 400 or 401 with null body - received " + response.status,
    response.status === 400 || response.status === 401
  );

  response = await post("/update-data", { body: JSON.stringify({}) });
  check(
    "returns a 400 or 401  with empty body - received " + response.status,
    response.status === 400 || response.status === 401
  );

  response = await post("/update-data", { body: JSON.stringify({ password: "password" }) });
  check(
    "returns a 400 or 401  with missing userId - received " + response.status,
    response.status === 400 || response.status === 401
  );

  response = await post("/update-data", { body: JSON.stringify({ userId: credentials.userId }) });
  checkSecurity(
    "returns a 400 or 401  with missing password - received " + response.status,
    response.status === 400 || response.status === 401
  );

  response = await post("/update-data", { body: JSON.stringify(credentials) });
  check(
    "returns a 400 or 401  with missing data - received " + response.status,
    response.status === 400 || response.status === 401
  );

  response = await post("/update-data", { body: JSON.stringify({ data: [] }) });
  check(
    "returns a 400 or 401  with missing credentials - received " + response.status,
    response.status === 400 || response.status === 401
  );

  response = await post("/update-data", {
    body: JSON.stringify({ userId: "badId", password: "badPassword", data: [] }),
  });
  checkSecurity("returns a 401 with bad credentials - received " + response.status, response.status === 401);

  response = await post("/update-data", {
    body: JSON.stringify({ userId: credentials.userId, password: "badPassword", data: [] }),
  });
  checkSecurity("returns a 401 with bad password - received " + response.status, response.status === 401);

  response = await post("/update-data", {
    body: JSON.stringify({ ...credentials, data: [] }),
  });
  check("returns a 200 or a 403 - received " + response.status, response.status === 403 || response.status === 200);
  if (response.status === 403) {
    const body = await attempt("returns a JSON body if request status is 403", response.json());
    if (body) {
      check("returns a 'message' if status is 403 - received " + body.message, !!body.message);
    }
  }

  // TODO check that the partner stores the data with a route that gets all the data
};
