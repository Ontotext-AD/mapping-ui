/**
 * Common mapping steps.
 */
class MappingSteps {

  static completeTriple(index: number, subject?: string, predicate?: string, object?: string) {
    if (subject) {
      MappingSteps.getTripleSubjectValue(index).type(subject).blur();
    }
    if (predicate) {
      MappingSteps.getTriplePredicateValue(index).type(predicate).blur();
    }
    if (object) {
      MappingSteps.getTripleObjectValue(index).type(object).blur();
    }
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

  static getTripleObjectDatatypeTransformation(index: any) {
    return MappingSteps.getTripleObject(index).find('.datatypetransformation .ti-transform');
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
  static editTripleObject(index: number) {
    return MappingSteps.getTripleObject(index).find('[appCypressData="button-edit-empty-cell"]').click();
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
    MappingSteps.getConfirmation().find('.confirm-btn').should('be.visible').click();
    MappingSteps.getConfirmation().should('not.be.visible');
  }

  static reject() {
    return MappingSteps.getConfirmation().find('.cancel-btn').should('be.visible').click();
  }

  // Notifications
  static getNotification() {
    return cy.get('.mat-simple-snackbar');
  }

  static getViewJSONDialog() {
    return cy.get('[appCypressData="view-json-modal"]')
  }
}

export default MappingSteps;
