const { url } = require("../context");
const fetch = require("node-fetch");

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
  return fetch(uri, {
    method: "HEAD",
  });
};
const get = (route) => {
  return fetch(`${url}${route}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
};
const post = (route, body) => {
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
  return fetch(`${url}${route}`, options);
};

module.exports = {
  fieldTypes,
  head,
  get,
  post,
};
