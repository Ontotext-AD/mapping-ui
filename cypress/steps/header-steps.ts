import {HeaderComponentSelectors} from '../utils/selectors/header-component.selectors';

/**
 * Common header steps.
 */
class HeaderSteps {

  static getHeader() {
    return cy.cypressData(HeaderComponentSelectors.HEADER_SELECTOR);
  }

  static getSaveMappingButton() {
    return this.getHeader().find('[appCypressData="save-action"]');
  }

  static saveMapping() {
    return HeaderSteps.getSaveMappingButton().click();
  }

  static getGenerateRdfButton() {
    return this.getHeader().find('[appCypressData="generate-rdf-action"]');
  }

  static generateRdf() {
    return HeaderSteps.getGenerateRdfButton().click();
  }

  static getGenerateSparqlButton() {
    return this.getHeader().find('[appCypressData="generate-sparql-action"]');
  }

  static generateSparql() {
    return HeaderSteps.getGenerateSparqlButton().click();
  }
}

export default HeaderSteps;
