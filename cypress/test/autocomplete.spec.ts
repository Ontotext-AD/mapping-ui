import MappingSteps from '../steps/mapping-steps';
import EditDialogSteps from '../steps/edit-dialog-steps';
import PrepareSteps from '../steps/prepare-steps';
import {MapperComponentSelectors} from '../utils/selectors/mapper-component.selectors';

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
      MappingSteps.completeTriple(0, 's', 'p');
      MappingSteps.getAutocompleteHint().should('not.be.visible')
      MappingSteps.type('w', () => MappingSteps.getTripleObjectValue(0));
      MappingSteps.getAutocompleteHint().should('be.visible').and('contain', 'Hint: \"ab c\" matches \"abC*\", \"ab c*\" and \"ab-c*\"');
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
      MappingSteps.completeTriple(0, 's', 'p');
      MappingSteps.getAutocompleteHint().should('not.be.visible')
      MappingSteps.type('rdf:@', () => MappingSteps.getTripleObjectValue(0));
      MappingSteps.getAutocompleteHint().should('be.visible').and('contain', 'Hint: \"ab c\" matches \"abC*\", \"ab c*\" and \"ab-c*\"');
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
      MappingSteps.getAutocompleteHint().should('not.be.visible')
      // I type a letter to show autocomplete
      MappingSteps.type('w', () => MappingSteps.getTripleSubjectValue(0));
      MappingSteps.getAutocompleteHint().should('be.visible').and('contain', 'Hint: \"ab c\" matches \"abC*\", \"ab c*\" and \"ab-c*\"');
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
      EditDialogSteps.getPrefixSuggestions().contains('rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>');
    });

    it('Should not allow entering a new line in text areas', () => {
      MappingSteps.completeTriple(0, 'subject', 'predicate');

      MappingSteps.editEmptyTripleObject(0);
      EditDialogSteps.selectColumn();
      EditDialogSteps.getColumnField().click();
      // When I try to press {enter} in text area, new line should not be added
      EditDialogSteps.assertNewLineNotAddedToField(EditDialogSteps.getColumnField());
      // When 'col' is typed in textarea
      MappingSteps.type('col', () => EditDialogSteps.getColumnField());
      // There should be suggestion dropdown
      // And should contain 'color' as first option
      EditDialogSteps.getColumnSuggestions().first().contains('color');
      // When no option is selected and {enter} is pressed
      MappingSteps.type('{enter}', () => EditDialogSteps.getColumnField());
      // Text in textarea should not be autocompleted
      EditDialogSteps.getColumnField().should('have.value', 'col');

      EditDialogSteps.selectConstant();
      EditDialogSteps.assertNewLineNotAddedToField(EditDialogSteps.getConstantField());
      EditDialogSteps.selectGREL();
      EditDialogSteps.assertNewLineNotAddedToField(EditDialogSteps.getTransformationExpressionField());

      EditDialogSteps.selectTypeDataTypeLiteral();
      EditDialogSteps.selectDataTypeColumn();
      EditDialogSteps.assertNewLineNotAddedToField(cy.cypressData(MapperComponentSelectors.DATATYPE_COLUMN_INPUT));
      EditDialogSteps.selectDataTypeConstant();
      EditDialogSteps.assertNewLineNotAddedToField(cy.cypressData(MapperComponentSelectors.DATATYPE_CONSTANT_INPUT));
      EditDialogSteps.selectDataTypeGREL();
      EditDialogSteps.assertNewLineNotAddedToField(cy.cypressData(MapperComponentSelectors.DATATYPE_TRANSFORMATION_EXPRESSION));

      EditDialogSteps.selectTypeLanguageLiteral();
      EditDialogSteps.selectLanguageColumn();
      EditDialogSteps.assertNewLineNotAddedToField(cy.cypressData(MapperComponentSelectors.LANGUAGE_COLUMN_INPUT));
      EditDialogSteps.selectLanguageConstant();
      EditDialogSteps.assertNewLineNotAddedToField(cy.cypressData(MapperComponentSelectors.LANGUAGE_CONSTANT_INPUT));
      EditDialogSteps.selectLanguageGREL();
      EditDialogSteps.assertNewLineNotAddedToField(cy.cypressData(MapperComponentSelectors.LANGUAGE_TRANSFORMATION_EXPRESSION));
    });
  });
});

