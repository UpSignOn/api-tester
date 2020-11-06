const { post, displayBold, check, checkSecurity, attempt } = require("./helpers");

module.exports = async function (credentials) {
  displayBold("Testing /update-password");
  let response = await post("/update-password", null);
  check(
    "returns a 400 or 401 with null body - received " + response.status,
    response.status === 400 || response.status === 401
  );

  response = await post("/update-password", { body: JSON.stringify({}) });
  check(
    "returns a 400 or 401 with empty body - received " + response.status,
    response.status === 400 || response.status === 401
  );

  response = await post("/update-password", { body: JSON.stringify({ password: "password" }) });
  check(
    "returns a 400 or 401 with missing userId - received " + response.status,
    response.status === 400 || response.status === 401
  );

  response = await post("/update-password", { body: JSON.stringify(credentials) });
  checkSecurity(
    "returns a 400 or 401 with missing newPassword - received " + response.status,
    response.status === 400 || response.status === 401
  );

  response = await post("/update-password", {
    body: JSON.stringify({ userId: credentials.userId, password: "BadPassword", newPassword: "NewPassword" }),
  });
  checkSecurity("returns a 401 with bad password - received " + response.status, response.status === 401);

  response = await post("/update-password", {
    body: JSON.stringify({ ...credentials, newPassword: "NewPassword" }),
  });
  check(
    "returns a 200 or 403 with good credentials - received " + response.status,
    response.status === 403 || response.status === 200
  );
  if (response.status === 403) {
    const body = await attempt("returns a JSON body if request status is 403", response.json());
    if (body) {
      check("returns a 'message' if status is 403 - received " + body.message, !!body.message);
    }
  }
  if (response.status === 200) {
    response = await post("/update-password", {
      body: JSON.stringify({ ...credentials, newPassword: "NewPassword" }),
    });
    checkSecurity("returns a 401 when using old credentials - received " + response.status, response.status === 401);
    return { userId: credentials.userId, password: "NewPassword" };
  }
  return credentials;
};
