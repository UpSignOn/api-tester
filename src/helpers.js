const { url } = require("../context");
const fetch = require("node-fetch");

let ALL_TESTS_PASS = true;

const fieldTypes = [
  "firstname",
  "lastname",
  "title",
  "dateOfBirth",
  "email",
  "phoneNumber",
  "postalAddress",
  "iban",
  "newsletterConsent",
];

const check = (testName, condition) => {
  if (!condition) displayErrorTitle(1, testName);
  else displaySuccessTitle(1, testName);
};
const attempt = async (testName, promise) => {
  try {
    const res = await promise;
    displaySuccessTitle(1, testName);
    return res;
  } catch {
    displayErrorTitle(1, testName);
    return null;
  }
};

const get = (route, body) => {
  return fetch(`${url}${route}`, {
    ...body,
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
};
const post = (route, body) => {
  return fetch(`${url}${route}`, {
    ...body,
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
};

const displayBold = (message) => {
  console.log("\x1b[1m", message, "\x1b[0m");
};
const displayError = (increment, message) => {
  console.log("   ".repeat(increment), "\x1b[31m", message, "\x1b[0m");
  ALL_TESTS_PASS = false;
};
const displayErrorTitle = (increment, message) => {
  console.log("   ".repeat(increment), "\x1b[41m", message, "\x1b[0m");
  ALL_TESTS_PASS = false;
};
const displaySuccessTitle = (increment, message) => {
  console.log("   ".repeat(increment), "\x1b[42m", message, "\x1b[0m");
};
const displaySuccess = (message) => {
  console.log("\x1b[32m", message, "\x1b[0m");
};

const showFinalMessageAndExit = () => {
  if (!ALL_TESTS_PASS) {
    displayError(0, "SOME TESTS FAILED!");
    process.exit(1);
  } else {
    displaySuccess("ALL TESTS PASSED!");
    process.exit(0);
  }
};

module.exports = {
  fieldTypes,
  check,
  attempt,
  get,
  post,
  displayBold,
  displayError,
  displayErrorTitle,
  displaySuccessTitle,
  displaySuccess,
  showFinalMessageAndExit,
};
