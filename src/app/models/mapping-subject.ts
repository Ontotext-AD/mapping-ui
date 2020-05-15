import {MappingDefinition} from "./mapping-definition";

export class MappingSubject implements MappingDefinition {
  mapping: string;

  constructor(mapping) {
    this.mapping = mapping;
  }
}
