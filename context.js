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
  connectionToken: "cc38b4a5-074e-420c-b560-32e4d7eabb77:cc38b4a5-074e-420c-b560-32e4d7eabb78",
};

module.exports = {
  url: devUrl,
  buttonIds,
  validUserWithLogin,
  validUserWithToken,
};
