import {MappingDefinition, SubjectMapping} from './mapping-definition';
import {Expose, Type} from 'class-transformer';
import {SubjectMappingImpl} from 'src/app/models/subject-mapping-impl';
import {Namespaces} from './namespaces';

export class MappingDefinitionImpl implements MappingDefinition {
  @Expose() baseIRI?: string;
  @Expose() namespaces?: Namespaces;
  @Expose() @Type(() => SubjectMappingImpl) subjectMappings?: SubjectMapping[];

  constructor(baseIRI: string, namespaces: Namespaces, subjectMappings: SubjectMapping[]) {
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

  public getNamespaces(): Namespaces {
    return this.namespaces;
  }

  public setNamespaces(value: Namespaces) {
    this.namespaces = value;
  }

  public getSubjectMappings(): SubjectMappingImpl[] {
    return this.subjectMappings as SubjectMappingImpl[];
  }

  public setSubjectMappings(value: SubjectMapping[]) {
    this.subjectMappings = value;
  }
}
