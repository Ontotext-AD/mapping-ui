// Generated using https://app.quicktype.io/ and a JSON schema generated by GraphDB Mapping Java object model


// To parse this data:
//
//   import { Convert, MappingDefinition } from "./file";
//
//   const mappingDefinition = Convert.toMappingDefinition(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface MappingDefinition {
  baseIRI?:         string;
  namespaces?:      { [key: string]: string };
  subjectMappings?: SubjectMapping[];
}

export interface SubjectMapping {
  propertyMappings: PropertyMapping[];
  subject:          SimpleIRIValueMapping;
  typeMappings:     SimpleIRIValueMapping[];
}

export interface IRI {
  propertyMappings?: PropertyMapping[];
  type:              Type;
  typeMappings?:     SimpleIRIValueMapping[];
  language?:         SimpleLiteralValueMapping;
  datatype?:         SimpleIRIValueMapping;
}

export interface ValueMapping {
  transformation?: ValueTransformation;
  valueSource:     Column;
  valueType:       IRI;
}

export interface PropertyMapping {
  property: SimpleIRIValueMapping;
  values:   ValueMapping[];
}

export interface SimpleIRIValueMapping {
  transformation?: ValueTransformation;
  valueSource:     Column;
}

export interface ValueTransformation {
  expression?: string;
  language?:   string;
}

export interface Column {
  columnName?: string;
  source:      Source;
  constant?:   string;
}

export enum Source {
  Column = "column",
  Constant = "constant",
  RecordID = "record_id",
  RowIndex = "row_index",
}

export interface SimpleLiteralValueMapping {
  transformation?: ValueTransformation;
  valueSource:     Column;
}

export enum Type {
  DatatypeLiteral = "datatype_literal",
  IRI = "iri",
  LanguageLiteral = "language_literal",
  Literal = "literal",
  UniqueBnode = "unique_bnode",
  ValueBnode = "value_bnode",
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
  public static toMappingDefinition(json: string): MappingDefinition {
      return cast(JSON.parse(json), r("MappingDefinition"));
  }

  public static toMappingDefinitionFromJson(jsonObject: Object): MappingDefinition {
    return cast(jsonObject, r("MappingDefinition"));
}

  public static mappingDefinitionToJson(value: MappingDefinition): string {
      return JSON.stringify(uncast(value, r("MappingDefinition")), null, 2);
  }
}

