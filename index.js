const { showFinalMessageAndExit } = require("./src/helpers");
const testConfig = require("./src/test-config");
const testButtonConfig = require("./src/test-button-config");
const testCreateAccount = require("./src/test-create-account");
const { testConnectErrorCases, testConnect } = require("./src/test-connect");

testConfig()
  .then(testButtonConfig)
  .then(testConnectErrorCases)
  .then(testCreateAccount)
  .then((userId) => {
    if (userId) {
      testConnect();
    }
  })
  .then(showFinalMessageAndExit);
