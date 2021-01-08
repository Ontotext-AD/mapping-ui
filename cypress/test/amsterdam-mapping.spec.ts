import HeaderSteps from '../../cypress/steps/header-steps';
import MappingSteps from '../../cypress/steps/mapping-steps';
import EditDialogSteps from '../../cypress/steps/edit-dialog-steps';
import PrepareSteps from '../steps/prepare-steps';

describe('Create Amsterdam restaurants mapping', () => {

  beforeEach(() => {
    PrepareSteps.prepareRestaurantsNamespacesAndColumns();
    PrepareSteps.enableAutocompleteWithEmptyResponse();
    cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:amsterdam/amsterdam-model.json').as('loadProject');
    cy.route('GET', '/rest/repositories/Restaurants', 'fixture:amsterdam/repository-configuration.json').as('loadRepo');
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
    PrepareSteps.visitPageAndWaitToLoad();

    // I create subject with GREL transformation
    MappingSteps.editEmptyTripleSubject(0);
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
    MappingSteps.editEmptyTripleObject(2);
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
    MappingSteps.editEmptyTripleObject(4);
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
    MappingSteps.editEmptyTripleObject(6);
    EditDialogSteps.selectIri();
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
    MappingSteps.editEmptyTripleObject(8);
    EditDialogSteps.selectTypeDataTypeLiteral();
    EditDialogSteps.selectDataTypeConstant();
    EditDialogSteps.completeDataTypeConstant('wktLiteral');
    EditDialogSteps.completeDataTypePrefix('geo');
    EditDialogSteps.selectRowIndex();
    EditDialogSteps.selectGREL();
    EditDialogSteps.completeGREL('"<http://www.opengis.net/def/crs/OGC/1.3/CRS84> POINT (" +' +
      'cells["Longitude"].value.replace(",", ".") + " " +' +
      'cells["Latitude"].value.replace(",", ".") + ")"');
    EditDialogSteps.saveConfiguration();

    MappingSteps.completePredicate(9, 'valuenode');
    // I add a value bnode with source column
    MappingSteps.editEmptyTripleObject(9);
    EditDialogSteps.selectValueBnode();
    EditDialogSteps.selectColumn();
    EditDialogSteps.completeColumn('Trcid');
    EditDialogSteps.saveConfiguration();

    // I create nested triple
    MappingSteps.addNestedTriple(9);
    MappingSteps.completePredicate(10, 'longdescription');
    // I add a value bnode with source column
    MappingSteps.editEmptyTripleObject(10);
    EditDialogSteps.selectLiteral();
    EditDialogSteps.selectColumn();
    EditDialogSteps.completeColumn('Longdescription');
    EditDialogSteps.saveConfiguration();

    // I create nested triple
    MappingSteps.addNestedTriple(9);
    MappingSteps.completePredicate(11, 'uniquenode');
    // I add a value bnode with source column
    MappingSteps.editEmptyTripleObject(11);
    EditDialogSteps.selectUniqueBnode();
    EditDialogSteps.selectColumn();
    EditDialogSteps.completeColumn('Media');
    EditDialogSteps.saveConfiguration();

    MappingSteps.addNestedTriple(11);
    MappingSteps.completePredicate(12, 'city');
    // I add a value bnode with source column
    MappingSteps.editEmptyTripleObject(12);
    EditDialogSteps.selectLiteral();
    EditDialogSteps.selectColumn();
    EditDialogSteps.completeColumn('City');
    EditDialogSteps.saveConfiguration();

    // THEN
    // I expect to have completed the Amsterdam mappings
    cy.fixture('amsterdam/amsterdam.json').then(amsterdamJson => {
      HeaderSteps.getJSON().should('deep.equal', amsterdamJson);
    });
  });
});
