const moment = require("moment");
const { validUserWithLogin, validUserWithToken } = require("../context");
const { get, post, displayBold, check, checkSecurity, attempt, fieldTypes } = require("./helpers");

const checkConversionResult = async (body, config) => {
  check("returns a 'userId'", !!body.userId);
  if (body.userData) {
    check("if body contains a 'userData', it must be an array", Array.isArray(body.userData));
    if (Array.isArray(body.userData)) {
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
        const userData = body.userData[i];
        if (config && config.fields && Array.isArray(config.fields)) {
          check(
            "in userData, data '" +
              userData.key +
              "' has a 'type' and a 'key' that matches one of the 'fields' return by /config",
            config.fields.find((ff) => ff.key === userData.key && ff.type === userData.type)
          );
        }
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
          default:
            check("THIS IS A BUG IN THE TESTER", false);
        }
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
  checkSecurity(
    "returns a 400 or 401 with an missing currentPassword",
    response.status === 400 || response.status === 401
  );

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
  checkSecurity("returns a 401 when login does not match a valid user", response.status === 401);

  response = await post("/convert-account", {
    body: JSON.stringify({
      currentLogin: validUserWithLogin.currentLogin,
      currentPassword: "badPassword",
      newPassword: "newPassword",
    }),
  });
  checkSecurity("returns a 401 when currentPassword does not match a valid currentLogin", response.status === 401);

  // get config for later check
  const configResponse = await get("/config");
  const config = await configResponse.json();

  response = await post("/convert-account", {
    body: JSON.stringify({
      currentLogin: validUserWithLogin.currentLogin,
      currentPassword: validUserWithLogin.currentPassword,
      newPassword: "newPasswordForConversion",
    }),
  });
  check("returns a 200 when currentPassword matches currentLogin", response.status === 200);
  const body1 = await attempt("returns a JSON body when currentPassword matches currentLogin", response.json());
  if (body1) {
    await checkConversionResult(body1, config);
    // revert password change
    await post("/update-password", {
      body: JSON.stringify({
        userId: body1.userId,
        password: "newPasswordForConversion",
        newPassword: validUserWithLogin.currentPassword,
      }),
    });
  }

  response = await post("/convert-account", {
    body: JSON.stringify({
      connectionToken: validUserWithToken.connectionToken,
      newPassword: "newPasswordForConversion",
    }),
  });
  check("returns a 200 when connectionToken is valid", response.status === 200);
  const body2 = await attempt("returns a JSON body when connnectionToken is valid", response.json());
  if (body2) {
    await checkConversionResult(body2, config);
    response = await post("/convert-account", {
      body: JSON.stringify({
        connectionToken: validUserWithToken.connectionToken,
        newPassword: "newPasswordForConversion",
      }),
    });
    checkSecurity("connectionToken cannot be used twice to convert an account", response.status === 401);
  }

  if (body1) {
    return { userId: body1.userId, password: validUserWithLogin.currentPassword };
  }
  return null;
};
