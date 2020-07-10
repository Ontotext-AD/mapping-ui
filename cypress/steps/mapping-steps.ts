/**
 * Common mapping steps.
 */
class MappingSteps {

  // mapping
  static getMapping() {
    return cy.get('.mapping-wrapper');
  }

  static getTriples() {
    return MappingSteps.getMapping().find('.tripple-wraper');
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

  static getTripleSubjectType(index: any) {
    return MappingSteps.getTripleSubject(index).find('.ti-type');
  }

  static getTripleSubjectSource(index: any) {
    return MappingSteps.getTripleSubject(index).find('.ti-source');
  }

  // triple predicate
  static getTriplePredicate(index: any) {
    return MappingSteps.getTriple(index).find('.triple-item').eq(1);
  }

  // triple object
  static getTripleObject(index: any) {
    return MappingSteps.getTriple(index).find('.triple-item').eq(2);
  }

  static getTripleObjectType(index: any) {
    return MappingSteps.getTripleObject(index).find('.ti-type');
  }

  static getTripleObjectSource(index: any) {
    return MappingSteps.getTripleObject(index).find('.ti-source');
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
}

export default MappingSteps;
