import {MapperComponentSelectors} from "../../../../cypress/utils/selectors/mapper-component.selectors";

describe('MapperComponent', () => {
  beforeEach(() => {
    // stub labels
    cy.route('GET', '/assets/i18n/en.json', 'fixture:en.json');
    // stub namespaces
    cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
    // stub model
    cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:delete-triple-with-iri-object/mapping-model.json');
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

  it('should render mapping dialog on edit button click', () => {
    // GIVEN:
    // I visit home page
    cy.visit('?dataProviderID=ontorefine:123');

    // WHEN:
    // I click on edit button of the empty triple's subject
    cy.cypressData(MapperComponentSelectors.SUBJECT_SELECTOR + "-2").cypressFind(MapperComponentSelectors.BUTTON_EDIT_EMPTY_CELL).click()

    // THEN:
    // I see popup dialog
    cy.cypressData(MapperComponentSelectors.MAPPER_DIALOG_TITLE_SELECTOR).should('be.visible');
  })

  it('should render mapping dialog on edit button click', () => {
    // GIVEN:
    // I visit home page
    cy.visit('?dataProviderID=ontorefine:123');

    cy.cypressData(MapperComponentSelectors.SUBJECT_SELECTOR + "-2").cypressFind(MapperComponentSelectors.CELL_INPUT).type("@duration")
    // WHEN:
    // I click on edit button of the empty triple's subject
    // cy.cypressData(MapperComponentSelectors.SUBJECT_SELECTOR + "-2").cypressFind(MapperComponentSelectors.BUTTON_EDIT_EMPTY_CELL).click()

    // THEN:
    // I see popup dialog
    // cy.cypressData(MapperComponentSelectors.MAPPER_DIALOG_TITLE_SELECTOR).should('be.visible');
  })

});
