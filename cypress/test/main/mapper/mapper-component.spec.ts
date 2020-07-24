import {MapperComponentSelectors} from "../../../../cypress/utils/selectors/mapper-component.selectors";
import HeaderSteps from "../../../../cypress/steps/header-steps";


describe('MapperComponent', () => {
  beforeEach(() => {
    // stub labels
    cy.route('GET', '/assets/i18n/en.json', 'fixture:en.json');
    // stub namespaces
    cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
    // stub model
    cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:delete/mapping-model.json');
    // stub columns
    cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json');
    // stub socksjs
    cy.route('GET', '/sockjs-node/info?t=*', 'fixture:info.json');
  });

  it('should render mapper', () => {
    cy.visit('?dataProviderID=ontorefine:123');

    // THEN:
    // I see header content
    cy.cypressData(MapperComponentSelectors.MAPPER_SELECTOR).should('be.visible');
    // I see mapping holders
    cy.cypressData(MapperComponentSelectors.SUBJECT_SELECTOR + "-0").should('be.visible');
    cy.cypressData(MapperComponentSelectors.PREDICATE_SELECTOR + "-0").should('be.visible');
    cy.cypressData(MapperComponentSelectors.OBJECT_SELECTOR + "-0").should('be.visible');
  });

  it('should render mapping dialog when drag and drop source', () => {
    // GIVEN:
    // I visit home page
    cy.visit('?dataProviderID=ontorefine:123');

    // WHEN:
    // I drag and drop the first source in the subject holder
    cy.cypressData(MapperComponentSelectors.FIRST_SOURCE_SELECTOR).trigger("mousedown", {button: 0});
    cy.cypressData(MapperComponentSelectors.SUBJECT_SELECTOR + "-2")
      .trigger("mousemove")
      .click()
      .trigger(("mouseup"));

    // THEN:
    // I see popup dialog
    cy.cypressData(MapperComponentSelectors.MAPPER_DIALOG_TITLE_SELECTOR).should('be.visible');
  });

  it('should render mapping dialog on subject edit button click', () => {
    // GIVEN:
    // I visit home page
    cy.visit('?dataProviderID=ontorefine:123');

    // WHEN:
    // I click on edit button of the empty triple's subject
    cy.cypressData(MapperComponentSelectors.SUBJECT_SELECTOR + "-2").cypressFind(MapperComponentSelectors.BUTTON_EDIT_EMPTY_CELL).click();

    // THEN:
    // I see popup dialog
    cy.cypressData(MapperComponentSelectors.MAPPER_DIALOG_TITLE_SELECTOR)
      .should('be.visible')
      .contains('Subject mapping');
    cy.cypressData(MapperComponentSelectors.COLUMN).should('be.visible');
    cy.cypressData(MapperComponentSelectors.CONSTANT).should('be.visible');
    cy.cypressData(MapperComponentSelectors.RECORD_ID).should('be.visible');
    cy.cypressData(MapperComponentSelectors.ROW_INDEX).should('be.visible');
    cy.cypressData(MapperComponentSelectors.TRANSFORMATION_PREFIX).should('be.visible');
    cy.cypressData(MapperComponentSelectors.TRANSFORMATION_GREL).should('be.visible').click();
    cy.cypressData(MapperComponentSelectors.TRANSFORMATION_EXPRESSION).should('be.visible');

    // I see required fields
    cy.cypressData(MapperComponentSelectors.SOURCE_ERROR).should('be.visible');

    // OK button is disabled
    cy.cypressData(MapperComponentSelectors.OK_MAPPING_BUTTON_SELECTOR)
      .should('be.visible')
      .should('be.disabled');

  });

  it('should render mapping dialog and create triple', () => {
    // GIVEN:
    // I visit home page
    cy.visit('?dataProviderID=ontorefine:123');

    // TODO mock REST preview endpoint
    // I switch to configuration view
    HeaderSteps.getConfigurationButton().click();

    // WHEN:
    // I click on edit button of the empty triple's subject
    cy.cypressData(MapperComponentSelectors.SUBJECT_SELECTOR + "-2").cypressFind(MapperComponentSelectors.BUTTON_EDIT_EMPTY_CELL).click();

    // THEN:
    // I see popup dialog
    cy.cypressData(MapperComponentSelectors.MAPPER_DIALOG_TITLE_SELECTOR)
      .should('be.visible')
      .contains('Subject mapping');

    // WHEN:
    // I choose column, fill column name and press OK button
    cy.cypressData(MapperComponentSelectors.COLUMN).click();
    cy.cypressData(MapperComponentSelectors.COLUMN_INPUT).should('be.visible').type('director_name');
    cy.cypressData(MapperComponentSelectors.OK_MAPPING_BUTTON_SELECTOR).click();

    // THEN:
    // I see subject created
    cy.cypressData(MapperComponentSelectors.MAPPER_DIALOG_TITLE_SELECTOR).should('not.be.visible');
    cy.cypressData(MapperComponentSelectors.SUBJECT_SELECTOR + "-2").contains('director_name');
    cy.cypressData(MapperComponentSelectors.SUBJECT_SELECTOR + "-3").should('be.visible');

    // WHEN:
    // I click on edit button of the empty triple's predicate
    cy.cypressData(MapperComponentSelectors.PREDICATE_SELECTOR + "-2").cypressFind(MapperComponentSelectors.BUTTON_EDIT_EMPTY_CELL).should('be.visible').click();

    // THEN:
    // I see popup dialog
    cy.cypressData(MapperComponentSelectors.COLUMN).should('be.visible');
    cy.cypressData(MapperComponentSelectors.CONSTANT).should('be.visible');
    cy.cypressData(MapperComponentSelectors.RECORD_ID).should('be.visible');
    cy.cypressData(MapperComponentSelectors.ROW_INDEX).should('be.visible');
    cy.cypressData(MapperComponentSelectors.TRANSFORMATION_PREFIX).should('be.visible');
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
    cy.cypressData(MapperComponentSelectors.PREDICATE_SELECTOR + "-2").contains('constant123');
    cy.cypressData(MapperComponentSelectors.OBJECT_SELECTOR + "-3").should('be.visible');

    // WHEN:
    // I click on edit button of the empty triple's object
    cy.cypressData(MapperComponentSelectors.OBJECT_SELECTOR + "-2").cypressFind(MapperComponentSelectors.BUTTON_EDIT_EMPTY_CELL).should('be.visible').click();

    // THEN:
    // I see popup dialog
    cy.cypressData(MapperComponentSelectors.TYPE_DATATYPE_LITERAL).should('be.visible');
    cy.cypressData(MapperComponentSelectors.TYPE_IRI).should('be.visible');
    cy.cypressData(MapperComponentSelectors.TYPE_LANGUAGE_LITERAL).should('be.visible');
    cy.cypressData(MapperComponentSelectors.TYPE_LITERAL).should('be.visible');
    cy.cypressData(MapperComponentSelectors.TYPE_UNIQUE_BNODE).should('be.visible');
    cy.cypressData(MapperComponentSelectors.TYPE_VALUE_BNODE).should('be.visible');
    cy.cypressData(MapperComponentSelectors.COLUMN).should('be.visible');
    cy.cypressData(MapperComponentSelectors.CONSTANT).should('be.visible');
    cy.cypressData(MapperComponentSelectors.RECORD_ID).should('be.visible');
    cy.cypressData(MapperComponentSelectors.ROW_INDEX).should('be.visible');
    cy.cypressData(MapperComponentSelectors.TRANSFORMATION_PREFIX).should('be.visible');
    cy.cypressData(MapperComponentSelectors.TRANSFORMATION_GREL).should('be.visible').click();
    cy.cypressData(MapperComponentSelectors.TRANSFORMATION_EXPRESSION).should('be.visible');

    // I see required fields
    cy.cypressData(MapperComponentSelectors.TYPE_ERROR).should('be.visible');
    cy.cypressData(MapperComponentSelectors.SOURCE_ERROR).should('be.visible');

    // WHEN:
    // I click on DatatypeLiteral
    cy.cypressData(MapperComponentSelectors.TYPE_DATATYPE_LITERAL).click();

    // THEN:
    // I see Datatype fields appear
    cy.cypressData(MapperComponentSelectors.DATATYPE_COLUMN).should('be.visible');
    cy.cypressData(MapperComponentSelectors.DATATYPE_CONSTANT).should('be.visible');
    cy.cypressData(MapperComponentSelectors.DATATYPE_RECORD_ID).should('be.visible');
    cy.cypressData(MapperComponentSelectors.DATATYPE_ROW_INDEX).should('be.visible');
    cy.cypressData(MapperComponentSelectors.DATATYPE_TRANSFORMATION_PREFIX).should('be.visible');
    cy.cypressData(MapperComponentSelectors.DATATYPE_TRANSFORMATION_GREL).should('be.visible').click();
    cy.cypressData(MapperComponentSelectors.DATATYPE_TRANSFORMATION_EXPRESSION).should('be.visible');

    // I see required fields
    cy.cypressData(MapperComponentSelectors.DATATYPE_SOURCE_ERROR).should('be.visible');

    // WHEN:
    // I click on LanguageLiteral
    cy.cypressData(MapperComponentSelectors.TYPE_LANGUAGE_LITERAL).click();

    // THEN:
    // I see LanguageLiteral fields appear
    cy.cypressData(MapperComponentSelectors.LANGUAGE_COLUMN).should('be.visible');
    cy.cypressData(MapperComponentSelectors.LANGUAGE_CONSTANT).should('be.visible');
    cy.cypressData(MapperComponentSelectors.LANGUAGE_RECORD_ID).should('be.visible');
    cy.cypressData(MapperComponentSelectors.LANGUAGE_ROW_INDEX).should('be.visible');
    cy.cypressData(MapperComponentSelectors.LANGUAGE_TRANSFORMATION_PREFIX).should('be.visible');
    cy.cypressData(MapperComponentSelectors.LANGUAGE_TRANSFORMATION_GREL).should('be.visible').click();
    cy.cypressData(MapperComponentSelectors.LANGUAGE_TRANSFORMATION_EXPRESSION).should('be.visible');

    // I see required fields
    cy.cypressData(MapperComponentSelectors.LANGUAGE_SOURCE_ERROR).should('be.visible');

    // WHEN:
    // I click on LanguageLiteral
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


    // WHEN:
    // I click on RecordId and click OK button
    cy.cypressData(MapperComponentSelectors.RECORD_ID).click();
    cy.cypressData(MapperComponentSelectors.OK_MAPPING_BUTTON_SELECTOR).click();

    // THEN:
    // I see object created
    cy.cypressData(MapperComponentSelectors.MAPPER_DIALOG_TITLE_SELECTOR).should('not.be.visible');
    cy.cypressData(MapperComponentSelectors.OBJECT_SELECTOR + "-2").should('be.visible');
    cy.cypressData(MapperComponentSelectors.OBJECT_SELECTOR + "-2").contains('record_id');

    // I see empty triple
    cy.cypressData(MapperComponentSelectors.SUBJECT_SELECTOR + "-3").should('be.visible');
    cy.cypressData(MapperComponentSelectors.PREDICATE_SELECTOR + "-3").should('be.visible');
    cy.cypressData(MapperComponentSelectors.OBJECT_SELECTOR + "-3").should('be.visible');

  })
});
