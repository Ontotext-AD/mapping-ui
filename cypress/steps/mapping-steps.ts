/**
 * Common mapping steps.
 */
class MappingSteps {

  /**
   * Type the value string one character at a time with a bit of delay giving a chance to
   * REST calls to complete: e.g. autocomplete
   *
   * @param value the string value to be completed in the field
   * @param fieldAccessorCb a function which must return a field
   */
  static type(value: string, fieldAccessorCb: any) {
    return fieldAccessorCb().focus().type(value, {force: true});
  }

  static completeTriple(index: number, subject?: string, predicate?: string, object?: string) {
    if (subject) {
      this.completeSubject(index, subject);
    }
    if (predicate) {
      this.completePredicate(index, predicate);
    }
    if (object) {
      this.completeObject(index, object);
    }
  }

  static completeSubject(index: number, value: string) {
    this.type(value, () => MappingSteps.getTripleSubjectValue(index));
    MappingSteps.getTripleSubjectValue(index).then((component) => {
      if (component) {
        cy.wrap(component).blur({force: true});
      }
    });
  }

  static completePredicate(index: number, value: string) {
    this.type(value, () => MappingSteps.getTriplePredicateValue(index));
    MappingSteps.getTriplePredicateValue(index).then((component) => {
      if (component) {
        cy.wrap(component).blur({force: true});
      }
    });
  }

  static completeObject(index: number, value: string) {
    MappingSteps.getTripleObject(index).find('[appCypressData="cell-value"]').focus().type(value, {parseSpecialCharSequences: false});
    MappingSteps.getTripleObject(index).find('[appCypressData="cell-value"]').then((component) => {
      if (component) {
        cy.wrap(component).blur({force: true});
      }
    });
  }

  static verifyTriple(index: number, subject: string, predicate: string, object: string) {
    if (subject.length) {
      MappingSteps.getTripleSubjectValuePreview(index).should('contain', subject);
    } else {
      MappingSteps.getTripleSubjectValuePreview(index).should('have.length', 0);
    }
    if (predicate.length) {
      MappingSteps.getTriplePredicateValuePreview(index).should('contain', predicate);
    } else {
      MappingSteps.getTriplePredicateValuePreview(index).should('have.length', 0);
    }
    if (object.length) {
      MappingSteps.getTripleObjectValuePreview(index).should('contain', object);
    } else {
      MappingSteps.getTripleObjectValuePreview(index).should('have.length', 0);
    }
  }

  // mapping
  static getMapping() {
    return cy.cypressData('mapping-wrapper');
  }

  static getTriples() {
    return MappingSteps.getMapping().find('[appCypressData=triple-wrapper]');
  }

  // triple
  static getTriple(index: any) {
    return MappingSteps.getTriples().eq(index);
  }

  static getNestedTriple(index: any) {
    return MappingSteps.getTriple(index).find('.triples-blocks-subrow');
  }

  static deleteTriple(index: any) {
    return MappingSteps.getTriple(index).find('.delete-triple').click();
  }

  static addNestedTriple(index: any) {
    return MappingSteps.getTriple(index).find('[appCypressData=add-nested]').click();
  }

  // triple subject
  static getTripleSubject(index: any) {
    return MappingSteps.getTriple(index).find(`[appCypressData=subject-${index}]`);
  }

  static getTripleSubjectValue(index: any) {
    return MappingSteps.getTripleSubject(index).find('[appCypressData="cell-value"]');
  }

  static getTripleSubjectValuePreview(index: any) {
    return MappingSteps.getTripleSubject(index).find('.ti-source');
  }

  static getTripleSubjectType(index: any) {
    return MappingSteps.getTripleSubject(index).find('.ti-type');
  }

  static getTripleSubjectSourceType(index: any) {
    return MappingSteps.getTripleSubject(index).find('.ti-source-type');
  }

