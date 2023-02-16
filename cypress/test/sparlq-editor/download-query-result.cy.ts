import {join} from 'path';
import NotificationSteps from '../../steps/notification-steps';
import PrepareSteps from '../../steps/prepare-steps';
import SparqlEditorSteps from '../../steps/sparql-editor-steps';

describe('SPARQL Query Editor: Download Query Results', () => {
  const downloadsFolder = Cypress.config('downloadsFolder');

  beforeEach(() => {
    PrepareSteps.prepareRestaurantsNamespacesAndColumns();
    PrepareSteps.stubEmptyMappingModel();
    PrepareSteps.prepareEmptyEditorConfigurations();
  });

  it('Should download file with RDF results when there is correct CONSTRUCT query', () => {
    cy.intercept('POST', 'repositories/ontorefine:123', {
      fixture: 'sparql-editor/download-query-results.ttl',
    });

    PrepareSteps.visitPageAndOpenSparqlEditor();

    // Rename the default tab
    const tabName = SparqlEditorSteps.setRandomTabName();

    // Set CONSTRUCT SPARQL query
    cy.fixture('sparql-editor/simple-construct.sparql').then((query: string) => {
      SparqlEditorSteps.setActiveTabContent(query);
    });

    // Open the download menu
    SparqlEditorSteps.clickDownload();

    // Then the warning icon should not be visible
    SparqlEditorSteps.getDownloadResultWarningElement().should('not.exist');

    // When download results is selected
    SparqlEditorSteps.clickDownloadMenuOption('result');

    // Then the file should get the name of the active tab
    const file = join(downloadsFolder, `${tabName}.ttl`);

    // Then file download should be triggered
    cy.readFile(file, {timeout: 2000}).then((content) => {
      // And the file content should be
      cy.fixture('sparql-editor/download-query-results.ttl').then((expected: string) => {
        expect(content).to.equal(expected);
      });
    });
  });

  it('Should show warning message when the editor contains SELECT query', () => {
    PrepareSteps.visitPageAndOpenSparqlEditor();

    // Rename the default tab
    const tabName = SparqlEditorSteps.setRandomTabName();

    // Open the download menu
    SparqlEditorSteps.clickDownload();

    // Then the warning icon should be visible
    SparqlEditorSteps.getDownloadResultWarningElement().should('exist');

    // When download results is selected
    SparqlEditorSteps.clickDownloadMenuOption('result');

    NotificationSteps.getWarnNotificationContent()
        .contains('Download of the results is available only for CONSTRUCT queries.');

    // Then the file should get the name of the active tab
    const file = join(downloadsFolder, `${tabName}.ttl`);

    // Then file download should be triggered
    cy.task('readFileOrNull', file).should('not.exist');
  });

  it('Should show warning message when the editor is empty and download results is pressed', () => {
    PrepareSteps.visitPageAndOpenSparqlEditor();

    // Rename the default tab
    const tabName = SparqlEditorSteps.setRandomTabName();

    // Reset editor content
    SparqlEditorSteps.setActiveTabContent('');

    // Open the download menu
    SparqlEditorSteps.clickDownload();

    // Then the warning icon should be visible
    SparqlEditorSteps.getDownloadResultWarningElement().should('exist');

    // When download results is selected
    SparqlEditorSteps.clickDownloadMenuOption('result');

    NotificationSteps.getWarnNotificationContent()
        .contains('Download of the results is available only for CONSTRUCT queries.');

    // Then the file should get the name of the active tab
    const file = join(downloadsFolder, `${tabName}.ttl`);

    // Then file download should be triggered
    cy.task('readFileOrNull', file).should('not.exist');
  });

  it('Should show error message when there is an error while executing the query on the server', () => {
    cy.intercept('POST', 'repositories/ontorefine:123', {
      statusCode: 500,
    });

    PrepareSteps.visitPageAndOpenSparqlEditor();

    // Rename the default tab
    const tabName = SparqlEditorSteps.setRandomTabName();

    // Set CONSTRUCT SPARQL query
    cy.fixture('sparql-editor/simple-construct.sparql').then((query: string) => {
      SparqlEditorSteps.setActiveTabContent(query);
    });

    // Open the download menu
    SparqlEditorSteps.clickDownload();

    // Then the warning icon should not be visible
    SparqlEditorSteps.getDownloadResultWarningElement().should('not.exist');

    // When download results is selected
    SparqlEditorSteps.clickDownloadMenuOption('result');

    // Then error notification should be shown
    NotificationSteps.getErrorNotificationContent().then(($elem) => {
      expect($elem).to.contain('500 Internal Server Error');
    });

    // And a file download should not be triggered
    const file = join(downloadsFolder, `${tabName}.ttl`);
    cy.task('readFileOrNull', file).should('not.exist');
  });
});
