import {MapperComponentSelectors} from '../utils/selectors/mapper-component.selectors';
import MappingSteps from '../steps/mapping-steps';
import EditDialogSteps from '../steps/edit-dialog-steps';
import PrepareSteps from '../steps/prepare-steps';

describe('MapperDialog', () => {
  beforeEach(() => {
    PrepareSteps.prepareMoviesNamespacesAndColumns();
  });

  xit('should render mapping dialog when drag and drop source', () => {
    cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:delete/mapping-model.json').as('loadProject');
    PrepareSteps.visitPageAndWaitToLoad();

    // WHEN:
    // I drag and drop the first source in the subject holder
    cy.cypressData(MapperComponentSelectors.FIRST_SOURCE_SELECTOR).trigger('mousedown', {button: 0});
    cy.cypressData(MapperComponentSelectors.SUBJECT_SELECTOR + '-2')
      .trigger('mousemove')
      .click()
      .trigger(('mouseup'));

    // THEN:
    // I see popup dialog
    cy.cypressData(MapperComponentSelectors.MAPPER_DIALOG_TITLE_SELECTOR).should('be.visible');
  });

  xit('should render mapping dialog on subject edit button click', () => {
    cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:delete/mapping-model.json').as('loadProject');
    PrepareSteps.visitPageAndWaitToLoad();

    // WHEN:
    // I click on edit button of the empty triple's subject
    cy.cypressData(MapperComponentSelectors.SUBJECT_SELECTOR + '-2').cypressFind(MapperComponentSelectors.BUTTON_EDIT_EMPTY_CELL).click();

    // THEN:
    // I see popup dialog
    cy.cypressData(MapperComponentSelectors.MAPPER_DIALOG_TITLE_SELECTOR)
      .should('be.visible')
      .contains('Subject RDF Value Mapping');
    cy.cypressData(MapperComponentSelectors.COLUMN).should('be.visible');
    cy.cypressData(MapperComponentSelectors.CONSTANT).should('be.visible');
    cy.cypressData(MapperComponentSelectors.RECORD_ID).should('be.visible');
    cy.cypressData(MapperComponentSelectors.ROW_INDEX).should('be.visible');
    cy.cypressData(MapperComponentSelectors.TRANSFORMATION_GREL).should('be.visible').click();
    cy.cypressData(MapperComponentSelectors.TRANSFORMATION_EXPRESSION).should('be.visible');

    // OK button is disabled
    cy.cypressData(MapperComponentSelectors.OK_MAPPING_BUTTON_SELECTOR)
      .should('be.visible')
      .should('be.enabled');
  });

  it('should render mapping dialog and create triple', () => {
    // stub model
    cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:delete/mapping-model.json').as('loadProject');
    PrepareSteps.visitPageAndWaitToLoad();

    // WHEN:
    // I click on edit button of the empty triple's subject
    cy.cypressData(MapperComponentSelectors.SUBJECT_SELECTOR + '-2').cypressFind(MapperComponentSelectors.BUTTON_EDIT_EMPTY_CELL).click();

    // THEN:
    // I see popup dialog
    cy.cypressData(MapperComponentSelectors.MAPPER_DIALOG_TITLE_SELECTOR)
      .should('be.visible')
      .contains('Subject RDF Value Mapping');

    // WHEN:
    // I choose column, fill column name and press OK button
    cy.cypressData(MapperComponentSelectors.COLUMN).click();
    cy.cypressData(MapperComponentSelectors.COLUMN_INPUT).should('be.visible').type('director_name');
    cy.cypressData(MapperComponentSelectors.OK_MAPPING_BUTTON_SELECTOR).click();

    // THEN:
    // I see subject created
    cy.cypressData(MapperComponentSelectors.MAPPER_DIALOG_TITLE_SELECTOR).should('not.be.visible');
    cy.cypressData(MapperComponentSelectors.SUBJECT_SELECTOR + '-2').contains('director_name');
    cy.cypressData(MapperComponentSelectors.SUBJECT_SELECTOR + '-3').should('not.be.visible');

    // WHEN:
    // I click on edit button of the empty triple's predicate
    cy.cypressData(MapperComponentSelectors.PREDICATE_SELECTOR + '-2').cypressFind(MapperComponentSelectors.BUTTON_EDIT_EMPTY_CELL).should('be.visible').click();

    // THEN:
    // I see popup dialog
    cy.cypressData(MapperComponentSelectors.COLUMN).should('be.visible');
    cy.cypressData(MapperComponentSelectors.CONSTANT).should('be.visible');
    cy.cypressData(MapperComponentSelectors.RECORD_ID).should('be.visible');
    cy.cypressData(MapperComponentSelectors.ROW_INDEX).should('be.visible');
    cy.cypressData(MapperComponentSelectors.TRANSFORMATION_GREL).should('be.visible').click();
    cy.cypressData(MapperComponentSelectors.TRANSFORMATION_EXPRESSION).should('be.visible');

    // WHEN:
    // I choose column, fill column name and press OK button
    cy.cypressData(MapperComponentSelectors.CONSTANT).click();
    cy.cypressData(MapperComponentSelectors.CONSTANT_INPUT).should('be.visible').type('constant123');
    cy.cypressData(MapperComponentSelectors.OK_MAPPING_BUTTON_SELECTOR).click();

    // THEN:
    // I see predicate created
    cy.cypressData(MapperComponentSelectors.MAPPER_DIALOG_TITLE_SELECTOR).should('not.be.visible');
    cy.cypressData(MapperComponentSelectors.PREDICATE_SELECTOR + '-2').contains('constant123');
    cy.cypressData(MapperComponentSelectors.OBJECT_SELECTOR + '-3').should('not.be.visible');

    // WHEN:
    // I click on edit button of the empty triple's object
    cy.cypressData(MapperComponentSelectors.OBJECT_SELECTOR + '-2').cypressFind(MapperComponentSelectors.BUTTON_EDIT_EMPTY_CELL).should('be.visible').click();

    // THEN:
    // I see popup dialog
    cy.cypressData(MapperComponentSelectors.TYPE_IRI).should('be.visible');
    cy.cypressData(MapperComponentSelectors.TYPE_LITERAL).should('be.visible');
    cy.cypressData(MapperComponentSelectors.TYPE_UNIQUE_BNODE).should('be.visible');
    cy.cypressData(MapperComponentSelectors.TYPE_VALUE_BNODE).should('be.visible');
    cy.cypressData(MapperComponentSelectors.COLUMN).should('be.visible');
    cy.cypressData(MapperComponentSelectors.CONSTANT).should('be.visible');
    cy.cypressData(MapperComponentSelectors.RECORD_ID).should('be.visible');
    cy.cypressData(MapperComponentSelectors.ROW_INDEX).should('be.visible');
    // When a type is not selected, only GREL transformation is present
    cy.cypressData(MapperComponentSelectors.TRANSFORMATION_PREFIX).should('not.be.visible');
    cy.cypressData(MapperComponentSelectors.TRANSFORMATION_RAW_IRI).should('not.be.visible');
    cy.cypressData(MapperComponentSelectors.TRANSFORMATION_GREL).should('be.visible').click();
    cy.cypressData(MapperComponentSelectors.TRANSFORMATION_EXPRESSION).should('be.visible');

    // I see required fields
    cy.cypressData(MapperComponentSelectors.TYPE_ERROR).should('be.visible');

    // WHEN:
    // I click on DatatypeLiteral
    cy.cypressData(MapperComponentSelectors.TYPE_LITERAL).click();
    cy.cypressData(MapperComponentSelectors.TYPE_DATATYPE_LITERAL).click();

    // THEN:
    // I see Datatype fields appear
    cy.cypressData(MapperComponentSelectors.DATATYPE_COLUMN).should('be.visible');
    cy.cypressData(MapperComponentSelectors.DATATYPE_CONSTANT).should('be.visible');
    // Datatype transformations: prefix and grel should be present
    cy.cypressData(MapperComponentSelectors.DATATYPE_TRANSFORMATION_GREL).should('be.visible').click();
    cy.cypressData(MapperComponentSelectors.DATATYPE_TRANSFORMATION_EXPRESSION).should('be.visible');
    cy.cypressData(MapperComponentSelectors.TRANSFORMATION_PREFIX).should('not.be.visible');
    cy.cypressData(MapperComponentSelectors.TRANSFORMATION_RAW_IRI).should('not.be.visible');
    cy.cypressData(MapperComponentSelectors.TRANSFORMATION_GREL).should('be.visible');

    // WHEN:
    // I click on LanguageLiteral
    cy.cypressData(MapperComponentSelectors.TYPE_LANGUAGE_LITERAL).click();

    // THEN:
    // I see LanguageLiteral fields appear
    cy.cypressData(MapperComponentSelectors.LANGUAGE_COLUMN).should('be.visible');
    cy.cypressData(MapperComponentSelectors.LANGUAGE_CONSTANT).should('be.visible');
    // Language transformations: grel should be present
    cy.cypressData(MapperComponentSelectors.LANGUAGE_TRANSFORMATION_PREFIX).should('not.be.visible');
    cy.cypressData(MapperComponentSelectors.LANGUAGE_TRANSFORMATION_GREL).should('be.visible').click();
    cy.cypressData(MapperComponentSelectors.LANGUAGE_TRANSFORMATION_EXPRESSION).should('be.visible');
    cy.cypressData(MapperComponentSelectors.TRANSFORMATION_PREFIX).should('not.be.visible');
    cy.cypressData(MapperComponentSelectors.TRANSFORMATION_RAW_IRI).should('not.be.visible');
    cy.cypressData(MapperComponentSelectors.TRANSFORMATION_GREL).should('be.visible');

    // WHEN:
    // I click on IRI
    cy.cypressData(MapperComponentSelectors.TYPE_IRI).click();

    // THEN:
    // I can not see LanguageLiteral fields nor DatatypeLiteral fields
    cy.cypressData(MapperComponentSelectors.LANGUAGE_COLUMN).should('not.be.visible');
    cy.cypressData(MapperComponentSelectors.LANGUAGE_CONSTANT).should('not.be.visible');
    cy.cypressData(MapperComponentSelectors.LANGUAGE_RECORD_ID).should('not.be.visible');
    cy.cypressData(MapperComponentSelectors.LANGUAGE_ROW_INDEX).should('not.be.visible');
    cy.cypressData(MapperComponentSelectors.LANGUAGE_TRANSFORMATION_PREFIX).should('not.be.visible');
    cy.cypressData(MapperComponentSelectors.LANGUAGE_TRANSFORMATION_GREL).should('not.be.visible');
    cy.cypressData(MapperComponentSelectors.LANGUAGE_TRANSFORMATION_EXPRESSION).should('not.be.visible');
    cy.cypressData(MapperComponentSelectors.LANGUAGE_SOURCE_ERROR).should('not.be.visible');
    cy.cypressData(MapperComponentSelectors.DATATYPE_COLUMN).should('not.be.visible');
    cy.cypressData(MapperComponentSelectors.DATATYPE_CONSTANT).should('not.be.visible');
    cy.cypressData(MapperComponentSelectors.DATATYPE_RECORD_ID).should('not.be.visible');
    cy.cypressData(MapperComponentSelectors.DATATYPE_ROW_INDEX).should('not.be.visible');
    cy.cypressData(MapperComponentSelectors.DATATYPE_TRANSFORMATION_PREFIX).should('not.be.visible');
    cy.cypressData(MapperComponentSelectors.DATATYPE_TRANSFORMATION_GREL).should('not.be.visible');
    cy.cypressData(MapperComponentSelectors.DATATYPE_TRANSFORMATION_EXPRESSION).should('not.be.visible');
    cy.cypressData(MapperComponentSelectors.DATATYPE_SOURCE_ERROR).should('not.be.visible');
    cy.cypressData(MapperComponentSelectors.TRANSFORMATION_GREL).should('be.visible');

    // WHEN:
    // I click on RecordId and click OK button
    cy.cypressData(MapperComponentSelectors.RECORD_ID).click();
    cy.cypressData(MapperComponentSelectors.OK_MAPPING_BUTTON_SELECTOR).click();

    // THEN:
    // I see object created
    cy.cypressData(MapperComponentSelectors.MAPPER_DIALOG_TITLE_SELECTOR).should('not.be.visible');
    cy.cypressData(MapperComponentSelectors.OBJECT_SELECTOR + '-2').should('be.visible');
    cy.cypressData(MapperComponentSelectors.OBJECT_SELECTOR + '-2').contains('record_id');

    // I see empty triple
    cy.cypressData(MapperComponentSelectors.SUBJECT_SELECTOR + '-3').should('be.visible');
    cy.cypressData(MapperComponentSelectors.PREDICATE_SELECTOR + '-3').should('be.visible');
    cy.cypressData(MapperComponentSelectors.OBJECT_SELECTOR + '-3').should('be.visible');
  });

  it('should set Raw IRI properly', () => {
    PrepareSteps.stubEmptyMappingModel();
    PrepareSteps.visitPageAndWaitToLoad();

    // When I complete a new triple with an IRI object
    MappingSteps.completeTriple(0, 's', 'p', 'http://some/iri');

    // I set is a Raw IRI through the edit window
    MappingSteps.editTripleObjectWithData(0);
    EditDialogSteps.setRawIRI();

    // Raw IRI should be set and prefix field should be disabled
    EditDialogSteps.isRawIRI();
    EditDialogSteps.getTransformationExpressionField().should('have.attr', 'readonly');
    EditDialogSteps.saveConfiguration();

    // When I save and reopen the edit window
    MappingSteps.editTripleObjectWithData(0);

    // Raw IRI should be set and prefix field should be disabled
    EditDialogSteps.isRawIRI();
    EditDialogSteps.getTransformationExpressionField().should('have.attr', 'readonly');
  });
});
