import HeaderSteps from "../../../cypress/steps/header-steps";
import MappingSteps from "../../../cypress/steps/mapping-steps";
import EditDialogSteps from "../../../cypress/steps/edit-dialog-steps";

describe('Create Amsterdam restaurants mapping', () => {

  beforeEach(() => {
    cy.setCookie('com.ontotext.graphdb.repository4200', 'Restaurants');
    cy.route('GET', '/sockjs-node/info?t=*', 'fixture:info.json');
    cy.route('GET', '/assets/i18n/en.json', 'fixture:en.json');
    cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:amsterdam/columns.json').as('loadColumns');
    cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:amsterdam/amsterdam-model.json');
  });

  function mockPreview(response: string) {
    cy.route({
      method: 'POST',
      url: '/rest/rdf-mapper/grel/ontorefine:123?limit=10',
      status: 200,
      response,
      headers: {
        'Content-Type': 'application/json'
      }
    }).as('loadGrelPreview');
  }

  it('Should be able to create Amsterdam restaurants mapping', () => {
    mockPreview('[null]');
    // When I load application
    cy.visit('?dataProviderID=ontorefine:123');
    cy.wait('@loadColumns');

    // I create subject with GREL transformation
    MappingSteps.completeSubject(0, '@Trcid');
    MappingSteps.editTripleSubject(0);
    EditDialogSteps.selectGREL();
    EditDialogSteps.completeGREL('"https://data.amsterdam.nl/resource/restaurant/" + value');
    EditDialogSteps.saveConfiguration();

    // I create type predicate
    MappingSteps.completePredicate(0, 'a');

    // I create object with constant
    MappingSteps.completeObject(0, 'Restaurant');
    // I create subject with constant with prefix
    MappingSteps.completeObject(1, 'geo:Feature');
    // I create predicate with constant
    MappingSteps.completePredicate(2, 'name');
    // I create language literal object
    MappingSteps.editTripleObject(2);
    EditDialogSteps.selectTypeLanguageLiteral();
    EditDialogSteps.selectLanguageConstant();
    EditDialogSteps.completeLanguageConstant('nl');
    EditDialogSteps.selectColumn();
    EditDialogSteps.completeColumn('Title');
    EditDialogSteps.saveConfiguration();
    // I create object with column source
    MappingSteps.completeObject(3, '@TitleEN');
    // I create predicate with constant
    MappingSteps.completePredicate(4, 'description');
    // I create language literal object
    MappingSteps.editTripleObject(4);
    EditDialogSteps.selectTypeLanguageLiteral();
    EditDialogSteps.selectLanguageConstant();
    EditDialogSteps.completeLanguageConstant('nl');
    EditDialogSteps.selectColumn();
    EditDialogSteps.completeColumn('Shortdescription');
    EditDialogSteps.saveConfiguration();
    // I create object with column source
    MappingSteps.completeObject(5, '@ShortdescriptionEN');
    // I create predicate with constant with prefix
    MappingSteps.completePredicate(6, 'geo:hasGeometry');
    // I create object with column source and GREL transformation
    MappingSteps.editTripleObject(6);
    EditDialogSteps.selectIri();
    EditDialogSteps.selectColumn();
    EditDialogSteps.completeColumn('Trcid');
    EditDialogSteps.selectGREL();
    EditDialogSteps.completeGREL('"https://data.amsterdam.nl/resource/geometry/" + value');
    EditDialogSteps.saveConfiguration();
    // I create nested triple
    MappingSteps.addNestedTriple(6);
    // I create type predicate
    MappingSteps.completePredicate(7, 'a');
    // I create object with constant with prefix
    MappingSteps.completeObject(7, 'sf:Point');
    // I create predicate sibling with constant and prefix
    MappingSteps.addTriplePredicateSibling(7);
    MappingSteps.completePredicate(8, 'geo:asWKT');
    // I create datatype object with constant with prefix and row index source with GREL transformation
    MappingSteps.editTripleObject(8);
    EditDialogSteps.selectTypeDataTypeLiteral();
    EditDialogSteps.selectDataTypeConstant();
    EditDialogSteps.completeDataTypeConstant('wktLiteral');
    EditDialogSteps.selectDataTypePrefix();
    EditDialogSteps.completeDataTypePrefix('geo');
    EditDialogSteps.selectRowIndex();
    EditDialogSteps.selectGREL();
    EditDialogSteps.completeGREL('"<http://www.opengis.net/def/crs/OGC/1.3/CRS84> POINT (" +' +
      'cells["Longitude"].value.replace(",", ".") + " " +' +
      'cells["Latitude"].value.replace(",", ".") + ")"');
    EditDialogSteps.saveConfiguration();

    // THEN
    // I expect to have completed the Amsterdam mapping
    cy.fixture('amsterdam/amsterdam.json').then(json => {
      const amsterdamJson = JSON.stringify(json).replace(/(\r\n|\n|\r|\s)/gm, "");
      HeaderSteps.viewJSON();
      MappingSteps.getViewJSONDialog().then(mapping =>{
        const mappingJson = mapping.text().replace(/(\r\n|\n|\r|\s)/gm, "");
        expect(mappingJson).to.eq(amsterdamJson);
      });
    });
  });
});
