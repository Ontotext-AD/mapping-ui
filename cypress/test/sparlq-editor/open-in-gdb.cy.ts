import NotificationSteps from '../../steps/notification-steps';
import PrepareSteps from '../../steps/prepare-steps';
import SparqlEditorSteps from '../../steps/sparql-editor-steps';

describe('SPARQL Query Editor: Open in GraphDB', () => {
  beforeEach(() => {
    PrepareSteps.prepareRestaurantsNamespacesAndColumns();
    PrepareSteps.stubEmptyMappingModel();
    PrepareSteps.prepareEmptyEditorConfigurations();
  });

  it('Should open GraphDB workbench in new tab with the SPARQL from the active editor tab', () => {
    cy.intercept('POST', 'rest/sparql-mapper/prepare-gdb-request', {
      fixture: 'sparql-editor/open-in-gdb-response',
    });

    // stubs the opening of the new window tab
    const stub = cy.stub().as('tabOpen');
    cy.on('window:before:load', (win) => {
      cy.stub(win.parent, 'open').callsFake(stub);
    });

    // Given SPARQL editor is opened
    PrepareSteps.visitPageAndOpenSparqlEditor();

    // When the user clicks 'Open in GraphDB' button
    SparqlEditorSteps.clickOpenInGraphDB();

    // Then new tab should be opened
    cy.get('@tabOpen').should('have.been.calledOnce').then((tabSpy: any) => {
      // And the url lead to GraphDB Workbench
      expect(tabSpy.getCall(0).args[0]).to.include('http://localhost:7200/sparql?query');
    });
  });

  it('Should show error message and not open GraphDB workbench in new tab in case of server error', () => {
    cy.intercept('POST', 'rest/sparql-mapper/prepare-gdb-request', {
      statusCode: 500,
    });

    // Given SPARQL editor is opened
    PrepareSteps.visitPageAndOpenSparqlEditor();

    // When the user clicks 'Open in GraphDB' button
    SparqlEditorSteps.clickOpenInGraphDB();

    // Then error notification is shown
    NotificationSteps.getErrorNotificationContent().contains('500 Internal Server Error');

    // And no new tab was opened
    cy.url().should('equal', 'http://localhost:4200/?dataProviderID=ontorefine:123');
  });
});
