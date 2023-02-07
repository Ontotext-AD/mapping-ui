import NotificationSteps from "../../steps/notification-steps";
import PrepareSteps from "../../steps/prepare-steps";
import SparqlEditorSteps from "../../steps/sparql-editor-steps";
import { SparqlEditorComponentSelectors } from "../../utils/selectors/sparql-editor-component.selectors";

describe('SPARQL Query Editor: Editor Configuration', () => {

  beforeEach(() => {
    PrepareSteps.prepareRestaurantsNamespacesAndColumns();
    PrepareSteps.stubEmptyMappingModel();
  });

  context('Load Configuration', () => {

    it('Should use the default configurations when there are not any stored on the server', () => {

      // Given there are not configurations from the server
      PrepareSteps.prepareEmptyEditorConfigurations();

      // When the editor tab is opened
      PrepareSteps.visitPageAndOpenSparqlEditor();

      // Then the content of the active tab should be default query
      cy.fixture('sparql-editor/default-sparql').then((expected) => {
        SparqlEditorSteps.getActiveTabContent().then((query) => {
          expect(expected).to.be.equal(query);
        });
      });

      // And the tab should be have default naming
      SparqlEditorSteps.getActiveTabElement().contains('Unnamed');

      // And the results panel should not be visible
      cy.get(SparqlEditorComponentSelectors.YASR).should('not.be.visible');

      // And the 'save' button should be active
      cy.get(SparqlEditorComponentSelectors.SAVE_BTN).should('be.enabled');
    });

    it('Should use the configurations returned from the server', () => {

      // Given there are configurations from the server
      cy.intercept('GET', '/rest/sparql-mapper/editor-config?project=123', {
        fixture: 'sparql-editor/non-default-editor-configuration'
      });

      // When the editor tab is opened
      PrepareSteps.visitPageAndOpenSparqlEditor();

      // Then the content of the active tab should not be default query
      cy.fixture('sparql-editor/default-sparql').then((expected) => {
        SparqlEditorSteps.getActiveTabContent().then((query) => {
          expect(expected).not.to.equal(query);
        });
      });

      // And the tab should be have different than default naming
      SparqlEditorSteps.getActiveTabElement().contains('Generated 1');

      // And the results panel should be visible
      cy.get(SparqlEditorComponentSelectors.YASR).should('be.visible');

      // And the 'save' button should be active
      cy.get(SparqlEditorComponentSelectors.SAVE_BTN).should('be.disabled');
    });

    it('Should show an error notification when the server returns status 500', () => {

      // Given there are configurations from the server
      cy.intercept('GET', '/rest/sparql-mapper/editor-config?project=123', {
        statusCode: 500
      });

      // When the editor tab is opened
      PrepareSteps.visitPageAndOpenSparqlEditor();

      // Then notification should be shown for the server error
      NotificationSteps.getErrorNotificationContent().contains('500 Internal Server Error');

      // And the content of the active tab should be default query
      cy.fixture('sparql-editor/default-sparql').then((expected) => {
        SparqlEditorSteps.getActiveTabContent().then((query) => {
          expect(expected).to.be.equal(query);
        });
      });

      // And the tab should be have default naming
      SparqlEditorSteps.getActiveTabElement().contains('Unnamed');

      // And the results panel should not be visible
      cy.get(SparqlEditorComponentSelectors.YASR).should('not.be.visible');

      // And the 'save' button should be active
      cy.get(SparqlEditorComponentSelectors.SAVE_BTN).should('be.enabled');
    });
  });

  context('Save Configurations', () => {

    it('Should save successfully the editor configuration', () => {

      // returns OK for the save request
      cy.intercept('POST', '/rest/sparql-mapper/editor-config', {
        statusCode: 200
      });

      // Given there are not configurations from the server
      PrepareSteps.prepareEmptyEditorConfigurations();

      // When the editor tab is opened
      PrepareSteps.visitPageAndOpenSparqlEditor();
      
      // Then the save button should be enabled
      cy.get(SparqlEditorComponentSelectors.SAVE_BTN).should('be.enabled');

      // When the 'Save' button is clicked
      SparqlEditorSteps.clickSave();

      // Then notification for successful save should be shown
      NotificationSteps.getSuccessfulNotificationContent().contains('Current editor configuration was stored.');

      // And the 'Save' button should be disabled
      cy.get(SparqlEditorComponentSelectors.SAVE_BTN).should('be.disabled');
    });

    it('Should show notification when there is an server error during configuration saving', () => {

      // returns OK for the save request
      cy.intercept('POST', '/rest/sparql-mapper/editor-config', {
        statusCode: 500
      });

      // Given there are not configurations from the server
      PrepareSteps.prepareEmptyEditorConfigurations();

      // When the editor tab is opened
      PrepareSteps.visitPageAndOpenSparqlEditor();
      
      // Then the save button should be enabled
      cy.get(SparqlEditorComponentSelectors.SAVE_BTN).should('be.enabled');

      // When the 'Save' button is clicked
      SparqlEditorSteps.clickSave();

      // Then notification for successful save should be shown
      NotificationSteps.getErrorNotificationContent().contains('500 Internal Server Error');
    });
  });
});