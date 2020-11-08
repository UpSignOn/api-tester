const fetch = require("node-fetch");
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
  toConsole() {
    this.testGroups.forEach((group) => {
      // Display Bold test group title
      console.log("\x1b[1m", group.title, "\x1b[0m");
      group.routeTests.forEach((routeTest) => {
        console.log(`- ${routeTest.method} ${routeTest.route} ${routeTest.context}`);
        if (routeTest.method === "GET") console.log(`    query parameters: ${routeTest.queryParameters}`);
        if (routeTest.method === "POST") console.log(`    body: ${JSON.stringify(routeTest.body)}`);
        console.log(`    ${routeTest.curl}`);
        routeTest.tests.forEach((test) => {
          let message = "    ";
          // display background blue
          if (test.isSecurityCheck) message += "\x1b[46m- Security! -\x1b[0m ";
          if (test.successStatus === "FAIL") {
            // display background red
            message += `\x1b[41m FAIL - ${test.title}\x1b[0m`;
            console.log(message);
            if (!!test.errorDetails) console.log(`        ${test.errorDetails}`);
          }
          if (test.successStatus === "SUCCESS") {
            // display background green
            message += `\x1b[42m SUCCESS - ${test.title}\x1b[0m`;
            console.log(message);
          }
        });
      });
    });
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
    this.method = method;
    this.route = route;
    this.context = context;
    this.queryParameters = method === "GET" ? queryParametersToString(parameters) : null;
    this.body = method === "POST" ? parameters : null;
    this.tests = [];
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

      const successCondition = expectedStatuses.includes(this.response.status);
      this.tests.push({
        title: `Should return status ${expectedStatuses.join("|")}`,
        successStatus: successCondition ? "SUCCESS" : "FAIL",
        errorDetails: successCondition ? null : `Actual status was ${this.response.status}.`,
        isSecurityCheck: !!this.isNextTestImportantForSecurity,
      });
      return this.response.status;
    } catch (e) {
      console.error(e);
      this.tests.push({
        title: `Should return status ${expectedStatuses.join("|")}`,
        successStatus: "FAIL",
        errorDetails: `Server could not be reached.`,
        isSecurityCheck: !!this.isNextTestImportantForSecurity,
      });
    } finally {
      this.isNextTestImportantForSecurity = false;
    }
  }
  async getJSON() {
    const testTitle = "Should return a JSON body";
    if (!this.response)
      this.tests.push({
        title: testTitle,
        successStatus: "FAIL",
        errorDetails: "There was no response.",
      });
    try {
      this.responseBody = await this.response.json();
      this.tests.push({
        title: testTitle,
        successStatus: "SUCCESS",
      });
      if (!this.responseBody) throw new Error();
      return this.responseBody;
    } catch {
      this.tests.push({
        title: testTitle,
        successStatus: "FAIL",
        errorDetails: "There was a response but it was not JSON.",
      });
      return null;
    }
  }

  addBodyCheck(title, successCondition, errorDetails) {
    this.tests.push({
      title,
      successStatus: successCondition ? "SUCCESS" : "FAIL",
      errorDetails,
      isSecurityCheck: !!this.isNextTestImportantForSecurity,
    });
    this.isNextTestImportantForSecurity = false;
  }
}

module.exports = {
  AllTests,
  TestGroup,
  RouteTest,
};
