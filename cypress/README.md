### [Cypress](https://docs.cypress.io) tests
  Before start test writhing please read [Cypress best practices](https://docs.cypress.io/guides/references/best-practices.html)
  
  We must use a custom attribute `appCypressData` and pass a variable to it as selector for html elements: `appCypressData="foo"`.
  A directive removes all custom attributes when environment is set to production. 
  
  Set specific values for environment in cypress.json file in project root directory.  

  Servers have to be run.
  Run `npm run cy:open` or `npm run cy:run` to start cypress headless.
  When run cypress headless it will creates two folders `cypress/videos` and `cypress/snapshots`:
  * Videos folder will contains mp4 files for every test. 
  * Snapshots will contains snapshots of failed tests.
  Folders are git ignored.
  
  Run `run cy:run -- --spec "path_to_test"` to execute single test. For example: `npm run cy:run --spec "cypress\test\amsterdam-mapping.spec.ts"`
  
  How to pass environment parameters when run/open tests: `npm run cy:run --spec "cypress\test\amsterdam-mapping" --env source1=foo,source2=bar`
