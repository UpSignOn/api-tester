const { buttonIds } = require("../context");
const { get, displayBold, check, attempt } = require("./helpers");

const testButtonConfigResponse = async (response, config) => {
  check("returns a 200 - received " + response.status, response.status === 200);
  const body = await attempt("returns a JSON body", response.json());
  if (body) {
    check("result contains 'generalConfigVersion'", !!body.generalConfigVersion);
    check("'generalConfigVersion' is of type string", typeof body.generalConfigVersion === "string");
    check(
      "'generalConfigVersion' matches the 'version' of the /config route",
      config.version === body.generalConfigVersion
    );
    check("result contains 'fields'", !!body.fields);
    check("'fields' is of type array", Array.isArray(body.fields));
    check(
      "'fields' is a subset of the 'fields' array returned by /config",
      !body.fields.some((f) => !config.fields.find((ff) => ff.key === f.key && ff.type === f.type))
    );
    check(
      "no field has non-standard object keys",
      !body.fields.some((f) => Object.keys(f).some((k) => !["type", "key", "mandatory"].includes(k)))
    );
    check(
      "'forceFormDisplay' is of type boolean if it is set",
      body.forceFormDisplay == null || typeof body.forceFormDisplay === "boolean"
    );
    check(
      "'disableAccountCreation' is of type boolean if it is set",
      body.disableAccountCreation == null || typeof body.disableAccountCreation === "boolean"
    );
    check(
      "result contains only standard keys",
      !Object.keys(body).some(
        (k) => !["fields", "forceFormDisplay", "generalConfigVersion", "disableAccountCreation"].includes(k)
      )
    );
  }
};

module.exports = async function () {
  displayBold("Testing /button-config");
  const configResponse = await get("/config");
  const config = await configResponse.json();
  for (let i = 0; i < buttonIds.length; i++) {
    const buttonId = buttonIds[i];
    const response = await get("/button-config?buttonId=" + buttonId);
    await testButtonConfigResponse(response, config);
  }

  const response = await get("/button-config?buttonId=unknown");
  check("returns 404 for unknown buttonId received " + response.status, response.status === 404);
};
