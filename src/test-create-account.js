const {
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

module.exports = async function () {
  displayBold("Testing /create-account");
  try {
    let response = await post("/create-account", null);
    check("returns a 400", response.status === 400);

    response = await post("/create-account", { body: JSON.stringify({}) });
    check("returns a 400", response.status === 400);

    response = await post("/create-account", { body: JSON.stringify({ password: "password" }) });
    check("returns a 200 or a 403", response.status === 403 || response.status === 200);
    const body = await attempt("returns a JSON body", response.json());
    check(
      "returns a 'userId' if status is 200 or a 'message' if status is 403",
      (response.status === 200 && !!body.userId) || (response.status === 403 && !!body.message)
    );

    // TODO check that the partner stores the data with a route that gets all the data
  } catch (e) {
    console.log(e);
    displayError(
      0,
      "Server is unreachable. Do you have a valid internet connection? (Or maybe this a bug with the tester itself)"
    );
  }
};
