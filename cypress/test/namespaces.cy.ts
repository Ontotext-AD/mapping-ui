import HeaderSteps from '../steps/header-steps';
import MappingSteps from '../steps/mapping-steps';
import EditDialogSteps from '../../cypress/steps/edit-dialog-steps';
import PrepareSteps from '../steps/prepare-steps';

context('Namespaces', () => {
  beforeEach(() => {
    PrepareSteps.prepareMoviesNamespacesAndColumns();
    PrepareSteps.enableAutocompleteWithEmptyResponse();
  });

  it('Should show base iri and no default prefixes on empty mapping', () => {
    cy.intercept('GET', '/orefine/command/core/get-models/?project=123', {fixture: 'namespaces/empty-mapping-model.json'}).as('loadProject');

    // Given I have loaded a mapping
    PrepareSteps.visitPageAndWaitToLoad();
    MappingSteps.getTriples().should('have.length', 1);
    HeaderSteps.getSaveMappingButton().should('be.disabled');
    // I expect to no default namespaces
    MappingSteps.getNamespaces().find('.mat-chip').should('have.length', 0);
    // I expect see default base IRI
    MappingSteps.getBaseIRI().should('have.value', 'http://example.com/base/');
  });

  it('Should make the mapping dirty when namespaces are added', () => {
    cy.intercept('GET', '/orefine/command/core/get-models/?project=123', {fixture: 'namespaces/base-iri-mapping-model.json'}).as('loadProject');
    cy.intercept('POST', '/orefine/command/mapping-editor/save-rdf-mapping/?project=123', {
      statusCode: 200,
      delay: 1000,
      fixture: 'namespaces/save-mapping-success.json',
    }).as('saveMapping');

    // Given I have loaded a mapping
    PrepareSteps.visitPageAndWaitToLoad();
    MappingSteps.getTriples().should('have.length', 2);
    HeaderSteps.getSaveMappingButton().should('be.disabled');
    // I expect to see some default namespaces
    MappingSteps.getNamespaces().find('.mat-chip').should('have.length', 1);
    MappingSteps.getNamespace('rdf').should('be.visible');
    // When I add a new namespace
    MappingSteps.addNamespace('PREFIX ga: {shift}<http://google/namespace>');
    MappingSteps.getNamespaces().find('.mat-chip').should('have.length', 2);
    MappingSteps.getNamespace('ga').should('be.visible');
    // Then I expect the mapping to become dirty
    HeaderSteps.getDirtyMappingBanner().should('contain', 'Mapping has unsaved changes');
    HeaderSteps.getSaveMappingButton().should('be.enabled');
    // When I save the mapping
    HeaderSteps.saveMapping();
    // Then I expect the updated namespaces to be sent for save
    cy.fixture('namespaces/save-mapping-with-new-namespace-request-body').then((saveRequest: string) => {
      cy.wait('@saveMapping').then((interceptor)=>{
        expect(interceptor.request.url).to.include('/orefine/command/mapping-editor/save-rdf-mapping/?project=123');
        expect(interceptor.request.method).to.equal('POST');
        expect(interceptor.request.body).to.equal(saveRequest);
      });
    });
    HeaderSteps.getSaveMappingButton().should('be.disabled');
  });

  it('Should make the mapping dirty when namespaces are removed', () => {
    cy.intercept('GET', '/orefine/command/core/get-models/?project=123', {fixture: 'namespaces/custom-namespace-mapping-model.json'}).as('loadProject');
    cy.intercept('POST', '/orefine/command/mapping-editor/save-rdf-mapping/?project=123', {
      statusCode: 200,
      delay: 1000,
      fixture: 'namespaces/save-mapping-success.json',
    }).as('saveMapping');

    // Given I have loaded a mapping
    PrepareSteps.visitPageAndWaitToLoad();
    MappingSteps.getTriples().should('have.length', 2);
    HeaderSteps.getSaveMappingButton().should('be.disabled');
    // I expect to see some default namespaces
    MappingSteps.getNamespaces().find('.mat-chip').should('have.length', 2);
    MappingSteps.getNamespace('rdf').should('be.visible');
    MappingSteps.getNamespace('ga').should('be.visible');
    // When I remove a some namespace
    MappingSteps.removeNamespace('rdf');
    MappingSteps.getNamespaces().find('.mat-chip').should('have.length', 1);
    MappingSteps.getNamespace('ga').should('be.visible');
    // Then I expect the mapping to become dirty
    HeaderSteps.getDirtyMappingBanner().should('contain', 'Mapping has unsaved changes');
    HeaderSteps.getSaveMappingButton().should('be.enabled');
    // When I save the mapping
    HeaderSteps.saveMapping();
    // Then I expect the updated namespaces to be sent for save
    cy.fixture('namespaces/save-mapping-with-removed-namespace-request-body').then((saveRequest: string) => {
      cy.wait('@saveMapping').then((interceptor)=>{
        expect(interceptor.request.url).to.include('/orefine/command/mapping-editor/save-rdf-mapping/?project=123');
        expect(interceptor.request.method).to.equal('POST');
        expect(interceptor.request.body).to.equal(saveRequest);
      });
    });
    HeaderSteps.getSaveMappingButton().should('be.disabled');
  });

  it('Should edit namespace', () => {
    cy.intercept('GET', '/orefine/command/core/get-models/?project=123', {fixture: 'namespaces/custom-namespace-mapping-model.json'}).as('loadProject');
    cy.intercept('POST', '/orefine/command/mapping-editor/save-rdf-mapping/?project=123', {
      statusCode: 200,
      delay: 1000,
      fixture: 'namespaces/save-mapping-success.json',
    }).as('saveMapping');

    // Given I have loaded a mapping
    PrepareSteps.visitPageAndWaitToLoad();
    MappingSteps.getTriples().should('have.length', 2);
    // When I click over a namespace
    MappingSteps.getNamespace('ga').click();
    // Then I expect the namespace value to be visible in the field
    MappingSteps.getNamespaceField().should('have.value', 'PREFIX ga: <http://google/namespace>');
    // When I change the namespace value
    MappingSteps.editNamespace('ga', 'PREFIX ga: {shift}<http://google/namespace/123>');
    // Then I expect the namespace to be updated
    MappingSteps.getNamespace('ga').click();
    MappingSteps.getNamespaceField().should('have.value', 'PREFIX ga: <http://google/namespace/123>');
    // And the mapping to become dirty
    HeaderSteps.getDirtyMappingBanner().should('contain', 'Mapping has unsaved changes');
    HeaderSteps.getSaveMappingButton().should('be.enabled');
    // When I save the mapping
    HeaderSteps.saveMapping();
    // Then I expect the changed namespace to be sent for saving
    cy.fixture('namespaces/save-mapping-with-updated-namespace-request-body').then((saveRequest: string) => {
      cy.wait('@saveMapping').then((interceptor)=>{
        expect(interceptor.request.url).to.include('/orefine/command/mapping-editor/save-rdf-mapping/?project=123');
        expect(interceptor.request.method).to.equal('POST');
        expect(interceptor.request.body).to.equal(saveRequest);
      });
    });
    HeaderSteps.getSaveMappingButton().should('be.disabled');
  });

  it('Should validate namespaces when added', () => {
    cy.intercept('GET', '/orefine/command/core/get-models/?project=123', {fixture: 'namespaces/base-iri-mapping-model.json'}).as('loadProject');

    // Given I have loaded a mapping
    PrepareSteps.visitPageAndWaitToLoad();
    // When I add a new namespace without value
    MappingSteps.addNamespace('PREFIX ga:');
    // THEN I expect to see error
    MappingSteps.getNamespaces().find('.mat-chip').should('have.length', 1);
    MappingSteps.getNamespace('ga').should('not.exist');
    MappingSteps.getNamespaceValidationError().should('be.visible');

    // I clear the namespace
    MappingSteps.clearNamespace();
    MappingSteps.getNamespaceValidationError().should('not.exist');

    // When I add a prefix with colon inside
    MappingSteps.addNamespace('PREFIX ga:ga: {shift}<http://google/namespace>');
    // THEN I expect to see error
    MappingSteps.getNamespaces().find('.mat-chip').should('have.length', 1);
    MappingSteps.getNamespace('ga').should('not.exist');
    MappingSteps.getNamespaceValidationError().should('be.visible');

    // I clear the namespace
    MappingSteps.clearNamespace();
    MappingSteps.getNamespaceValidationError().should('not.exist');

    // When I add a prefix with blank namespace
    MappingSteps.addNamespace('PREFIX ga: {shift}<>');
    // THEN I expect to see error
    MappingSteps.getNamespaces().find('.mat-chip').should('have.length', 1);
    MappingSteps.getNamespace('ga').should('not.exist');
    MappingSteps.getNamespaceValidationError().should('be.visible');

    // When I add a prefix with invalid IRI inside the brackets namespace
    MappingSteps.clearNamespace();
    MappingSteps.addNamespace('PREFIX ga: {shift}<<http://google/namespace>');
    // THEN I expect to see error
    MappingSteps.getNamespaces().find('.mat-chip').should('have.length', 1);
    MappingSteps.getNamespace('ga').should('not.exist');
    MappingSteps.getNamespaceValidationError().should('be.visible');
  });

  context('Namespace as constant mapping', () => {
    it('Should treat namespace as constant when inline typing', () => {
      PrepareSteps.stubEmptyMappingModel();
      PrepareSteps.visitPageAndWaitToLoad();

      // WHEN I type namespace inline
      MappingSteps.completeTriple(0, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#', undefined);

      // THEN I expect to have it as constant
      MappingSteps.getTripleSubject(0).should('have.text', ' C  http:// ... tax-ns# <IRI>');
    });

    it('Should treat namespace as constant in IRI', () => {
      PrepareSteps.stubEmptyMappingModel();
      PrepareSteps.visitPageAndWaitToLoad();

      // WHEN I complete the subject and predicate
      MappingSteps.completeTriple(0, 'sub', 'pred');
      // And edit the object
      MappingSteps.editEmptyTripleObject(0);
      EditDialogSteps.selectIri();
      EditDialogSteps.selectConstant();
      EditDialogSteps.completeConstant('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
      EditDialogSteps.saveConfiguration();

      // THEN I expect to have it as constant
      MappingSteps.getTripleObject(0).should('have.text', ' C  http:// ... tax-ns# <IRI>');
    });

    it('Should treat namespace as constant in datatype', () => {
      PrepareSteps.stubEmptyMappingModel();
      PrepareSteps.visitPageAndWaitToLoad();

      // WHEN I complete the subject ans predicate
      MappingSteps.completeTriple(0, 'sub', 'pred');
      // And edit the object
      MappingSteps.editEmptyTripleObject(0);
      EditDialogSteps.selectLiteral();
      EditDialogSteps.selectConstant();
      EditDialogSteps.completeConstant('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
      EditDialogSteps.selectTypeDataTypeLiteral();
      EditDialogSteps.selectDataTypeConstant();
      EditDialogSteps.completeDataTypeConstant('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
      EditDialogSteps.saveConfiguration();

      // THEN
      // It is a literal type with constant with datatype constant
      MappingSteps.getTripleObject(0).should('have.text', ' C  http:// ... tax-ns# "Literal" C  http:// ... tax-ns# ^^Datatype');
    });
  });
});
