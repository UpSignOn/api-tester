const moment = require('moment');
const { validUserWithLogin, validUserWithToken } = require('../context');
const { get, post, fieldTypes } = require('./report-builder/helpers');
const { TestGroup } = require('./report-builder');

const checkConversionResult = async (apiCall, body, config) => {
  apiCall.addBodyCheck("returns a 'userId' - received " + body.userId, !!body.userId);
  if (body.userData) {
    apiCall.addBodyCheck(
      "if body contains a 'userData', it must be an array",
      Array.isArray(body.userData),
    );
    if (Array.isArray(body.userData)) {
      apiCall.addBodyCheck(
        "each userData has at most a 'key', a'type' and a 'value'",
        !body.userData.some((d) =>
          Object.keys(d).some((k) => !['key', 'type', 'value'].includes(k)),
        ),
      );
      apiCall.addBodyCheck(
        "each userData has necessarily a 'key', a 'type' and a 'value'",
        !body.userData.some((d) => !d.key || !d.type || !d.value),
      );
      apiCall.addBodyCheck(
        "each userData 'type' is standard",
        !body.userData.find((f) => !fieldTypes.includes(f.type)),
      );
      apiCall.addBodyCheck(
        "each userData has a unique 'key'",
        !body.userData.some((f) => body.userData.filter((g) => g.key === f.key).length !== 1),
      );
      for (let i = 0; i < body.userData.length; i++) {
        const userData = body.userData[i];
        if (config && config.fields && Array.isArray(config.fields)) {
          apiCall.addBodyCheck(
            "in userData, data '" +
              userData.key +
              "' has a 'type' and a 'key' that matches one of the 'fields' return by /config",
            config.fields.find((ff) => ff.key === userData.key && ff.type === userData.type),
          );
        }
        switch (userData.type) {
          case 'firstname':
          case 'lastname':
            apiCall.addBodyCheck(
              userData.key + ' has a non empty string value',
              typeof userData.value === 'string' && userData.value.length > 0,
            );
            break;
          case 'title':
            apiCall.addBodyCheck(
              userData.key + " has a 'M' or 'F' value",
              userData.value === 'M' || userData.value === 'F',
            );
            break;
          case 'dateOfBirth':
            apiCall.addBodyCheck(
              userData.key + ' has a valid date value in format YYYY-MM-DD',
              moment(userData.value, 'YYYY-MM-DD').isValid(),
            );
            break;
          case 'email':
            apiCall.addBodyCheck(
              userData.key + " has an object value containing a non-empty 'address'",
              typeof userData.value.address === 'string' && userData.value.address.length > 0,
            );
            break;
          case 'phoneNumber':
            apiCall.addBodyCheck(
              userData.key + " has an object value containing a non-empty 'number'",
              typeof userData.value.number === 'string' && userData.value.number.length > 0,
            );
            apiCall.addBodyCheck(
              userData.key + " 'number' starts with '+'",
              userData.value.number.startsWith('+'),
            );
            break;
          case 'postalAddress':
            apiCall.addBodyCheck(
              userData.key + ' has an array value',
              Array.isArray(userData.value),
            );
            apiCall.addBodyCheck(
              'in ' +
                userData.key +
                " all addresses contain at least 'streetAddress', 'city', 'postalCode' and 'country'",
              !userData.value.some(
                (a) =>
                  typeof a.streetAddress !== 'string' ||
                  !a.streetAddress ||
                  typeof a.city !== 'string' ||
                  !a.city ||
                  typeof a.postalCode !== 'string' ||
                  !a.postalCode ||
                  typeof a.country !== 'string' ||
                  !a.country,
              ),
            );
            break;
          case 'iban':
            apiCall.addBodyCheck(
              userData.key + " has an object value containing at least 'IBAN'",
              typeof userData.value.IBAN === 'string' && userData.value.IBA.length > 0,
            );
            break;
          case 'newsletterConsent':
            apiCall.addBodyCheck(
              userData.key +
                " has an object value containing 'email', 'postal_mail', 'phone', 'sms'",
              typeof userData.value.email === 'boolean' &&
                typeof userData.value.postal_mail === 'boolean' &&
                typeof userData.value.phone === 'boolean' &&
                typeof userData.value.sms === 'boolean',
            );
            break;
          default:
            apiCall.addBodyCheck('THIS IS A BUG IN THE TESTER', false);
        }
      }
    }
  }
};

