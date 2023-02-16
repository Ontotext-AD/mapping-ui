import {SparqlEditorComponentSelectors} from '../utils/selectors/sparql-editor-component.selectors';

const BE_VISIBLE = 'be.visible';

export type QueryOption = 'standard' | 'standard-with-service' | 'mapping-based' | 'mapping-based-with-service';
export type DownloadOption = 'query' | 'query-with-service' | 'result';

/**
 * Contains steps related to SPARQL Query Editor component.
 *
 * @author A. Kunchev
 */
export default class SparqlEditorSteps {
  static getEditorHostElement(): Cypress.Chainable {
    return cy.get(SparqlEditorComponentSelectors.YASGUI_HOST);
  }

  static clickSave(): void {
    cy.get(SparqlEditorComponentSelectors.SAVE_BTN).should(BE_VISIBLE).click();
  }

  static clickGenerateQuery(): void {
    cy.get(SparqlEditorComponentSelectors.GENERATE_QUERY_BTN).should(BE_VISIBLE).click();
    cy.get(SparqlEditorComponentSelectors.GENERATE_QUERY_MENU).should(BE_VISIBLE);
  }

  static clickQueryMenuOption(option: QueryOption): void {
    const selector = SparqlEditorSteps.getOptionSelector(option);
    cy.cypressData(selector).should(BE_VISIBLE).click();
  }

  static clickOpenInGraphDB(): void {
    cy.get(SparqlEditorComponentSelectors.OPEN_IN_GRAPHDB_BTN).should(BE_VISIBLE).click();
  }

  static clickDownload(): void {
    cy.get(SparqlEditorComponentSelectors.DOWNLOAD_BTN).should(BE_VISIBLE).click();
    cy.get(SparqlEditorComponentSelectors.DOWNLOAD_MENU).should(BE_VISIBLE);
  }

  static clickDownloadMenuOption(option: DownloadOption): void {
    const selector = SparqlEditorSteps.getOptionSelector(option);
    cy.cypressData(selector).should(BE_VISIBLE).click();
  }

  static getDownloadResultWarningElement(): Cypress.Chainable {
    return cy.get(`${SparqlEditorComponentSelectors.DOWNLOAD_MENU} .results-info-icon`);
  }

  static clickExecuteQuery(): void {
    cy.get(SparqlEditorComponentSelectors.EXECUTE_QUERY_BTN).should(BE_VISIBLE).click();
  }

  static addNewEditorTab(): void {
    cy.get(SparqlEditorComponentSelectors.YASGUI_ADD_TAB_BTN).should(BE_VISIBLE).click();
  }

  static getActiveTabContent(): Cypress.Chainable {
    return cy.get(SparqlEditorComponentSelectors.ACTIVE_CODE_MIRROR)
    // @ts-ignore
        .then(($cm) => $cm.get(0).CodeMirror.getValue());
  }

  static setActiveTabContent(content: string): void {
    cy.get(SparqlEditorComponentSelectors.ACTIVE_CODE_MIRROR)
    // @ts-ignore
        .then(($cm) => $cm.get(0).CodeMirror.setValue(content));
  }

  static getActiveTabElement(): Cypress.Chainable {
    return cy.get(`${SparqlEditorComponentSelectors.YASGUI} [role="tab"][aria-selected="true"]`);
  }

  static renameActiveTab(name: string): void {
    cy.get(`${SparqlEditorComponentSelectors.YASGUI} .tab.active`)
        .should(BE_VISIBLE)
        .dblclick()
        .type('{selectall}{backspace}')
        .type(`${name}{enter}`);
  }

  /**
  * Generates random string and sets it as name of the currently active tab of the SPARQL editor.
  *
  * @returns the randomly generated name that was set for the tab
  */
  static setRandomTabName(): string {
    const tabName = Math.random().toString(36).slice(2, 16);
    SparqlEditorSteps.renameActiveTab(tabName);
    return tabName;
  }

  static changeRenderMode(mode: 'standard' | 'editor-only' | 'results-only'): void {
    let selector = 'render-yasgui-action';
    if (mode === 'editor-only') {
      selector = 'render-yasqe-action';
    } else if (mode === 'results-only') {
      selector = 'render-yasr-action';
    }

    cy.cypressData(selector).should(BE_VISIBLE).click();
  }

  static changeOrientation(): void {
    cy.cypressData('change-orientation-action').should(BE_VISIBLE).click();
  }

  /**
   * Retrieves the column element from the sources component at specific position starting from 0
   * for the first element.
   *
   * The method ensures that the element is visible.
   *
   * @param index of the column element starting from 0 for the first
   * @returns chainable with the column element
   */
  static getColumnNameElementAt(index: number): Cypress.Chainable {
    return cy.get(SparqlEditorComponentSelectors.DATASET_COLUMNS_CONTAINER)
        .cypressData(`source-${index}`)
        .should(BE_VISIBLE);
  }

  private static getOptionSelector(option: QueryOption | DownloadOption): string {
    switch (option) {
      case 'standard':
        return 'generate-template-action';
      case 'standard-with-service':
        return 'generate-template-with-service-action';
      case 'mapping-based':
        return 'generate-from-mapping-action';
      case 'mapping-based-with-service':
        return 'generate-from-mapping-with-service-action';
      case 'query':
        return 'download-sparql-action';
      case 'query-with-service':
        return 'download-sparql-with-service-action';
      case 'result':
        return 'download-result-action';
      default:
        throw new Error('Unsupported option: ' + option);
    }
  }
}
