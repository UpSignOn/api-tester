const {
  post,
  displayBold,
  displayError,
  displayErrorTitle,
  displaySuccessTitle,
  fieldTypes,
  check,
  attempt,
} = require("./helpers");

module.exports = async function (credentials) {
  displayBold("Testing /update-password");
  let response = await post("/update-password", null);
  check("returns a 400 or 401 with null body", response.status === 400 || response.status === 401);

  response = await post("/update-password", { body: JSON.stringify({}) });
  check("returns a 400 or 401 with empty body", response.status === 400 || response.status === 401);

  response = await post("/update-password", { body: JSON.stringify({ password: "password" }) });
  check("returns a 400 or 401 with missing userId", response.status === 400 || response.status === 401);

  response = await post("/update-password", { body: JSON.stringify(credentials) });
  check("returns a 400 or 401 with missing newPassword", response.status === 400 || response.status === 401);

  response = await post("/update-password", {
    body: JSON.stringify({ userId: credentials.userId, password: "BadPassword", newPassword: "NewPassword" }),
  });
  check("returns a 401 with bad password", response.status === 401);

  response = await post("/update-password", {
    body: JSON.stringify({ ...credentials, newPassword: "NewPassword" }),
  });
  check("returns a 200 or 403 with good credentials", response.status === 403 || response.status === 200);
  if (response.status === 403) {
    const body = await attempt("returns a JSON body if request status is 403", response.json());
    if (body) {
      check("returns a 'message' if status is 403", !!body.message);
    }
  }
  if (response.status === 200) {
    response = await post("/update-password", {
      body: JSON.stringify({ ...credentials, newPassword: "NewPassword" }),
    });
    check("returns a 401 when using old credentials", response.status === 401);
    return { userId: credentials.userId, password: "NewPassword" };
  }
  return credentials;
};
