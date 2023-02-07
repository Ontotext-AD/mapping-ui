import PrepareSteps from "../../steps/prepare-steps";
import SparqlEditorSteps from "../../steps/sparql-editor-steps";

// NOTE: would not work from columns which name is shortened
function clickAndCheck(index: number): void {
  let columnName = '';
  SparqlEditorSteps.getColumnNameElementAt(index).then(($elem) => {
    columnName = $elem.text().trim();
    $elem.click();
  });

  SparqlEditorSteps.getActiveTabContent().then((query) => {
    expect(query).to.contain(`BIND(?c_${columnName} as ?${columnName})`);
  });
}

describe('SPARQL Query Editor: Bindings from Dataset Columns', () => {

  beforeEach(() => {
    PrepareSteps.prepareRestaurantsNamespacesAndColumns();
    PrepareSteps.stubEmptyMappingModel();
    PrepareSteps.prepareEmptyEditorConfigurations();
  });

  it('Should generate binding when column name is selected from sources component', () => {

    // Given the editor is opens
    PrepareSteps.visitPageAndOpenSparqlEditor();

    // And the active tab contains default query
    cy.fixture('sparql-editor/default-sparql').then((expected) => {
      SparqlEditorSteps.getActiveTabContent().then((query) => {
        expect(expected).to.equal(query);
      });
    });

    // When the column names are clicked
    // Then the binding are inserted in the editor

    // BIND(?c_Trcid as ?Trcid)
    clickAndCheck(0);

    // BIND(?c_Title as ?Title)
    clickAndCheck(1);

    // BIND(?c_Longdescription as ?Longdescription)
    clickAndCheck(3);
  });

  it('Should generate binding when column name is selected for query with SERVICE clause', () => {

    // Given the editor is opens
    PrepareSteps.visitPageAndOpenSparqlEditor();

    // And the active tab contains default query with service
    cy.fixture('sparql-editor/default-sparql-with-service').then((query) => {
      SparqlEditorSteps.setActiveTabContent(query);
    });

    // (Known issue which will/should be addressed at some point)
    // Replacing or changing the text in the editor does not trigger update of the editor
    // configuration in the browser store

    // forces the editor configuration be updated in the browser store
    SparqlEditorSteps.renameActiveTab('sparql-with-service');

    // When the column names are clicked
    // Then the binding are inserted in the editor

    // BIND(?c_Trcid as ?Trcid)
    clickAndCheck(0);

    // BIND(?c_Title as ?Title)
    clickAndCheck(1);

    // BIND(?c_Longdescription as ?Longdescription)
    clickAndCheck(3);
  });
});
