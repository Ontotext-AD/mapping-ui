import MappingSteps from '../steps/mapping-steps';
import EditDialogSteps from '../steps/edit-dialog-steps';
import PrepareSteps from '../steps/prepare-steps';

describe('Autocomplete mapping', () => {

  beforeEach(() => {
    PrepareSteps.prepareMoviesNamespacesAndColumns();
    PrepareSteps.enableAutocompleteWithEmptyResponse();
    PrepareSteps.stubEmptyMappingModel();
    PrepareSteps.visitPageAndWaitToLoad();
  });

  context('Autocomplete prefix IRI', () => {
    it('Should autocomplete prefix in the table', () => {
      MappingSteps.getTriples().should('have.length', 1);
      MappingSteps.completeTriple(0, 's', 'p', undefined);
      MappingSteps.type('w', () => MappingSteps.getTripleObjectValue(0));
      MappingSteps.getSuggestions().should('have.length', 5);
      MappingSteps.getSuggestions().first().should('contain', 'wgs:').then((option) => {
        cy.wrap(option).trigger('click');
      });
      MappingSteps.type('test', () => MappingSteps.getTripleObjectValue(0));
      MappingSteps.getTripleObjectValue(0).blur();
      MappingSteps.getTripleObjectPropertyTransformation(0).should('have.text', 'wgs:');
      MappingSteps.getTripleObjectSource(0).should('have.text', ' C  test ');
    });

    it('Should autocomplete column after prefix in the table', () => {
      MappingSteps.getTriples().should('have.length', 1);
      MappingSteps.completeTriple(0, 's', 'p', undefined);
      MappingSteps.type('rdf:@', () => MappingSteps.getTripleObjectValue(0));
      MappingSteps.getSuggestions().should('have.length', 28);
      MappingSteps.getSuggestions().first().should('contain', 'color').then((option) => {
        cy.wrap(option).trigger('click');
      });
      MappingSteps.getTripleObjectPropertyTransformation(0).should('have.text', 'rdf:');
      MappingSteps.getTripleObjectSource(0).should('have.text', ' @  color ');
      // When I type on the subject position an extended prefix plus column beginning
      MappingSteps.type('rdf:ext@du', () => MappingSteps.getTripleSubjectValue(1));
      MappingSteps.getSuggestions().should('have.length', 1);
      // And I select the column from the suggestion
      MappingSteps.getSuggestions().first().should('contain', 'duration').then((option) => {
        cy.wrap(option).trigger('click');
      });
      // Then I expect that the extended prefix is properly populated in the cell
      // And The column and type are properly set
      MappingSteps.getTripleSubjectPropertyTransformation(1).should('have.text', 'rdf:ext');
      MappingSteps.getTripleSubjectSource(1).should('have.text', ' @  duration ');
      MappingSteps.getTripleSubjectType(1).should('contain', 'IRI');
      // When I type on the object position an extended prefix plus beginning of a column
      MappingSteps.type('p', () => MappingSteps.getTriplePredicateValue(1));
      MappingSteps.type('rdf:ext@co', () => MappingSteps.getTripleObjectValue(1));
      // And I select the columns from the suggestion
      MappingSteps.getSuggestions().first().should('contain', 'color').then((option) => {
        cy.wrap(option).trigger('click');
      });
      // Then I expect that the prefix, column and tpe are properly populated in the cell
      MappingSteps.getTripleObjectPropertyTransformation(1).should('have.text', 'rdf:ext');
      MappingSteps.getTripleObjectSource(1).should('have.text', ' @  color ');
      MappingSteps.getTripleObjectType(1).should('contain', 'IRI');
    });

    it('Should show IRI description on hover', () => {
      MappingSteps.getTriples().should('have.length', 1);
      // I type a letter to show autocomplete
      MappingSteps.type('w', () => MappingSteps.getTripleSubjectValue(0));
      // Call POST again to load tooltips
      cy.route('POST', '/repositories/Movies', 'fixture:autocomplete/autocomplete-iri-description-response.json').as('loadDescr');
      // When I hover an autocomplete
      MappingSteps.getSuggestions().first().trigger('mouseover');
      // I expect tho see an IRI description
      MappingSteps.getTooltip().contains('IRI Description');
    });

    it('Should display prefix and value in autocomplete', () => {
      MappingSteps.editEmptyTripleSubject(0);
      EditDialogSteps.selectConstant();
      EditDialogSteps.getTransformationExpressionField().click();
      EditDialogSteps.getPrefixSuggestions().first().contains('rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>');
    });
  });
});