  static getTriplePredicateType(index: any) {
    return MappingSteps.getTriplePredicate(index).find('.ti-type');
  }

  static getTriplePredicateSourceType(index: any) {
    return MappingSteps.getTriplePredicate(index).find('.ti-source-type');
  }

  static getTripleObjectSourceType(index: any) {
    return MappingSteps.getTripleObject(index).find('.ti-source-type');
  }

  static getTripleSubjectPropertyTransformation(index: any) {
    return MappingSteps.getTripleSubject(index).find('.propertytransformation .ti-transform');
  }

  static getTripleSubjectValueTransformation(index: any) {
    return MappingSteps.getTripleSubject(index).find('.valuetransformation .ti-transform');
  }

  static getTripleSubjectSource(index: any) {
    return MappingSteps.getTripleSubject(index).find('.ti-source');
  }

  static getTripleSubjectPreview(index: number) {
    return MappingSteps.getTripleSubject(index).find('.ti-preview');
  }

  static getTripleSubjectContent(index: any) {
    return MappingSteps.getTripleSubject(index).find('.ti-row');
  }

  static deleteTripleSubject(index: number) {
    return MappingSteps.getTripleSubject(index).find('[appCypressData="delete-node"]').click();
  }

  static addTripleSubjectSibling(index: number) {
    MappingSteps.getTripleSubject(index).find('[appCypressData="add-sibling"]').click();
  }

  static editTripleSubject(index: number) {
    return MappingSteps.getTripleSubject(index).find('[appCypressData="button-edit-cell"]').click();
  }

  // triple predicate
  static getTriplePredicate(index: any) {
    return MappingSteps.getTriple(index).find(`[appCypressData=predicate-${index}]`);
  }

  static getTriplePredicateValue(index: any) {
    // wait for a while to prevent element to be found in detached state
    return MappingSteps.getTriplePredicate(index).find('[appCypressData="cell-value"]');
  }

  static getTriplePredicateValuePreview(index: any) {
    return MappingSteps.getTriplePredicate(index).find('.ti-source');
  }

  static getTriplePredicatePreview(index: number) {
    return MappingSteps.getTriplePredicate(index).find('.ti-preview');
  }

  static getTriplePredicateContent(index: any) {
    return MappingSteps.getTriplePredicate(index).find('.ti-row');
  }

  static getTriplePredicatePropertyTransformation(index: any) {
    return MappingSteps.getTriplePredicate(index).find('.propertytransformation .ti-transform');
  }

  static addTriplePredicateSibling(index: number) {
    MappingSteps.getTriplePredicate(index).find('[appCypressData="add-sibling"]').click();
  }

  static deleteTriplePredicate(index: number) {
    return MappingSteps.getTriplePredicate(index).find('[appCypressData="delete-node"]').click();
  }

  // triple object
  static getTripleObject(index: any) {
    return MappingSteps.getTriple(index).find(`[appCypressData=object-${index}]`);
  }

  static getTripleObjectValue(index: any) {
    // wait for a while to prevent element to be found in detached state
    return MappingSteps.getTripleObject(index).find('[appCypressData="cell-value"]');
  }

  static getTripleObjectValuePreview(index: any) {
    return MappingSteps.getTripleObject(index).find('.ti-source');
  }

  static getTripleObjectType(index: any) {
    return MappingSteps.getTripleObject(index).find('.ti-type');
  }

  static getTripleObjectSource(index: any) {
    return MappingSteps.getTripleObject(index).find('.ti-source');
  }

  static getTripleObjectPreview(index: number) {
    return MappingSteps.getTripleObject(index).find('.ti-preview');
  }

  static getTripleObjectContent(index: any) {
    return MappingSteps.getTripleObject(index).find('.ti-row');
  }

  static getTripleObjectPropertyTransformation(index: any) {
    return MappingSteps.getTripleObject(index).find('.propertytransformation .ti-transform');
  }

