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
    return MappingSteps.getTriple(index).find(`[appCypressData=subject-${index}] .triple-item`);
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

  static getTripleSubjectSource(index: any) {
    return MappingSteps.getTripleSubject(index).find('.ti-source');
  }

  static getTripleSubjectPreview(index: number) {
    return MappingSteps.getTripleSubject(index).find('.ti-preview');
  }

  static deleteTripleSubject(index: number) {
    return MappingSteps.getTripleSubject(index).find('[appCypressData="delete-node"]').click();
  }

  static editTripleSubject(index: number) {
    return MappingSteps.getTripleSubject(index).find('[appCypressData="button-edit-cell"]').click();
  }

  // triple predicate
  static getTriplePredicate(index: any) {
    return MappingSteps.getTriple(index).find(`[appCypressData=predicate-${index}] .triple-item`);
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

  static deleteTriplePredicate(index: number) {
    return MappingSteps.getTriplePredicate(index).find('[appCypressData="delete-node"]').click();
  }

  // triple object
  static getTripleObject(index: any) {
    return MappingSteps.getTriple(index).find(`[appCypressData=object-${index}] .triple-item`);
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

  static deleteTripleObject(index: number) {
    return MappingSteps.getTripleObject(index).find('[appCypressData="delete-node"]').click();
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
