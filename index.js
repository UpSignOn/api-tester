const { showFinalMessageAndExit } = require("./src/helpers");
const testConfig = require("./src/test-config");
const testButtonConfig = require("./src/test-button-config");

testConfig().then(testButtonConfig).then(showFinalMessageAndExit);
