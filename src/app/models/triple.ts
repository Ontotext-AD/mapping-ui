import {SubjectMappingImpl} from 'src/app/models/subject-mapping-impl';
import {ValueMappingImpl} from 'src/app/models/value-mapping-impl';
import {PropertyMappingImpl} from 'src/app/models/property-mapping-impl';
import {SimpleIRIValueMappingImpl} from 'src/app/models/simple-iri-value-mapping-impl';

export class Triple {
  subject: SubjectMappingImpl | ValueMappingImpl;
  predicate: PropertyMappingImpl;
  object: ValueMappingImpl | SimpleIRIValueMappingImpl;
  isTypeProperty: boolean;
  isRoot: boolean;
  isIRI: boolean;
  level?: number;
  newMappingRole: string;

  constructor(subject?: SubjectMappingImpl | ValueMappingImpl, predicate?: PropertyMappingImpl,
      object?: ValueMappingImpl | SimpleIRIValueMappingImpl, isTypeProperty?: boolean, isRoot?: boolean, isIRI?: boolean, newMappingRole?: string) {
    this.subject = subject;
    this.predicate = predicate;
    this.object = object;
    this.isTypeProperty = isTypeProperty || false;
    this.isRoot = isRoot;
    this.isIRI = isIRI;
    this.newMappingRole = newMappingRole;
    this.level = 0;
  }

  getSubject() {
    return this.subject;
  }

  setSubject(subject) {
    this.subject = subject;
    return this;
  }

  getPredicate() {
    return this.predicate;
  }

  setPredicate(predicate) {
    this.predicate = predicate;
    return this;
  }

  getObject() {
    return this.object;
  }

  setObject(object) {
    this.object = object;
    return this;
  }

  typeProperty() {
    return this.isTypeProperty;
  }

  setRoot(isRoot: boolean) {
    this.isRoot = isRoot;
    return this;
  }

  setTypeProperty(isTypeProperty: boolean) {
    this.isTypeProperty = isTypeProperty;
    return this;
  }

  setIRI(isIRI: boolean) {
    this.isIRI = isIRI;
    return this;
  }

  getIRI() {
    return this.isIRI;
  }

  getLevel() {
    return this.level;
  }

  setLevel(level: number) {
    this.level = level;
  }
}
