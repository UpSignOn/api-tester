const devUrl = 'https://isae.front1.netanswer.fr/upsignon';

const buttonIds = ['btn_48eafed1bd104854de02dce0eae130d3'];
// For conversion
const validUserWithLogin = {
  currentLogin: 'gireg.de-kerdanet', // DO NOT use test@test.com
  currentPassword: 'totototo',
};
const validUserWithToken = {
  connectionToken: 'cc38b4a5-074e-420c-b560-32e4d7eabb77:cc38b4a5-074e-420c-b560-32e4d7eabb78',
};

module.exports = {
  url: devUrl,
  buttonIds,
  validUserWithLogin,
  validUserWithToken,
};
