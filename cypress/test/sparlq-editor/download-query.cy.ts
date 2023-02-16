import {join} from 'path';
import NotificationSteps from '../../steps/notification-steps';
import PrepareSteps from '../../steps/prepare-steps';
import SparqlEditorSteps from '../../steps/sparql-editor-steps';

describe('SPARQL Query Editor: Download Query', () => {
  const downloadsFolder = Cypress.config('downloadsFolder');

  beforeEach(() => {
    PrepareSteps.prepareRestaurantsNamespacesAndColumns();
    PrepareSteps.stubEmptyMappingModel();
    PrepareSteps.prepareEmptyEditorConfigurations();
  });

  it('Should download file with SPARQL that is placed in the current tab of the editor', () => {
    PrepareSteps.visitPageAndOpenSparqlEditor();

    // Open the download menu
    SparqlEditorSteps.clickDownload();

    // And select query
    SparqlEditorSteps.clickDownloadMenuOption('query');

    // Then the file should get the name of the active tab
    const file = join(downloadsFolder, 'Unnamed.sparql');

    // Then file download should be triggered
    cy.readFile(file, {timeout: 2000}).then((content) => {
      // And the file content should be same as the one in the editor tab
      cy.fixture('sparql-editor/download-default-sparql').then((expected: string) => {
        expect(content).to.equal(expected);
      });
    });
  });

  it('Should download file containing the SPARQL from the current tab with SERVICE clause', () => {
    cy.intercept('POST', '/rest/sparql-mapper/set-service', {
      fixture: 'sparql-editor/default-sparql-with-service',
    });

    PrepareSteps.visitPageAndOpenSparqlEditor();

    // Open the download menu
    SparqlEditorSteps.clickDownload();

    // And select query
    SparqlEditorSteps.clickDownloadMenuOption('query-with-service');

    // Then the file should get the name of the active tab
    const file = join(downloadsFolder, 'Unnamed.sparql');

    // Then file download should be triggered
    cy.readFile(file, {timeout: 2000}).then((content) => {
      // And the file content should be same as the one in the editor tab
      cy.fixture('sparql-editor/download-default-sparql-with-service').then((expected: string) => {
        expect(content).to.equal(expected);
      });
    });
  });

  it('Should show error message when there is an service error and the file should not be download', () => {
    cy.intercept('POST', '/rest/sparql-mapper/set-service', {
      statusCode: 500,
    });

    PrepareSteps.visitPageAndOpenSparqlEditor();

    // Renames the tab, otherwise the check for the file existence fails,
    // because the function detects the files from the previous tests
    const tabName = SparqlEditorSteps.setRandomTabName();

    // Open the download menu
    SparqlEditorSteps.clickDownload();

    // And select query
    SparqlEditorSteps.clickDownloadMenuOption('query-with-service');

    // Then error notification should be shown
    NotificationSteps.getErrorNotificationContent().then(($elem) => {
      expect($elem).to.contain('500 Internal Server Error');
    });

    // And a file download should not be triggered
    const file = join(downloadsFolder, `${tabName}.sparql`);
    cy.task('readFileOrNull', file).should('not.exist');
  });
});
