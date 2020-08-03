import MappingSteps from '../steps/mapping-steps';
import HeaderSteps from '../steps/header-steps';
import EditDialogSteps from '../steps/edit-dialog-steps';

describe('Autocomplete mapping', () => {

  beforeEach(() => {
    cy.setCookie('com.ontotext.graphdb.repository4200', 'Movies');
    cy.route('GET', '/sockjs-node/info?t=*', 'fixture:info.json');
    cy.route('GET', '/assets/i18n/en.json', 'fixture:en.json');
    cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:empty-mapping-model.json');
    cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
    cy.route('POST', '/repositories/Movies', 'fixture:edit-mapping/autocomplete-response.json');
    cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json').as('loadColumns');
    cy.visit('?dataProviderID=ontorefine:123');
  });

  context('Autocomplete prefix IRI', () => {
    it('Should autocomplete prefix in the table', () => {
      MappingSteps.getTriples().should('have.length', 1);
      MappingSteps.completeTriple(0, 'subject', 'predicate', undefined);
      MappingSteps.type('w', MappingSteps.getTripleObjectValue(0));
      MappingSteps.getSuggestions(0).should('have.length', 5);
      MappingSteps.getSuggestions(0).first().should('contain', 'wgs:').click();
      MappingSteps.type('test', MappingSteps.getTripleObjectValue(0));
      MappingSteps.getTripleObjectValue(0).blur();
      MappingSteps.getTripleObjectPropertyTransformation(0).should('have.text', 'wgs');
      MappingSteps.getTripleObjectSource(0).should('have.text', ' C  test ');

    });

    it('Should autocomplete column after prefix in the table', () => {
      MappingSteps.getTriples().should('have.length', 1);
      MappingSteps.completeTriple(0, 'subject', 'predicate', undefined);
      MappingSteps.type('rdf:@', MappingSteps.getTripleObjectValue(0));
      MappingSteps.getSuggestions(0).should('have.length', 28);
      MappingSteps.getSuggestions(0).first().should('contain', 'color').click();
      MappingSteps.getTripleObjectPropertyTransformation(0).should('have.text', 'rdf');
      MappingSteps.getTripleObjectSource(0).should('have.text', ' @  color ');
    });
  });


});

