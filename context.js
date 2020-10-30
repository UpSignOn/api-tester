const devUrl = "http://192.168.1.11:8888/demo";
const url = "https://monptitshop.upsignon.eu/demo";
const badUrl = "https://monptitshop.upsignon.eu/deo";

const buttonIds = ["SHOP"];

// For conversion
const validUserWithLogin = {
  currentLogin: "conversion@test.com", // DO NOT use test@test.com
  currentPassword: "testConversionPass",
};
const validUserWithToken = {
  connectionToken: "token",
};

module.exports = {
  url: devUrl,
  buttonIds,
  validUserWithLogin,
  validUserWithToken,
};
