import {MappingDefinition, SubjectMapping} from './mapping-definition';
import {Expose, Type} from 'class-transformer';
import {SubjectMappingImpl} from 'src/app/models/subject-mapping-impl';
import {Namespace} from "./namespace";

export class MappingDefinitionImpl implements MappingDefinition {
  @Expose() baseIRI?: string;
  @Expose() namespaces?: { [p: string]: string };
  @Expose() @Type(() => SubjectMappingImpl) subjectMappings?: SubjectMapping[];

  constructor(baseIRI: string, namespaces: { [p: string]: string }, subjectMappings: SubjectMapping[]) {
    this.baseIRI = baseIRI;
    this.namespaces = namespaces;
    this.subjectMappings = subjectMappings;
  }

  public getBaseIRI(): string {
    return this.baseIRI;
  }

  public setBaseIRI(value: string) {
    this.baseIRI = value;
  }

  public getNamespaces(): Namespace[] {
    console.log(Object.entries(this.namespaces).map(([key, value]) => {
      return new Namespace(key, value);
    }));
    return [];
  }

  public addNamespace(namespace: Namespace) {
    this.namespaces[namespace.getRawPrefix()] = namespace.getValue();
  }

  public removeNamespace(namespace: Namespace) {
    delete this.namespaces[namespace.getRawPrefix()];
  }

  public getSubjectMappings(): SubjectMappingImpl[] {
    return this.subjectMappings as SubjectMappingImpl[];
  }

  public setSubjectMappings(value: SubjectMapping[]) {
    this.subjectMappings = value;
  }
}
