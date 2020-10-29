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

const testConnectErrorCases = async () => {
  displayBold("Testing /connect error cases");
  try {
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
  } catch (e) {
    console.log(e);
    displayError(
      0,
      "Server is unreachable. Do you have a valid internet connection? (Or maybe this a bug with the tester itself)"
    );
  }
};

const testConnect = async () => {};

module.exports = {
  testConnectErrorCases,
  testConnect,
};
