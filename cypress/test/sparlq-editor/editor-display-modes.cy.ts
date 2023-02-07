import PrepareSteps from "../../steps/prepare-steps";
import SparqlEditorSteps from "../../steps/sparql-editor-steps";
import { SparqlEditorComponentSelectors } from "../../utils/selectors/sparql-editor-component.selectors";

const BE_VISIBLE = 'be.visible';
const NOT_BE_VISIBLE = 'not.be.visible';

describe('SPARQL Query Editor: Display Modes', () => {

  beforeEach(() => {
    PrepareSteps.prepareRestaurantsNamespacesAndColumns();
    PrepareSteps.stubEmptyMappingModel();
    PrepareSteps.prepareEmptyEditorConfigurations();
  });

  it('Should switch to editor only mode', () => {

    // Given the SPARQL Query Editor is opened
    PrepareSteps.visitPageAndOpenSparqlEditor();

    // Forces the results panel to be rendered
    SparqlEditorSteps.clickExecuteQuery();

    // And the results panel is visible
    cy.get(SparqlEditorComponentSelectors.YASR).should(BE_VISIBLE);

    // And the editor is visible
    cy.get(SparqlEditorComponentSelectors.YASQE).should(BE_VISIBLE);

    // When the 'editor only' button is clicked
    SparqlEditorSteps.changeRenderMode('editor-only');

    // Then the results panel should be hidden
    cy.get(SparqlEditorComponentSelectors.YASR).should(NOT_BE_VISIBLE);

    // And the editor should remain visible
    cy.get(SparqlEditorComponentSelectors.YASQE).should(BE_VISIBLE);
  });

  it('Should switch to results only mode', () => {

    // Given the SPARQL Query Editor is opened
    PrepareSteps.visitPageAndOpenSparqlEditor();

    // Forces the results panel to be rendered
    SparqlEditorSteps.clickExecuteQuery();

    // And the results panel is visible
    cy.get(SparqlEditorComponentSelectors.YASR).should(BE_VISIBLE);

    // And the editor is visible
    cy.get(SparqlEditorComponentSelectors.YASQE).should(BE_VISIBLE);

    // When the 'results only' button is clicked
    SparqlEditorSteps.changeRenderMode('results-only');

    // Then the results panel should be visible
    cy.get(SparqlEditorComponentSelectors.YASR).should(BE_VISIBLE);

    // And the editor should be hidden
    cy.get(SparqlEditorComponentSelectors.YASQE).should(NOT_BE_VISIBLE);
  });

  it('Should switch to editor and results mode', () => {

    // Given the SPARQL Query Editor is opened
    PrepareSteps.visitPageAndOpenSparqlEditor();

    // Forces the results panel to be rendered
    SparqlEditorSteps.clickExecuteQuery();

    // And the results panel is visible
    cy.get(SparqlEditorComponentSelectors.YASR).should(BE_VISIBLE);

    // And the editor is visible
    cy.get(SparqlEditorComponentSelectors.YASQE).should(BE_VISIBLE);

    // And the 'results only' button is clicked
    SparqlEditorSteps.changeRenderMode('results-only');
    cy.get(SparqlEditorComponentSelectors.YASQE).should(NOT_BE_VISIBLE);

    // When the 'editor and results' button is clicked
    SparqlEditorSteps.changeRenderMode('standard');

    // Then the editor and results panels should be visible
    cy.get(SparqlEditorComponentSelectors.YASR).should(BE_VISIBLE);
    cy.get(SparqlEditorComponentSelectors.YASQE).should(BE_VISIBLE);
  });

  it('Should change the orientation of the editor', () => {

    // Given the SPARQL Query Editor is opened
    PrepareSteps.visitPageAndOpenSparqlEditor();

    // Forces the results panel to be rendered
    SparqlEditorSteps.clickExecuteQuery();

    // And the results panel is visible
    cy.get(SparqlEditorComponentSelectors.YASR).should(BE_VISIBLE);

    // And the editor is visible
    cy.get(SparqlEditorComponentSelectors.YASQE).should(BE_VISIBLE);

    // And to have default orientation
    SparqlEditorSteps.getEditorHostElement().should('have.class', 'orientation-vertical');

    // When the button for orientation is clicked
    SparqlEditorSteps.changeOrientation();

    // Then the editor should switch the orientation
    SparqlEditorSteps.getEditorHostElement().should('have.class', 'orientation-horizontal');

    // And the rendering mode should remain the same
    cy.get(SparqlEditorComponentSelectors.YASR).should(BE_VISIBLE);
    cy.get(SparqlEditorComponentSelectors.YASQE).should(BE_VISIBLE);
  });

  it('Should change the orientation of the editor and switch the rendering mode to default', () => {

    // Given the SPARQL Query Editor is opened
    PrepareSteps.visitPageAndOpenSparqlEditor();

    // Forces the results panel to be rendered
    SparqlEditorSteps.clickExecuteQuery();

    // And the results panel is visible
    cy.get(SparqlEditorComponentSelectors.YASR).should(BE_VISIBLE);

    // And the editor is visible
    cy.get(SparqlEditorComponentSelectors.YASQE).should(BE_VISIBLE);

    // And to have default orientation
    SparqlEditorSteps.getEditorHostElement().should('have.class', 'orientation-vertical');

    // When the 'editor only' button is clicked
    SparqlEditorSteps.changeRenderMode('editor-only');
    cy.get(SparqlEditorComponentSelectors.YASR).should(NOT_BE_VISIBLE);
    cy.get(SparqlEditorComponentSelectors.YASQE).should(BE_VISIBLE);

    // And the button for orientation is clicked
    SparqlEditorSteps.changeOrientation();

    // Then the orientation is changed
    SparqlEditorSteps.getEditorHostElement().should('have.class', 'orientation-horizontal');

    // And the rendering mode is switch to 'editor and results'
    cy.get(SparqlEditorComponentSelectors.YASR).should(BE_VISIBLE);
    cy.get(SparqlEditorComponentSelectors.YASQE).should(BE_VISIBLE);
  });
});