module.exports = async function () {
  const testGroup = new TestGroup('Route /convert-account');
  let apiCall = testGroup.newApiCall('POST', '/convert-account', 'when body is null', null);
  await apiCall.checkStatus([400]);

  apiCall = testGroup.newApiCall('POST', '/convert-account', 'when body is empty', {});
  await apiCall.checkStatus([400]);

  apiCall = testGroup.newApiCall('POST', '/convert-account', 'when currentLogin is missing', {
    currentPassword: 'password',
    newPassword: 'newPassword',
  });
  await apiCall.checkStatus([400]);

  apiCall = testGroup.newApiCall('POST', '/convert-account', 'when currentPassword is missing', {
    currentLogin: 'login',
    newPassword: 'newPassword',
  });
  await apiCall.checkStatus([400, 401]);

  apiCall = testGroup.newApiCall(
    'POST',
    '/convert-account',
    'with connectionToken but missing newPassword',
    {
      connectionToken: 'token',
    },
  );
  await apiCall.checkStatus([400]);

  apiCall = testGroup.newApiCall(
    'POST',
    '/convert-account',
    'with currentLogin & currentPassword but missing newPassword',
    {
      currentLogin: 'login',
      currentPassword: 'password',
    },
  );
  await apiCall.checkStatus([400]);

  apiCall = testGroup.newApiCall(
    'POST',
    '/convert-account',
    'with currentLogin & currentPassword & connectionToken & newPassword (too many arguments)',
    {
      currentLogin: 'login',
      currentPassword: 'password',
      connectionToken: 'token',
      newPassword: 'newPassword',
    },
  );
  await apiCall.checkStatus([400]);

  apiCall = testGroup.newApiCall(
    'POST',
    '/convert-account',
    'when login does not match a valid user',
    {
      currentLogin: 'login',
      currentPassword: 'password',
      newPassword: 'newPassword',
    },
  );
  await apiCall.checkStatus([401]);

  apiCall = testGroup.newApiCall(
    'POST',
    '/convert-account',
    'when currentPassword does not match a valid currentLogin',
    {
      currentLogin: validUserWithLogin.currentLogin,
      currentPassword: 'badPassword',
      newPassword: 'newPassword',
    },
  );
  await apiCall.security().checkStatus([401]);

  // get config for later check
  const configReq = await get('/config');
  const config = await configReq.response.json();

  apiCall = testGroup.newApiCall(
    'POST',
    '/convert-account',
    'when currentPassword matches currentLogin',
    {
      currentLogin: validUserWithLogin.currentLogin,
      currentPassword: validUserWithLogin.currentPassword,
      newPassword: 'newPasswordForConversion',
    },
  );
  await apiCall.checkStatus([200]);
  const body1 = await apiCall.getJSON();
  if (body1) {
    await checkConversionResult(apiCall, body1, config);
    // revert password change
    await post('/update-password', {
      userId: body1.userId,
      password: 'newPasswordForConversion',
      newPassword: validUserWithLogin.currentPassword,
    });
  }

  apiCall = testGroup.newApiCall('POST', '/convert-account', 'when connectionToken is valid', {
    connectionToken: validUserWithToken.connectionToken,
    newPassword: 'newPasswordForConversion',
  });
  await apiCall.checkStatus([200]);
  const body2 = await apiCall.getJSON();
  if (body2) {
    await checkConversionResult(apiCall, body2, config);
  }
  apiCall = testGroup.newApiCall('POST', '/convert-account', 'when connectionToken is replayed', {
    connectionToken: validUserWithToken.connectionToken,
    newPassword: 'newPasswordForConversion',
  });
  await apiCall.security().checkStatus([401]);

  if (body1) {
    return { testGroup, userId: body1.userId, password: validUserWithLogin.currentPassword };
  }
  return { testGroup };
};
