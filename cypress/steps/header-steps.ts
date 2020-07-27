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

  static getViewJSONButton() {
    return this.getHeader().find('[appCypressData="view-json-action"]');
  }

  static viewJSON() {
    return HeaderSteps.getViewJSONButton().click();
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
