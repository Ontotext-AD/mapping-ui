/**
 * Common mapping steps.
 */
class MappingSteps {

  static completeTriple(index: number, subject: string, predicate: string, object: string) {
    MappingSteps.getTripleSubjectValue(index).type(subject).blur();
    MappingSteps.getTriplePredicateValue(index).type(predicate).blur();
    MappingSteps.getTripleObjectValue(index).type(object).blur();
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

  // triple subject
  static getTripleSubject(index: any) {
    return MappingSteps.getTriple(index).find('.triple-item').eq(0);
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

  // triple predicate
  static getTriplePredicate(index: any) {
    return MappingSteps.getTriple(index).find('.triple-item').eq(1);
  }

  static getTriplePredicateValue(index: any) {
    return MappingSteps.getTriplePredicate(index).find('[appCypressData="cell-value"]');
  }

  static getTriplePredicatePreview(index: number) {
    return MappingSteps.getTriplePredicate(index).find('.ti-preview');
  }

  // triple object
  static getTripleObject(index: any) {
    return MappingSteps.getTriple(index).find('.triple-item').eq(2);
  }

  static getTripleObjectValue(index: any) {
    return MappingSteps.getTripleObject(index).find('[appCypressData="cell-value"]');
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
    return MappingSteps.getConfirmation().find('.confirm-btn').should('be.visible').click();
  }

  static reject() {
    return MappingSteps.getConfirmation().find('.cancel-btn').should('be.visible').click();
  }

  // Notifications
  static getNotification() {
    return cy.get('.mat-simple-snackbar');
  }
}

export default MappingSteps;
