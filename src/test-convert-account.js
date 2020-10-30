const moment = require("moment");
const { validUserWithLogin, validUserWithToken } = require("../context");
const {
  get,
  post,
  displayBold,
  displayError,
  displayErrorTitle,
  displaySuccessTitle,
  fieldTypes,
  check,
  attempt,
} = require("./helpers");

const checkConversionResult = async (body) => {
  check("returns a 'userId'", !!body.userId);
  if (body.userData) {
    check("if body contains a 'userData', it must be an array", Array.isArray(body.userData));
    check(
      "each userData has at most a 'key', a'type' and a 'value'",
      !body.userData.some((d) => Object.keys(d).some((k) => !["key", "type", "value"].includes(k)))
    );
    check(
      "each userData has necessarily a 'key', a 'type' and a 'value'",
      !body.userData.some((d) => !d.key || !d.type || !d.value)
    );
    check("each userData 'type' is standard", !body.userData.find((f) => !fieldTypes.includes(f.type)));
    check(
      "each userData has a unique 'key'",
      !body.userData.some((f) => body.userData.filter((g) => g.key === f.key).length !== 1)
    );
    for (let i = 0; i < body.userData.length; i++) {
      const userData = body.userData;
      switch (userData.type) {
        case "firstname":
        case "lastname":
          check(userData.key + " has a string value", typeof userData.value === "string");
          break;
        case "title":
          check(userData.key + " has a 'M' or 'F' value", userData.value === "M" || userData.value === "F");
          break;
        case "dateOfBirth":
          check(
            userData.key + " has a valid date value in format YYYY-MM-DD",
            moment(userData.value, "YYYY-MM-DD").isValid()
          );
          break;
        case "email":
          check(userData.key + " has an object value containing 'address'", !!userData.value.address);
          break;
        case "phoneNumber":
          check(userData.key + " has an object value containing 'number'", !!userData.value.number);
          check(userData.key + " 'number' starts with '+'", userData.value.number.startsWith("+"));
          break;
        case "postalAddress":
          check(userData.key + " has an array value", Array.isArray(userData.value));
          check(
            "in " +
              userData.key +
              " all addresses contain at least 'streetAddress', 'city', 'postalCode' and 'country'",
            !userData.value.some((a) => !a.streetAddress || !a.city || !a.postalCode || !a.country)
          );
          break;
        case "iban":
          check(userData.key + " has an object value containing at least 'IBAN'", !!userData.value.IBAN);
          break;
        case "newsletterConsent":
          check(
            userData.key + " has an object value containing 'email', 'postal_mail', 'phone', 'sms'",
            typeof userData.value.email === "boolean" &&
              typeof userData.value.postal_mail === "boolean" &&
              typeof userData.value.phone === "boolean" &&
              typeof userData.value.sms === "boolean"
          );
          break;
      }
    }
  }
};

module.exports = async function () {
  displayBold("Testing /convert-account");
  let response = await post("/convert-account", null);
  check("returns a 400 with a null body", response.status === 400);

  response = await post("/convert-account", { body: JSON.stringify({}) });
  check("returns a 400 with an empty body", response.status === 400);

  response = await post("/convert-account", {
    body: JSON.stringify({ currentPassword: "password", newPassword: "newPassword" }),
  });
  check("returns a 400 with an missing currentLogin", response.status === 400);

  response = await post("/convert-account", {
    body: JSON.stringify({ currentLogin: "login", newPassword: "newPassword" }),
  });
  check("returns a 400 with an missing currentPassword", response.status === 400);

  response = await post("/convert-account", {
    body: JSON.stringify({ connectionToken: "token" }),
  });
  check("returns a 400 with connectionToken but missing newPassword", response.status === 400);

  response = await post("/convert-account", {
    body: JSON.stringify({ currentLogin: "login", currentPassword: "password" }),
  });
  check("returns a 400 with currentLogin & currentPassword but missing newPassword", response.status === 400);

  response = await post("/convert-account", {
    body: JSON.stringify({
      currentLogin: "login",
      currentPassword: "password",
      connectionToken: "token",
      newPassword: "newPassword",
    }),
  });
  check("returns a 400 with currentLogin & currentPassword & connectionToken & newPassword", response.status === 400);

  response = await post("/convert-account", {
    body: JSON.stringify({
      currentLogin: "login",
      currentPassword: "password",
      newPassword: "newPassword",
    }),
  });
  check("returns a 401 when login does not match a valid user", response.status === 401);

  response = await post("/convert-account", {
    body: JSON.stringify({
      currentLogin: validUserWithLogin.currentLogin,
      currentPassword: "badPassword",
      newPassword: "newPassword",
    }),
  });
  check("returns a 401 when currentPassword does not match a valid currentLogin", response.status === 401);

  response = await post("/convert-account", {
    body: JSON.stringify({
      currentLogin: validUserWithLogin.currentLogin,
      currentPassword: validUserWithLogin.currentPassword,
      newPassword: "newPasswordForConversion",
    }),
  });
  check("returns a 200 when currentPassword matches currentLogin", response.status === 200);
  let body = await attempt("returns a JSON body when currentPassword matches currentLogin", response.json());
  if (body) {
    await checkConversionResult(body);
  }

  response = await post("/convert-account", {
    body: JSON.stringify({
      connectionToken: validUserWithToken.connectionToken,
      newPassword: "newPasswordForConversion",
    }),
  });
  check("returns a 200 when connectiontoken is valid", response.status === 200);
  body = await attempt("returns a JSON body when connnectionToken is valid", response.json());
  if (body) {
    await checkConversionResult(body);
  }

  // TODO check that the partner stores the data with a route that gets all the data
  return { userId: body?.userId, password: "newPasswordForConversion" };
};
