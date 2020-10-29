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
  displayBold("Testing /update-data");
  let response = await post("/update-data", null);
  check("returns a 400", response.status === 400);

  response = await post("/update-data", { body: JSON.stringify({}) });
  check("returns a 400", response.status === 400);

  response = await post("/update-data", { body: JSON.stringify({ password: "password" }) });
  check("returns a 400", response.status === 400);

  response = await post("/update-data", { body: JSON.stringify({ userId: credentials.userId }) });
  check("returns a 400", response.status === 400);

  response = await post("/update-data", { body: JSON.stringify(credentials) });
  check("returns a 400", response.status === 400);

  response = await post("/update-data", { body: JSON.stringify({ data: [] }) });
  check("returns a 400", response.status === 400);

  response = await post("/update-data", {
    body: JSON.stringify({ userId: "badId", password: "badPassword", data: [] }),
  });
  check("returns a 401", response.status === 401);

  response = await post("/update-data", {
    body: JSON.stringify({ userId: credentials.userId, password: "badPassword", data: [] }),
  });
  check("returns a 401", response.status === 401);

  response = await post("/update-data", {
    body: JSON.stringify({ ...credentials, data: [] }),
  });
  check("returns a 200 or a 403", response.status === 403 || response.status === 200);
  if (response.status === 403) {
    const body = await attempt("returns a JSON body if request status is 403", response.json());
    check("returns a 'message' if status is 403", !!body.message);
  }

  // TODO check that the partner stores the data with a route that gets all the data
};
