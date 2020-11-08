const fetch = require("node-fetch");
const fse = require("fs-extra");
const moment = require("moment");
const { get, post } = require("./helpers");

const queryParametersToString = (qp) => {
  if (qp)
    return (
      "?" +
      Object.keys(qp)
        .map((k) => `${k}=${qp[k]}`)
        .join("&")
    );
  else return "";
};

class AllTests {
  constructor(testGroups) {
    this.testGroups = testGroups;
  }
  areAllTestsOK() {
    return !this.testGroups.some((testGroup) => {
      return !!testGroup.routeTests.some((routeTest) =>
        routeTest.tests.some((test) => test.successStatus !== "SUCCESS")
      );
    });
  }
  getJSONReport() {
    return {
      overallStatus: this.areAllTestsOK() ? "SUCCESS" : "FAIL",
      details: this.testGroups.map((groupTest) => {
        return {
          groupTitle: groupTest.title,
          routeTests: groupTest.routeTests.map((routeTest) => {
            return {
              method: routeTest.method,
              route: routeTest.route,
              context: routeTest.context,
              queryParameters: routeTest.queryParameters,
              body: routeTest.body,
              curl: routeTest.curl,
              responseTests: routeTest.tests,
            };
          }),
        };
      }),
    };
  }
  async logSummaryAndExit() {
    fse.ensureDirSync("./reports");
    const reportName = "./reports/" + moment().format("YYYY-MM-DD-hh:mm:ss") + ".json";
    const fileContent = JSON.stringify(this.getJSONReport(), null, "  ");
    await fse.writeFile(reportName, fileContent);
    if (this.areAllTestsOK()) {
      // display green
      console.log("\x1b[32mALL TESTS PASSED!\x1b[0m");
      process.exit(0);
    } else {
      // display red
      console.log("\x1b[31mSOME TESTS FAILED!\x1b[0m");
      process.exit(1);
    }
  }
}

class TestGroup {
  constructor(title) {
    // Display Bold test group title
    console.log("\n\n\x1b[1m", title, "\x1b[0m");
    this.title = title;
    this.routeTests = [];
  }
  newApiCall = (method, route, context, parameters) => {
    const routeTest = new RouteTest(method, route, context, parameters);
    this.routeTests.push(routeTest);
    return routeTest;
  };
}

class RouteTest {
  constructor(method, route, context, parameters) {
    console.log(`\n- ${method} ${route} ${context}`);

    this.method = method;
    this.route = route;
    this.context = context;
    this.queryParameters = method === "GET" ? queryParametersToString(parameters) : null;
    this.body = method === "POST" ? parameters : null;
    this.tests = [];

    if (this.method === "GET") console.log(`    query parameters: ${this.queryParameters}`);
    if (this.method === "POST") console.log(`    body: ${JSON.stringify(this.body)}`);
  }

  addTest(testDescription) {
    const newTest = {
      ...testDescription,
      isSecurityCheck: !!this.isNextTestImportantForSecurity,
    };
    this.tests.push(newTest);
    this.isNextTestImportantForSecurity = false;

    let message = "    ";
    // display background blue
    if (newTest.isSecurityCheck) message += "\x1b[46m- Security! -\x1b[0m ";
    if (newTest.successStatus === "FAIL") {
      // display background red
      message += `\x1b[41m FAIL - ${newTest.title}\x1b[0m`;
      console.log(message);
      if (!!newTest.errorDetails) console.log(`        ${newTest.errorDetails}`);
    }
    if (newTest.successStatus === "SUCCESS") {
      // display background green
      message += `\x1b[42m SUCCESS - ${newTest.title}\x1b[0m`;
      console.log(message);
    }
  }
  security() {
    this.isNextTestImportantForSecurity = true;
    return this;
  }
  async checkStatus(expectedStatuses) {
    try {
      if (this.method === "GET") {
        const req = await get(this.route + this.queryParameters);
        this.response = req.response;
        this.curl = req.curl;
      }
      if (this.method === "POST") {
        const req = await post(this.route, this.body);
        this.response = req.response;
        this.curl = req.curl;
      }
      console.log(`    ${this.curl}`);

      const successCondition = expectedStatuses.includes(this.response.status);
      this.addTest({
        title: `Should return status ${expectedStatuses.join("|")}`,
        successStatus: successCondition ? "SUCCESS" : "FAIL",
        errorDetails: successCondition ? null : `Actual status was ${this.response.status}.`,
      });
      return this.response.status;
    } catch (e) {
      console.error(e);
      this.addTest({
        title: `Should return status ${expectedStatuses.join("|")}`,
        successStatus: "FAIL",
        errorDetails: `Server could not be reached.`,
      });
    }
  }
  async getJSON() {
    const testTitle = "Should return a JSON body";
    if (!this.response)
      this.addTest({
        title: testTitle,
        successStatus: "FAIL",
        errorDetails: "There was no response.",
      });
    try {
      this.responseBody = await this.response.json();
      this.addTest({
        title: testTitle,
        successStatus: "SUCCESS",
      });
      if (!this.responseBody) throw new Error();
      return this.responseBody;
    } catch {
      this.addTest({
        title: testTitle,
        successStatus: "FAIL",
        errorDetails: "There was a response but it was not JSON.",
      });
      return null;
    }
  }

  addBodyCheck(title, successCondition, errorDetails) {
    this.addTest({
      title,
      successStatus: successCondition ? "SUCCESS" : "FAIL",
      errorDetails,
    });
  }
}

module.exports = {
  AllTests,
  TestGroup,
  RouteTest,
};
