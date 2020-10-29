> These are end-to-end tests. They really do create accounts, update them and delete them.

This tests the compliance of your implementation of the UpSignOn partner API.
This tests are not complete. Some things cannot be tested with this module.

- /create-account
  - the module cannot test how you deal with 'data'
- /connect
  - the module cannot test if your 'redirectionUri' are well implemented for your use case