  static getTripleObjectValueTransformation(index: any) {
    return MappingSteps.getTripleObject(index).find('.valuetransformation .ti-transform');
  }

  static getTripleObjectSecondaryType(index: any) {
    return MappingSteps.getTripleObject(index).find('.datatypetransformation .ti-type');
  }

  static deleteTripleObject(index: number) {
    return MappingSteps.getTripleObject(index).find('[appCypressData="delete-node"]').click();
  }

  static editTripleObjectWithData(index: number) {
    return MappingSteps.getTripleObject(index).find('[appCypressData="button-edit-cell"]').click();
  }

  static addTripleObjectSibling(index: number) {
    MappingSteps.getTripleObject(index).find('[appCypressData="add-sibling"]').click();
  }

  // This is for the empty cell edit!!!
  static editEmptyTripleObject(index: number) {
    return MappingSteps.getTripleObject(index).find('[appCypressData="button-edit-empty-cell"]').click();
  }

  // This is for the empty cell edit!!!
  static editEmptyTripleSubject(index: number) {
    return MappingSteps.getTripleSubject(index).find('[appCypressData="button-edit-empty-cell"]').click();
  }

  // This is for the empty cell edit!!!
  static editEmptyTriplePredicate(index: number) {
    return MappingSteps.getTriplePredicate(index).find('[appCypressData="button-edit-empty-cell"]').click();
  }

  // dialog and confirmation
  static getModalDialog() {
    return cy.get('.modal-dialog');
  }

  static getConfirmation() {
    return MappingSteps.getModalDialog();
  }

  static getConfirmationMessage() {
    return MappingSteps.getConfirmation().find('.mat-dialog-content');
  }

  static confirm() {
    MappingSteps.getConfirmation().should('be.visible');
    MappingSteps.getConfirmation().find('.mat-dialog-actions').find('.confirm-btn', {timeout: 15000}).contains('Proceed').should('be.visible')
      .click();
    MappingSteps.getConfirmation().should('not.exist', {timeout: 10000});
  }

  static reject() {
    return MappingSteps.getConfirmation().find('.mat-dialog-actions').find('.cancel-btn').should('be.visible').click();
  }

  // Notifications
  static getNotification() {
    return cy.get('.mat-simple-snackbar', {timeout: 10000});
  }

  static getViewJSONDialog() {
    return cy.get('[appCypressData="view-json-modal"]');
  }

  static getBaseIRI() {
    // Currently returns 3 elements due to GDB address and Repository fields
    return cy.get('[appCypressData="base-iri"]').first();
  }

  static getNamespaces() {
    return cy.get('[appCypressData="namespace-wrapper"]');
  }

  static getNamespaceField() {
    return this.getNamespaces().find('[appCypressData="namespaces-field"]');
  }

  static getNamespace(namespace: string) {
    return MappingSteps.getNamespaces().find(`[appCypressData="namespace-${namespace}"]`);
  }

  static editNamespace(namespace: string, value: string) {
    this.getNamespace(namespace).click();
    this.getNamespaceField().clear().type(value).blur();
  }

  static addNamespace(namespace: string) {
    return this.getNamespaceField().should('be.visible').type(namespace).blur();
  }

  static clearNamespace() {
    return this.getNamespaces().find('[appCypressData="namespaces-field"]')
      .should('be.visible')
      .clear()
      .blur();
  }

  static removeNamespace(namespace: string) {
    return this.getNamespace(namespace).find('.mat-chip-remove').click();
  }

  static getNamespaceValidationError() {
    return cy.get('[appCypressData="namespace-error"]');
  }

  static getSuggestions() {
    return cy.get('.autocomplete-check').should('be.visible').find(`[appCypressData="cell-option"]`);
  }

  static getTooltip() {
    return cy.get(`.mat-tooltip`);
  }

  static getAutocompleteHint() {
    return cy.get('.autocomplete-hint');
  }
}

export default MappingSteps;
