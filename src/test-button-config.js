const { buttonIds } = require("../context");
const { get, displayBold, check, attempt } = require("./helpers");
const { TestGroup, RouteTest } = require("./report-builder");

const testButtonConfigResponse = async (testGroup, queryParameters, config) => {
  const apiCall = testGroup.newApiCall(
    "GET",
    "/button-config",
    "for button " + queryParameters.buttonId,
    queryParameters
  );
  await apiCall.checkStatus([200]);
  const body = await apiCall.getJSON();
  if (body) {
    apiCall.addBodyCheck("result contains 'generalConfigVersion'", !!body.generalConfigVersion);
    apiCall.addBodyCheck("'generalConfigVersion' is of type string", typeof body.generalConfigVersion === "string");
    apiCall.addBodyCheck(
      "'generalConfigVersion' matches the 'version' of the /config route",
      config.version === body.generalConfigVersion
    );
    apiCall.addBodyCheck("result contains 'fields'", !!body.fields);
    apiCall.addBodyCheck("'fields' is of type array", Array.isArray(body.fields));
    apiCall.addBodyCheck(
      "'fields' is a subset of the 'fields' array returned by /config",
      !body.fields.some((f) => !config.fields.find((ff) => ff.key === f.key && ff.type === f.type))
    );
    apiCall.addBodyCheck(
      "no field has non-standard object keys",
      !body.fields.some((f) => Object.keys(f).some((k) => !["type", "key", "mandatory"].includes(k)))
    );
    apiCall.addBodyCheck(
      "'forceFormDisplay' is of type boolean if it is set",
      body.forceFormDisplay == null || typeof body.forceFormDisplay === "boolean"
    );
    apiCall.addBodyCheck(
      "'disableAccountCreation' is of type boolean if it is set",
      body.disableAccountCreation == null || typeof body.disableAccountCreation === "boolean"
    );
    apiCall.addBodyCheck(
      "result contains only standard keys",
      !Object.keys(body).some(
        (k) => !["fields", "forceFormDisplay", "generalConfigVersion", "disableAccountCreation"].includes(k)
      )
    );
  }
  return apiCall;
};

module.exports = async function () {
  const testGroup = new TestGroup("Route /button-config");
  const configResponse = await get("/config");
  const config = await configResponse.json();

  for (let i = 0; i < buttonIds.length; i++) {
    const buttonId = buttonIds[i];
    await testButtonConfigResponse(testGroup, { buttonId }, config);
  }

  const apiCall = testGroup.newApiCall("GET", "/button-config", "for unknown buttonId", { buttonId: "unknown" });
  await apiCall.checkStatus([404]);

  return { testGroup };
};
