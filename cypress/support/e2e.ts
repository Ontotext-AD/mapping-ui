// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Configures retry count for failed tests
// import 'cypress-plugin-retries';
// Cypress.env('RETRIES', 0);

// Imports viewport configuration
import './viewport';

import 'cypress-failed-log';

// WORKAROUND FOR NAVIGATION CONFIRMATION
// See https://github.com/cypress-io/cypress/issues/2938#issuecomment-549565158
Cypress.on('window:before:load', function (window: any) {
  const original = window.EventTarget.prototype.addEventListener

  window.EventTarget.prototype.addEventListener = function () {
    if (arguments && arguments[0] === 'beforeunload') {
      return
    }
    return original.apply(this, arguments)
  }

  Object.defineProperty(window, 'onbeforeunload', {
    get: function () { },
    set: function () { }
  })
})