function invalidValue(typ: any, val: any): never {
  throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`);
}

function jsonToJSProps(typ: any): any {
  if (typ.jsonToJS === undefined) {
      const map: any = {};
      typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
      typ.jsonToJS = map;
  }
  return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
  if (typ.jsToJSON === undefined) {
      const map: any = {};
      typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
      typ.jsToJSON = map;
  }
  return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any): any {
  function transformPrimitive(typ: string, val: any): any {
      if (typeof typ === typeof val) return val;
      return invalidValue(typ, val);
  }

  function transformUnion(typs: any[], val: any): any {
      // val must validate against one typ in typs
      const l = typs.length;
      for (let i = 0; i < l; i++) {
          const typ = typs[i];
          try {
              return transform(val, typ, getProps);
          } catch (_) {}
      }
      return invalidValue(typs, val);
  }

  function transformEnum(cases: string[], val: any): any {
      if (cases.indexOf(val) !== -1) return val;
      return invalidValue(cases, val);
  }

  function transformArray(typ: any, val: any): any {
      // val must be an array with no invalid elements
      if (!Array.isArray(val)) return invalidValue("array", val);
      return val.map(el => transform(el, typ, getProps));
  }

  function transformDate(val: any): any {
      if (val === null) {
          return null;
      }
      const d = new Date(val);
      if (isNaN(d.valueOf())) {
          return invalidValue("Date", val);
      }
      return d;
  }

  function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
      if (val === null || typeof val !== "object" || Array.isArray(val)) {
          return invalidValue("object", val);
      }
      const result: any = {};
      Object.getOwnPropertyNames(props).forEach(key => {
          const prop = props[key];
          const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
          result[prop.key] = transform(v, prop.typ, getProps);
      });
      Object.getOwnPropertyNames(val).forEach(key => {
          if (!Object.prototype.hasOwnProperty.call(props, key)) {
              result[key] = transform(val[key], additional, getProps);
          }
      });
      return result;
  }

  if (typ === "any") return val;
  if (typ === null) {
      if (val === null) return val;
      return invalidValue(typ, val);
  }
  if (typ === false) return invalidValue(typ, val);
  while (typeof typ === "object" && typ.ref !== undefined) {
      typ = typeMap[typ.ref];
  }
  if (Array.isArray(typ)) return transformEnum(typ, val);
  if (typeof typ === "object") {
      return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
          : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
          : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
          : invalidValue(typ, val);
  }
  // Numbers can be parsed by Date but shouldn't be.
  if (typ === Date && typeof val !== "number") return transformDate(val);
  return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
  return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
  return transform(val, typ, jsToJSONProps);
}

function a(typ: any) {
  return { arrayItems: typ };
}

function u(...typs: any[]) {
  return { unionMembers: typs };
}

function o(props: any[], additional: any) {
  return { props, additional };
}

function m(additional: any) {
  return { props: [], additional };
}

function r(name: string) {
  return { ref: name };
}

const typeMap: any = {
  "MappingDefinition": o([
      { json: "baseIRI", js: "baseIRI", typ: u(undefined, "") },
      { json: "namespaces", js: "namespaces", typ: u(undefined, m("")) },
      { json: "subjectMappings", js: "subjectMappings", typ: u(undefined, a(r("SubjectMapping"))) },
  ], false),
  "SubjectMapping": o([
      { json: "propertyMappings", js: "propertyMappings", typ: a(r("PropertyMapping")) },
      { json: "subject", js: "subject", typ: r("SimpleIRIValueMapping") },
      { json: "typeMappings", js: "typeMappings", typ: a(r("SimpleIRIValueMapping")) },
  ], false),
  "IRI": o([
      { json: "propertyMappings", js: "propertyMappings", typ: u(undefined, a(r("PropertyMapping"))) },
      { json: "type", js: "type", typ: r("Type") },
      { json: "typeMappings", js: "typeMappings", typ: u(undefined, a(r("SimpleIRIValueMapping"))) },
      { json: "language", js: "language", typ: u(undefined, r("SimpleLiteralValueMapping")) },
      { json: "datatype", js: "datatype", typ: u(undefined, r("SimpleIRIValueMapping")) },
  ], false),
  "ValueMapping": o([
      { json: "transformation", js: "transformation", typ: u(undefined, r("ValueTransformation")) },
      { json: "valueSource", js: "valueSource", typ: r("Column") },
      { json: "valueType", js: "valueType", typ: r("IRI") },
  ], false),
  "PropertyMapping": o([
      { json: "property", js: "property", typ: r("SimpleIRIValueMapping") },
      { json: "values", js: "values", typ: a(r("ValueMapping")) },
  ], false),
  "SimpleIRIValueMapping": o([
      { json: "transformation", js: "transformation", typ: u(undefined, r("ValueTransformation")) },
      { json: "valueSource", js: "valueSource", typ: r("Column") },
  ], false),
  "ValueTransformation": o([
      { json: "expression", js: "expression", typ: u(undefined, "") },
      { json: "language", js: "language", typ: u(undefined, "") },
  ], false),
  "Column": o([
      { json: "columnName", js: "columnName", typ: u(undefined, "") },
      { json: "source", js: "source", typ: r("Source") },
      { json: "constant", js: "constant", typ: u(undefined, "") },
  ], false),
  "SimpleLiteralValueMapping": o([
      { json: "transformation", js: "transformation", typ: u(undefined, r("ValueTransformation")) },
      { json: "valueSource", js: "valueSource", typ: r("Column") },
  ], false),
  "Source": [
      "column",
      "constant",
      "record_id",
      "row_index",
  ],
  "Type": [
      "datatype_literal",
      "iri",
      "language_literal",
      "literal",
      "unique_bnode",
      "value_bnode",
  ],
};
