const moment = require('moment');
const { head, fieldTypes } = require('./report-builder/helpers');
const { TestGroup } = require('./report-builder');

const testConfigResponse = async (testGroup, context, queryParameters) => {
  const apiCall = testGroup.newApiCall('GET', '/config', context, queryParameters);
  await apiCall.checkStatus([200]);
  const body = await apiCall.getJSON();
  if (body) {
    apiCall.addBodyCheck("result contains 'version'", !!body.version);
    apiCall.addBodyCheck("'version' is of type string", typeof body.version === 'string');
    apiCall.addBodyCheck("result contains 'fields'", !!body.fields);
    apiCall.addBodyCheck("'fields' is of type array", Array.isArray(body.fields));
    apiCall.addBodyCheck(
      "each field has a 'type' and a 'key'",
      !body.fields.find((f) => !f.type || !f.key),
    );
    apiCall.addBodyCheck(
      "each field 'type' is standard",
      !body.fields.find((f) => !fieldTypes.includes(f.type)),
    );
    apiCall.addBodyCheck(
      "each field has a unique 'key'",
      !body.fields.some((f) => body.fields.filter((g) => g.key === f.key).length !== 1),
    );
    apiCall.addBodyCheck(
      'there are no two fields with same type and no variant (they would have the same name)',
      !body.fields.some(
        (f) => !f.variant && body.fields.filter((g) => g.type === f.type && !g.variant).length > 1,
      ),
    );
    apiCall.addBodyCheck(
      "each field having variant 'custom' has a 'customLabel'",
      !body.fields.some((f) => f.variant === 'custom' && !f.customLabel),
    );
    apiCall.addBodyCheck(
      "each field has a unique 'customLabel' if it has one or if it has a variant 'custom'",
      !body.fields
        .filter((f) => !!f.customLabel || f.variant === 'custom')
        .some((f) => body.fields.filter((g) => g.customLabel === f.customLabel).length !== 1),
    );
    apiCall.addBodyCheck(
      "each field has a unique 'variant' if it has one that is not 'custom'",
      !body.fields.some(
        (f) =>
          !!f.variant &&
          f.variant !== 'custom' &&
          body.fields.filter((g) => g.type === f.type && g.variant === f.variant).length !== 1,
      ),
    );

    apiCall.addBodyCheck(
      'no field has non-standard object keys',
      !body.fields.some((f) =>
        Object.keys(f).some((k) => {
          if (f.type !== 'postalAddress')
            return !['type', 'key', 'mandatory', 'variant', 'customLabel'].includes(k);
          else
            return !['type', 'key', 'mandatory', 'variant', 'customLabel', 'maxSize'].includes(k);
        }),
      ),
      "at least one field contains a key that is not 'type' nor 'key' nor 'mandatory' nor 'variant' nor 'customLabel' nor 'maxSize'",
    );
    apiCall.addBodyCheck("result contains 'legalTerms'", !!body.legalTerms);
    if (body.legalTerms) {
      apiCall.addBodyCheck("'legalTerms' is of type array", Array.isArray(body.legalTerms));
      apiCall.addBodyCheck(
        "each legalTerm has an 'id', a 'date', a 'link' and a 'translatedText'",
        !body.legalTerms.find((l) => !l.id || !l.date || !l.link || !l.translatedText),
      );
      apiCall.addBodyCheck(
        "each legalTerm has a unique 'id'",
        !body.legalTerms.some((l) => body.legalTerms.filter((m) => m.id === l.id).length !== 1),
      );
      apiCall.addBodyCheck(
        "each legalTerm has a unique 'link'",
        !body.legalTerms.some((l) => body.legalTerms.filter((m) => m.link === l.link).length !== 1),
      );
      apiCall.addBodyCheck(
        "each legalTerm has a unique 'translatedText'",
        !body.legalTerms.some(
          (l) => body.legalTerms.filter((m) => m.translatedText === l.translatedText).length !== 1,
        ),
      );
      apiCall.addBodyCheck(
        'no legalTerm has non-standard object keys',
        !body.legalTerms.some((l) =>
          Object.keys(l).some((k) => !['id', 'date', 'link', 'translatedText'].includes(k)),
        ),
      );
      for (let i = 0; i < body.legalTerms.length; i++) {
        const legalTerm = body.legalTerms[i];
        const linkResponse = await head(legalTerm.link);
        apiCall.addBodyCheck(
          legalTerm.translatedText + " - Legal term's link returns a 200 on a GET",
          linkResponse.status === 200,
          'Received ' + linkResponse.status,
        );
        apiCall.addBodyCheck(
          legalTerm.translatedText +
            " - Legal term's date must be a valid date with format YYYY-MM-MM",
          moment(legalTerm.date, 'YYYY-MM-DD').isValid(),
        );
      }
    }
  }
  return apiCall;
};

module.exports = async function () {
  const testGroup = new TestGroup('Route /config');
  await testConfigResponse(testGroup, 'with lang=fr', { lang: 'fr' });
  await testConfigResponse(testGroup, 'with lang=fr-BE', { lang: 'fr-BE' });
  await testConfigResponse(testGroup, 'with empty lang', { lang: '' });
  await testConfigResponse(testGroup, 'with unknown lang', { lang: 'unknown' });
  await testConfigResponse(testGroup, 'with no lang');
  return { testGroup };
};
