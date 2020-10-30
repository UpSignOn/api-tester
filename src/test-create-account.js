const { post, displayBold, check, attempt } = require("./helpers");

module.exports = async function () {
  displayBold("Testing /create-account");
  let response = await post("/create-account", null);
  check("returns a 400 with a null body", response.status === 400);

  response = await post("/create-account", { body: JSON.stringify({}) });
  check("returns a 400 with an empty body", response.status === 400);

  response = await post("/create-account", { body: JSON.stringify({ password: "password" }) });
  check("returns a 200 or a 403", response.status === 403 || response.status === 200);
  let body = await attempt("returns a JSON body", response.json());
  if (body) {
    check(
      "returns a 'userId' if status is 200 or a 'message' if status is 403",
      (response.status === 200 && !!body.userId) || (response.status === 403 && !!body.message)
    );
  }

  response = await post("/create-account", {
    body: JSON.stringify({
      password: "password",
      data: [{ type: "email", key: "email1", value: { address: "test@test.com" } }],
    }),
  });
  check("returns a 200 or a 403", response.status === 403 || response.status === 200);
  body = await attempt("returns a JSON body", response.json());
  if (body) {
    check(
      "returns a 'userId' if status is 200 or a 'message' if status is 403",
      (response.status === 200 && !!body.userId) || (response.status === 403 && !!body.message)
    );
  }

  // TODO check that the partner stores the data with a route that gets all the data
  return { userId: body.userId, password: "password" };
};
