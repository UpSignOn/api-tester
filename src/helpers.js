const fetch = require("node-fetch");
const { fetchToCurl } = require("fetch-to-curl");
const { url } = require("../context");

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

const head = (uri) => {
  console.log("    head request for " + uri);
  return fetch(uri, {
    method: "HEAD",
  });
};
const get = async (route) => {
  const req = `${url}${route}`;
  const options = {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };
  return {
    curl: fetchToCurl(req, options),
    response: await fetch(req, options),
  };
};
const post = async (route, body) => {
  const req = `${url}${route}`;
  const options = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  return {
    curl: fetchToCurl(req, options),
    response: await fetch(req, options),
  };
};

module.exports = {
  fieldTypes,
  head,
  get,
  post,
};
