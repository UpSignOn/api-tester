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
  displayBold("Testing /get-account-deletion-status");
  let response = await post("/get-account-deletion-status", null);
  check("returns a 400 or 401 with null body", response.status === 400 || response.status === 401);

  response = await post("/get-account-deletion-status", { body: JSON.stringify({}) });
  check("returns a 400 or 401 with empty body", response.status === 400 || response.status === 401);

  response = await post("/get-account-deletion-status", { body: JSON.stringify({ password: "password" }) });
  check("returns a 400 or 401 with missing userId", response.status === 400 || response.status === 401);

  response = await post("/get-account-deletion-status", { body: JSON.stringify({ userId: credentials.userId }) });
  check("returns a 400 or 401 with missing password", response.status === 400 || response.status === 401);

  response = await post("/get-account-deletion-status", {
    body: JSON.stringify({ userId: credentials.userId, password: "BadPassword" }),
  });
  check("returns a 401 with bad password", response.status === 401);

  response = await post("/get-account-deletion-status", {
    body: JSON.stringify({ userId: "c309faba-e7d5-4ea3-bf4f-f888b069197e", password: "anyPassword" }),
  });
  check("returns a 200 when account does not exist", response.status === 200);
  let body = await attempt("returns a JSON body when account does not exist", response.json());
  if (body) {
    check("returns 'deletionStatus: DONE' when account does not exist", body.deletionStatus === "DONE");
  }

  response = await post("/get-account-deletion-status", {
    body: JSON.stringify(credentials),
  });
  check("returns a 200 whith correct credentials", response.status === 200);
  body = await attempt("returns a JSON body whith correct credentials", response.json());
  if (body) {
    check(
      "returns 'deletionStatus: CANCELED' or 'deletionStatus: PENDING' whith correct credentials",
      body.deletionStatus === "CANCELED" || body.deletionStatus === "PENDING"
    );
  }
};
