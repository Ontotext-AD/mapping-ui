import MappingSteps from '../steps/mapping-steps';
import {HeaderComponentSelectors} from '../utils/selectors/header-component.selectors';
import HeaderSteps from '../steps/header-steps';

describe('Nest triples', () => {

  beforeEach(() => {
    cy.setCookie('com.ontotext.graphdb.repository4200', 'Movies');
    cy.route('GET', '/sockjs-node/info?t=*', 'fixture:info.json');
    cy.route('GET', '/assets/i18n/en.json', 'fixture:en.json');
    cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
    cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json');
  });

  it('Should show error notification when model could not be loaded', () => {
    cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:nest-triples/mapping-model.json');
    // Given I have created a mapping with multiple nested triples
    // When I load the mapping
    cy.visit('?dataProviderID=ontorefine:123');
    // Then I expect to see 9 triples (+1 empty template)
    MappingSteps.getTriples().should('have.length', 10);
    // And I expect to have 2 root level triples and 3 levels of nesting under the first one
    MappingSteps.getTriple(0).should('have.class', 'level-0');
    // first nesting level
    MappingSteps.getTriple(1).should('have.class', 'level-1');
    MappingSteps.getTriple(2).should('have.class', 'level-1');
    MappingSteps.getTriple(3).should('have.class', 'level-1');
    // second nesting level
    MappingSteps.getTriple(4).should('have.class', 'level-2');
    MappingSteps.getTriple(5).should('have.class', 'level-2');
    // third nesting level
    MappingSteps.getTriple(6).should('have.class', 'level-3');
    MappingSteps.getTriple(7).should('have.class', 'level-3');
    // last triple is at root level
    MappingSteps.getTriple(8).should('have.class', 'level-0');
    // The template triple is at level-0
    MappingSteps.getTriple(0).should('have.class', 'level-0');
  });
});
