const { post, displayBold, check, checkSecurity, attempt } = require("./helpers");

module.exports = async function (credentials) {
  displayBold("Testing /delete-account-and-data");
  let response = await post("/delete-account-and-data", null);
  check(
    "returns a 400 or 401 with null body - received " + response.status,
    response.status === 400 || response.status === 401
  );

  response = await post("/delete-account-and-data", { body: JSON.stringify({}) });
  check(
    "returns a 400 or 401 with empty body - received " + response.status,
    response.status === 400 || response.status === 401
  );

  response = await post("/delete-account-and-data", { body: JSON.stringify({ password: "password" }) });
  check(
    "returns a 400 or 401 with missing userId - received " + response.status,
    response.status === 400 || response.status === 401
  );

  response = await post("/delete-account-and-data", { body: JSON.stringify({ userId: credentials.userId }) });
  checkSecurity(
    "returns a 400 or 401 with missing password - received " + response.status,
    response.status === 400 || response.status === 401
  );

  response = await post("/delete-account-and-data", {
    body: JSON.stringify({ userId: credentials.userId, password: "badPasswordldjkfh" }),
  });
  checkSecurity("returns a 401 with bad password - received " + response.status, response.status === 401);

  response = await post("/delete-account-and-data", {
    body: JSON.stringify({ userId: "c309faba-e7d5-4ea3-bf4f-f888b069197e", password: "anyPassword" }),
  });
  check("returns a 200 for unkown userId - received " + response.status, response.status === 200);
  let body = await attempt("returns a JSON body for unknown userId", response.json());
  if (body) {
    check(
      "returns 'deletionStatus: DONE' with an unknown userId - received " + response.status,
      body.deletionStatus === "DONE"
    );
  }
  response = await post("/delete-account-and-data", {
    body: JSON.stringify(credentials),
  });
  check("returns a 200 for correct credentials - received " + response.status, response.status === 200);
  body = await attempt("returns a JSON body for correct credentials", response.json());
  if (body) {
    check(
      "returns a 'deletionStatus' that is either 'DONE' or 'DENIED' or 'PENDING' with correct credentials - received " +
        body.deletionStatus,
      body.deletionStatus === "DONE" || body.deletionStatus === "DENIED" || body.deletionStatus === "PENDING"
    );
  }
  return body.deletionStatus;
};
