const { AllTests } = require("./src/report-builder");
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
    const allTests = [];

    const configResult = await testConfig();
    allTests.push(configResult.testGroup);

    const buttonConfigResult = await testButtonConfig();
    allTests.push(buttonConfigResult.testGroup);

    const connectErrorCasesResult = await testConnectErrorCases();
    allTests.push(connectErrorCasesResult.testGroup);

    const createAccountResult = await testCreateAccount();
    allTests.push(createAccountResult.testGroup);
    if (createAccountResult && createAccountResult.userId) {
      const credentials = { userId: createAccountResult.userId, password: createAccountResult.password };
      const connectResult = await testConnect(credentials);
      allTests.push(connectResult.testGroup);

      const updateDataResult = await testUpdateData(credentials);

      const updatePasswordResult = await testUpdatePassword(credentials);
      allTests.push(updatePasswordResult.testGroup);

      const newCredentials = { userId: updatePasswordResult.userId, password: updatePasswordResult.password };
      const accountDeletionResult = await testDeleteAccountAndData(newCredentials);
      allTests.push(accountDeletionResult.testGroup);

      if (accountDeletionResult.deletionStatus === "PENDING") {
        const deletionStatusResult = await testGetAccountDeletionStatus(newCredentials);
        allTests.push(deletionStatusResult.testGroup);
      }
    }
    const convertAccountResult = await testConvertAccount();
    allTests.push(convertAccountResult.testGroup);

    if (convertAccountResult && convertAccountResult.userId) {
      const convertedCredentials = { userId: convertAccountResult.userId, password: convertAccountResult.password };
      const connectAfterConversionResult = await testConnect(convertedCredentials);
      allTests.push(connectAfterConversionResult.testGroup);
    }

    new AllTests(allTests).toConsole();
  } catch (e) {
    console.log(e);
    displayError(
      0,
      "Server is unreachable. Do you have a valid internet connection? (Or maybe this a bug with the tester itself)"
    );
  }
};

runTests();
