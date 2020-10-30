const moment = require("moment");
const { head, get, displayBold, fieldTypes, check, attempt } = require("./helpers");

const testConfigResponse = async (response) => {
  check("returns a 200", response.status === 200);
  const body = await attempt("returns a JSON body", response.json());
  if (body) {
    check("result contains 'version'", !!body.version);
    check("'version' is of type string", typeof body.version === "string");
    check("result contains 'fields'", !!body.fields);
    check("'fields' is of type array", Array.isArray(body.fields));
    check("each field has a 'type' and a 'key'", !body.fields.find((f) => !f.type || !f.key));
    check("each field 'type' is standard", !body.fields.find((f) => !fieldTypes.includes(f.type)));
    check(
      "each field has a unique 'key'",
      !body.fields.some((f) => body.fields.filter((g) => g.key === f.key).length !== 1)
    );
    check(
      "each field has a unique 'customLabel' if it has one",
      !body.fields.some(
        (f) => !!f.customLabel && body.fields.filter((g) => g.customLabel === f.customLabel).length !== 1
      )
    );
    check(
      "no field has non-standard object keys",
      !body.fields.some((f) =>
        Object.keys(f).some((k) => !["type", "key", "mandatory", "variant", "customLabel"].includes(k))
      )
    );
    check("result contains 'legalTerms'", !!body.legalTerms);
    if (body.legalTerms) {
      check("'legalTerms' is of type array", Array.isArray(body.legalTerms));
      check(
        "each legalTerm has an 'id', a 'date', a 'link' and a 'translatedText'",
        !body.legalTerms.find((l) => !l.id || !l.date || !l.link || !l.translatedText)
      );
      check(
        "each legalTerm has a unique 'id'",
        !body.legalTerms.some((l) => body.legalTerms.filter((m) => m.id === l.id).length !== 1)
      );
      check(
        "each legalTerm has a unique 'link'",
        !body.legalTerms.some((l) => body.legalTerms.filter((m) => m.link === l.link).length !== 1)
      );
      check(
        "each legalTerm has a unique 'translatedText'",
        !body.legalTerms.some((l) => body.legalTerms.filter((m) => m.translatedText === l.translatedText).length !== 1)
      );
      check(
        "no legalTerm has non-standard object keys",
        !body.legalTerms.some((l) => Object.keys(l).some((k) => !["id", "date", "link", "translatedText"].includes(k)))
      );
      for (let i = 0; i < body.legalTerms.length; i++) {
        const legalTerm = body.legalTerms[i];
        const linkResponse = await head(legalTerm.link);
        check(legalTerm.translatedText + " - Legal term's link returns a 200 on a GET", linkResponse.status === 200);
        check(
          legalTerm.translatedText + " - Legal term's date must be a valid date with format YYYY-MM-MM",
          moment(legalTerm.date, "YYYY-MM-DD").isValid()
        );
      }
    }
  }
};

module.exports = async function () {
  displayBold("Testing /config");
  let response = await get("/config?lang=fr");
  await testConfigResponse(response);

  response = await get("/config?lang=fr-BE");
  await testConfigResponse(response);

  response = await get("/config?lang=");
  await testConfigResponse(response);

  response = await get("/config?lang=unknown");
  await testConfigResponse(response);

  response = await get("/config");
  await testConfigResponse(response);
};
