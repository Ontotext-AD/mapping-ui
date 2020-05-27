import {MappingDefinition, SubjectMapping} from './mapping-definition';
import {Expose, Type} from 'class-transformer';
import {SubjectMappingImpl} from 'src/app/models/subject-mapping-impl';

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

  public getNamespaces(): { [p: string]: string } {
    return this.namespaces;
  }

  public setNamespaces(value: { [p: string]: string }) {
    this.namespaces = value;
  }

  public getSubjectMappings(): SubjectMappingImpl[] {
    return this.subjectMappings as SubjectMappingImpl[];
  }

  public setSubjectMappings(value: SubjectMapping[]) {
    this.subjectMappings = value;
  }
}
