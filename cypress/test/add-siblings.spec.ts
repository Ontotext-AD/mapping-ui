import PrepareSteps from "../steps/prepare-steps";
import MappingSteps from "../steps/mapping-steps";

describe('Add siblings', () => {

  beforeEach(() => {
    PrepareSteps.prepareMoviesNamespacesAndColumns();
    cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:add-siblings/mapping-model.json');
    // Given I have created a mapping with multiple nested triples
    // When I load the mapping
    cy.visit('?dataProviderID=ontorefine:123');
    // Then I expect to see 7 triples (+1 empty template)
    MappingSteps.getTriples().should('have.length', 7);  });

  it('Should add subject sibling in the end of table', () => {
    MappingSteps.addTripleSubjectSibling(0);
    // Should insert a new triple after all existing ones
    MappingSteps.getTriples().should('have.length', 8);
    // The focus should be on the subject position of the new triple
    MappingSteps.getTripleSubject(6).find('input').should('have.focus')
  });

  it('Should add predicate sibling after all types and predicates and after nested triples of these predicates', () => {
    MappingSteps.addTriplePredicateSibling(0);
    // Should insert a new triple after all existing ones
    MappingSteps.getTriples().should('have.length', 8);
    // The focus should be on the subject position of the new triple
    MappingSteps.getTriplePredicate(6).find('input').should('have.focus')
  });

  it('Should add type object sibling after all object children', () => {
    MappingSteps.addTripleObjectSibling(0);
    // Should insert a new triple after all existing ones
    MappingSteps.getTriples().should('have.length', 8);
    // The focus should be on the subject position of the new triple
    MappingSteps.getTripleObject(2).find('input').should('have.focus')
  });

  it('Should add object sibling after all object children with nested triples', () => {
    MappingSteps.addTripleObjectSibling(3);
    // Should insert a new triple after all existing ones
    MappingSteps.getTriples().should('have.length', 8);
    // The focus should be on the subject position of the new triple
    MappingSteps.getTripleObject(6).find('input').should('have.focus')

  });

  it('Should add predicate from the last template triple to the last predicate on root level', () => {
    MappingSteps.completeTriple(6, undefined, 'predicate', 'object');
    MappingSteps.getTriple(6).should('have.class', 'level-0');
    MappingSteps.getTripleSubjectContent(6).should('be.empty');
  });

  it('Should add object from the last template triple to the last predicate on root level', () => {
    MappingSteps.completeTriple(6, undefined, undefined, 'object');
    MappingSteps.getTriple(6).should('have.class', 'level-0');
    MappingSteps.getTripleSubjectContent(6).should('be.empty');
    MappingSteps.getTriplePredicateContent(6).should('be.empty');
  });


});
