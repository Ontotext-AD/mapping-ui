// Must be declared global to be detected by typescript (allows import/export)
declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {

      /**
       * Custom command to select DOM element by appCypressData attribute.
       * @example cy.cypressData('greeting')
       * @param cypressData - value of attribute appCypressData.
       */
      cypressData(cypressData: string): Chainable<Element>;
      cypressFind(cypressData: string): Chainable<Element>;

    }
  }
}

Cypress.Commands.add('cypressData', (dataTestValue: string) => {
  return cy.get('[appCypressData=' + dataTestValue + ']');
});

Cypress.Commands.add('cypressFind',  {
  prevSubject: true
}, (subject: any, dataTestValue: string) => {
  return subject.find('[appCypressData=' + dataTestValue + ']');
});

// Convert this to a module instead of script (allows import/export)
export {};
