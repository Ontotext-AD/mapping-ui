import HeaderSteps from '../steps/header-steps';
import MappingSteps from '../steps/mapping-steps';
import EditDialogSteps from '../../cypress/steps/edit-dialog-steps';

context('Namespaces', () => {
  beforeEach(() => {
    cy.setCookie('com.ontotext.graphdb.repository4200', 'Movies');
    cy.route('GET', '/sockjs-node/info?t=*', 'fixture:info.json');
    cy.route('GET', '/assets/i18n/en.json', 'fixture:en.json');
    cy.route('POST', '/repositories/Movies', 'fixture:edit-mapping/autocomplete-response.json');
    cy.route('GET', '/rest/autocomplete/enabled', 'true');
  });

  it('Should make the mapping dirty when namespaces are added', () => {
    cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:namespaces/base-iri-mapping-model.json');
    cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
    cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json').as('loadColumns');
    cy.route({
      method: 'POST',
      url: '/orefine/command/mapping-editor/save-rdf-mapping/?project=123',
      status: 200,
      delay: 1000,
      response: 'fixture:namespaces/save-mapping-success.json'
    }).as('saveMapping');

    // Given I have loaded a mapping
    cy.visit('?dataProviderID=ontorefine:123');
    cy.wait('@loadColumns');
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
      cy.wait('@saveMapping');
      cy.get('@saveMapping').should((xhr: any) => {
        expect(xhr.url).to.include('/orefine/command/mapping-editor/save-rdf-mapping/?project=123');
        expect(xhr.method).to.equal('POST');
        expect(xhr.request.body).to.equal(saveRequest);
      });
    });
    HeaderSteps.getSaveMappingButton().should('be.disabled');
  });

  it('Should make the mapping dirty when namespaces are removed', () => {
    cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:namespaces/custom-namespace-mapping-model.json');
    cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
    cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json').as('loadColumns');
    cy.route({
      method: 'POST',
      url: '/orefine/command/mapping-editor/save-rdf-mapping/?project=123',
      status: 200,
      delay: 1000,
      response: 'fixture:namespaces/save-mapping-success.json'
    }).as('saveMapping');

    // Given I have loaded a mapping
    cy.visit('?dataProviderID=ontorefine:123');
    cy.wait('@loadColumns');
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
      cy.wait('@saveMapping');
      cy.get('@saveMapping').should((xhr: any) => {
        expect(xhr.url).to.include('/orefine/command/mapping-editor/save-rdf-mapping/?project=123');
        expect(xhr.method).to.equal('POST');
        expect(xhr.request.body).to.equal(saveRequest);
      });
    });
    HeaderSteps.getSaveMappingButton().should('be.disabled');
  });

  it('Should edit namespace', () => {
    cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:namespaces/custom-namespace-mapping-model.json');
    cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
    cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json').as('loadColumns');
    cy.route({
      method: 'POST',
      url: '/orefine/command/mapping-editor/save-rdf-mapping/?project=123',
      status: 200,
      delay: 1000,
      response: 'fixture:namespaces/save-mapping-success.json'
    }).as('saveMapping');

    // Given I have loaded a mapping
    cy.visit('?dataProviderID=ontorefine:123');
    cy.wait('@loadColumns');
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
      cy.wait('@saveMapping');
      cy.get('@saveMapping').should((xhr: any) => {
        expect(xhr.url).to.include('/orefine/command/mapping-editor/save-rdf-mapping/?project=123');
        expect(xhr.method).to.equal('POST');
        expect(xhr.request.body).to.equal(saveRequest);
      });
    });
    HeaderSteps.getSaveMappingButton().should('be.disabled');
  });

  it('Should validate namespaces when added', () => {
    cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:namespaces/base-iri-mapping-model.json');
    cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
    cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json').as('loadColumns');

    // Given I have loaded a mapping
    cy.visit('?dataProviderID=ontorefine:123');
    cy.wait('@loadColumns');
    // When I add a new namespace without value
    MappingSteps.addNamespace('PREFIX ga:');
    // THEN I expect to see error
    MappingSteps.getNamespaces().find('.mat-chip').should('have.length', 1);
    MappingSteps.getNamespace('ga').should('not.be.visible');
    MappingSteps.getNamespaceValidationError().should('be.visible');

    // I clear the namespace
    MappingSteps.clearNamespace();
    MappingSteps.getNamespaceValidationError().should('not.be.visible');

    // When I add a prefix with colon inside
    MappingSteps.addNamespace('PREFIX ga:ga: {shift}<http://google/namespace>');
    // THEN I expect to see error
    MappingSteps.getNamespaces().find('.mat-chip').should('have.length', 1);
    MappingSteps.getNamespace('ga').should('not.be.visible');
    MappingSteps.getNamespaceValidationError().should('be.visible');

    // I clear the namespace
    MappingSteps.clearNamespace();
    MappingSteps.getNamespaceValidationError().should('not.be.visible');

    // When I add a prefix with blank namespace
    MappingSteps.addNamespace('PREFIX ga: {shift}<>');
    // THEN I expect to see error
    MappingSteps.getNamespaces().find('.mat-chip').should('have.length', 1);
    MappingSteps.getNamespace('ga').should('not.be.visible');
    MappingSteps.getNamespaceValidationError().should('be.visible');

    // When I add a prefix with invalid IRI inside the brackets namespace
    MappingSteps.clearNamespace();
    MappingSteps.addNamespace('PREFIX ga: {shift}<<http://google/namespace>');
    // THEN I expect to see error
    MappingSteps.getNamespaces().find('.mat-chip').should('have.length', 1);
    MappingSteps.getNamespace('ga').should('not.be.visible');
    MappingSteps.getNamespaceValidationError().should('be.visible');
  });

  context('Namespace as constant mapping', () => {
    it('Should treat namespace as constant when inline typing', () => {
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:empty-mapping-model.json');
      cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
      cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json').as('loadColumns');
      cy.visit('?dataProviderID=ontorefine:123');
      cy.wait('@loadColumns');

      // WHEN I type namespace inline
      MappingSteps.completeTriple(0, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#', undefined, undefined);

      // THEN I expect to have it as constant
      MappingSteps.getTripleSubject(0).should('have.text', ' C  http:// ... tax-ns# <IRI>');
    });

    it('Should treat namespace as constant in IRI', () => {
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:empty-mapping-model.json');
      cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
      cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json').as('loadColumns');
      cy.visit('?dataProviderID=ontorefine:123');
      cy.wait('@loadColumns');

      // WHEN I complete the subject and predicate
      MappingSteps.completeTriple(0, 'sub', 'pred', undefined);
      // And edit the object
      MappingSteps.editTripleObject(0);
      EditDialogSteps.selectIri();
      EditDialogSteps.selectConstant();
      EditDialogSteps.completeConstant('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
      EditDialogSteps.saveConfiguration();

      // THEN I expect to have it as constant
      MappingSteps.getTripleObject(0).should('have.text', ' C  http:// ... tax-ns# <IRI>');
    });

    it('Should treat namespace as constant in datatype', () => {
      cy.route('GET', '/orefine/command/core/get-models/?project=123', 'fixture:empty-mapping-model.json');
      cy.route('GET', '/repositories/Movies/namespaces', 'fixture:namespaces.json');
      cy.route('GET', '/rest/rdf-mapper/columns/ontorefine:123', 'fixture:columns.json').as('loadColumns');
      cy.visit('?dataProviderID=ontorefine:123');
      cy.wait('@loadColumns');

      // WHEN I complete the subject ans predicate
      MappingSteps.completeTriple(0, 'sub', 'pred', undefined);
      // And edit the object
      MappingSteps.editTripleObject(0);
      EditDialogSteps.selectLiteral();
      EditDialogSteps.selectConstant();
      EditDialogSteps.completeConstant('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
      EditDialogSteps.selectTypeDataTypeLiteral();
      EditDialogSteps.selectDataTypeConstant();
      EditDialogSteps.completeDataTypeConstant('http://www.w3.org/1999/02/22-rdf-syntax-ns#')
      EditDialogSteps.saveConfiguration();

      // THEN
      // It is a literal type with constant with datatype constant
      MappingSteps.getTripleObject(0).should('have.text', ' C  http:// ... tax-ns# "Literal" C  http:// ... tax-ns# ^^Datatype');
    });
  });
});
