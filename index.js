const testConfig = require("./src/test-config");
const { showFinalMessageAndExit } = require("./src/helpers");

testConfig().then(() => showFinalMessageAndExit());
