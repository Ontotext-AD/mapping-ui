import {HeaderComponentSelectors} from '../utils/selectors/header-component.selectors';

/**
 * Common header steps.
 */
class HeaderSteps {

  static getHeader() {
    return cy.cypressData(HeaderComponentSelectors.HEADER_SELECTOR);
  }

  static getDirtyMappingBanner() {
    return this.getHeader().find('[appCypressData="unsaved-changes-msg"]');
  }

  static getSaveMappingButton() {
    return this.getHeader().find('[appCypressData="save-action"]');
  }

  static saveMapping() {
    return HeaderSteps.getSaveMappingButton().click();
  }

  static getSaveIndicator() {
    return this.getSaveMappingButton().find('.mat-spinner');
  }

  static getGenerateRdfButton() {
    return this.getHeader().find('[appCypressData="generate-rdf-action"]');
  }

  static generateRdf() {
    return HeaderSteps.getGenerateRdfButton().click();
  }

  static getGenerateRdfIndicator() {
    return this.getGenerateRdfButton().find('.mat-spinner');
  }

  static getGenerateSparqlButton() {
    return this.getHeader().find('[appCypressData="generate-sparql-action"]');
  }

  static generateSparql() {
    return HeaderSteps.getGenerateSparqlButton().click();
  }

  static getGenerateSparqlIndicator() {
    return this.getGenerateSparqlButton().find('.mat-spinner');
  }

  static getPreviewToggle() {
    return this.getHeader().find('[appCypressData="toggle-preview"]');
  }

  static enablePreview() {
    return HeaderSteps.getPreviewToggle().click();
  }

  static getNewMappingButton() {
    return this.getHeader().find('[appCypressData="new-mapping-action"]');
  }

  static newMapping() {
    return HeaderSteps.getNewMappingButton().click();
  }

  static getGetJSONButton() {
    return this.getHeader().find('[appCypressData="get-json-action"]');
  }

  static getJSON() {
    HeaderSteps.getGetJSONButton().click();
    return cy.get('a[download]')
      .then((anchor) => (
        new Cypress.Promise((resolve, reject) => {
          // Use XHR to get the blob that corresponds to the object URL.
          const xhr = new XMLHttpRequest();
          xhr.open('GET', anchor.prop('href'), true);
          xhr.responseType = 'blob';

          // Once loaded, use FileReader to get the string back from the blob.
          xhr.onload = () => {
            if (xhr.status === 200) {
              const blob = xhr.response;
              const reader = new FileReader();
              reader.onload = () => {
                // Once we have a string, resolve the promise as JSON to let
                // the Cypress chain continue, e.g. to assert on the result.
                resolve(JSON.parse(reader.result as string));
              };
              reader.readAsText(blob);
            }
          };
          xhr.send();
        })
      ));
  }

  static getConfigurationButton() {
    return cy.cypressData(HeaderComponentSelectors.BUTTON_CONFIGURATION);
  }

  static getBothViewButton() {
    return cy.cypressData(HeaderComponentSelectors.BUTTON_BOTH);
  }

  static getPreviewButton() {
    return cy.cypressData(HeaderComponentSelectors.BUTTON_PREVIEW);
  }
}

export default HeaderSteps;
