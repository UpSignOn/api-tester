> These are end-to-end tests. They really do create accounts, update them and delete them.

This tests the compliance of your implementation of the UpSignOn partner API.
This tests are not complete. Some things cannot be tested with this module.

- /create-account
  - the module cannot test how you deal with 'data'
- /connect
  - the module cannot test if your 'redirectionUri' are well implemented for your use case

# Known issue

For error cases, your implementation may be OK while the test fail. For instance, in /update-data, testing

- userId not empty (otherwise 400)
- then password not empty (otherwise 401)
- then data not empty (otherwise 400)

is algorithmically the same as testing

- userId not empty (otherwise 400)
- then data not empty (otherwise 400)
- then password not empty (otherwise 401)

but the test will fail in the first case.
