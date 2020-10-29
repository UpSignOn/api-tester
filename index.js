const { showFinalMessageAndExit } = require("./src/helpers");
const testConfig = require("./src/test-config");
const testButtonConfig = require("./src/test-button-config");
const testCreateAccount = require("./src/test-create-account");
const { testConnectErrorCases, testConnect } = require("./src/test-connect");

testConfig()
  .then(testButtonConfig)
  .then(testConnectErrorCases)
  .then(testCreateAccount)
  .then((credentials) => {
    if (credentials.userId) {
      testConnect(credentials);
    }
  })
  .catch((e) => {
    console.log(e);
    displayError(
      0,
      "Server is unreachable. Do you have a valid internet connection? (Or maybe this a bug with the tester itself)"
    );
  })
  .then(showFinalMessageAndExit);
