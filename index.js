const { showFinalMessageAndExit } = require("./src/helpers");
const testConfig = require("./src/test-config");
const testButtonConfig = require("./src/test-button-config");
const testCreateAccount = require("./src/test-create-account");
const { testConnectErrorCases, testConnect } = require("./src/test-connect");
const testUpdateData = require("./src/test-update-data");
const testUpdatePassword = require("./src/test-update-password");
const testDeleteAccountAndData = require("./src/test-delete-account-and-data");
const testGetAccountDeletionStatus = require("./src/test-get-account-deletion-status");
const testConvertAccount = require("./src/test-convert-account");

const runTests = async () => {
  try {
    await testConfig();
    await testButtonConfig();
    await testConnectErrorCases();
    const credentials = await testCreateAccount();
    if (credentials.userId) {
      await testConnect(credentials);
      await testUpdateData(credentials);
      const newCredentials = await testUpdatePassword(credentials);
      const deletionStatus = await testDeleteAccountAndData(newCredentials);
      if (deletionStatus === "PENDING") {
        await testGetAccountDeletionStatus(newCredentials);
      }
    }
    const convertedAcountCredentials = await testConvertAccount();
    if (credentials.userId) {
      await testConnect(credentials);
      await testUpdateData(credentials);
      const newCredentials = await testUpdatePassword(credentials);
      const deletionStatus = await testDeleteAccountAndData(newCredentials);
      if (deletionStatus === "PENDING") {
        await testGetAccountDeletionStatus(newCredentials);
      }
    }
  } catch (e) {
    console.log(e);
    displayError(
      0,
      "Server is unreachable. Do you have a valid internet connection? (Or maybe this a bug with the tester itself)"
    );
  }
};

runTests().then(showFinalMessageAndExit);
