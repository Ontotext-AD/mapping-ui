import {Triple} from '../models/triple';
import {OBJECT_SELECTOR, PREDICATE_SELECTOR, SUBJECT_SELECTOR} from '../utils/constants';
import {SimpleIRIValueMappingImpl} from '../models/simple-iri-value-mapping-impl';
import {ValueMappingImpl} from '../models/value-mapping-impl';
import {PropertyMappingImpl} from '../models/property-mapping-impl';

export class TriplesModelService {
  static getTripleByIndex(triples: Triple[], index: number): Triple {
    if (index > -1 && index < triples.length) {
      return triples[index];
    }
  }

  static deletePredicateMapping(triple: Triple) {
    if (triple.isTypeProperty) {
      triple.getSubject().setTypeMappings([]);
    } else {
      const propertyMappings = triple.getSubject().getPropertyMappings();
      const index = propertyMappings.indexOf(triple.getPredicate());
      if (index > -1) {
        propertyMappings.splice(index, 1);
      }
    }
  }

  static deleteObjectTypeMapping(triple: Triple, hardDelete: boolean) {
    const typeMappings = triple.getSubject().getTypeMappings();
    const index = typeMappings.indexOf(triple.getObject());
    if (index > -1 && hardDelete) {
      typeMappings.splice(index, 1);
    } else if (index > -1 && !hardDelete) {
      typeMappings.splice(index, 1, new SimpleIRIValueMappingImpl(undefined, undefined));
    }
  }

  static deletePredicate(propertyMappings: Array<PropertyMappingImpl>, propertyMapping: PropertyMappingImpl) {
    const propertyMappingIndex = propertyMappings.indexOf(propertyMapping);
    propertyMappings.splice(propertyMappingIndex, 1);
  }

  static deleteObjectPropertyMapping(triple: Triple, hardDelete: boolean) {
    const propertyMappings = triple.getSubject().getPropertyMappings();
    propertyMappings.forEach((propertyMapping) => {
      // check for object and delete
      const values = propertyMapping.getValues();
      if (values) {
        const index = values.indexOf(triple.getObject() as ValueMappingImpl);
        if (index > -1 && hardDelete) {
          values.splice(index, 1);
          if (values.length === 0) {
            this.deletePredicate(propertyMappings, propertyMapping);
          }
        } else if (index > -1 && !hardDelete) {
          values.splice(index, 1, new ValueMappingImpl(undefined, undefined, undefined));
        }
      } else {
        this.deletePredicate(propertyMappings, propertyMapping);
      }
    });
  }

  static addTriple(triples: Triple[], triple: Triple, level: number) {
    triple.setLevel(level);
    triples.push(triple);
  }

  static createNewTriple(triples: Triple[], triple: Triple, selected?, atIndex?) {
    let index;
    if (atIndex) {
      index = atIndex - 1;
    } else {
      index = triples.length - 2;
    }

    if (selected === SUBJECT_SELECTOR && atIndex === triples.length - 1) {
      return triple.setRoot(true);
    } else if (selected === SUBJECT_SELECTOR && atIndex) {
      return triple.setSubject(triples[index].getSubject());
    } else if (selected === PREDICATE_SELECTOR) {
      return triple.setSubject(triples[index].getSubject());
    } else if (selected === OBJECT_SELECTOR) {
      triple.setSubject(triples[index].getSubject());
      triple.setPredicate(triples[index].getPredicate());
      if (!triple.getPredicate()) {
        return triple.setTypeProperty(true);
      }
      return triple;
    }
  }

  static insertTriple(triples: Triple[], triple: Triple, position: number) {
    const adjustedPosition = position - 1;
    const canAddSubject = triple.getNewMappingRole() === SUBJECT_SELECTOR && !triples[adjustedPosition].isEmpty();
    const canAddPredicate = triple.getNewMappingRole() === PREDICATE_SELECTOR && (!!triples[adjustedPosition].getPredicate() || triples[adjustedPosition].isTypeProperty);
    const canAddObject = triple.getNewMappingRole() === OBJECT_SELECTOR && !!triples[adjustedPosition].getObject();

    if (canAddSubject || canAddPredicate || canAddObject) {
      triples.splice(position, 0, triple);
    }
  }

  static isTripleComplete(triple: Triple): boolean {
    return !!triple.getSubject() && (!!triple.getPredicate() || triple.isTypeProperty) && !!triple.getObject();
  }

  static getRowSize(triple: Triple) {
    const level = triple.getLevel();
    if (level === 0) {
      return '97';
    }
    return '66';
  }

  static getCellSize(triple: Triple) {
    const level = triple.getLevel();
    if (level === 0) {
      return '33';
    }
    return '50';
  }

  static getPreviousTriple(triples: Triple[], prevIndex: number, level: number) {
    prevIndex--;
    if (prevIndex < 0) {
      return undefined;
    }
    let previousRootLevelTriple = triples[prevIndex];
    while (previousRootLevelTriple.getLevel() !== level && prevIndex > 0) {
      prevIndex--;
      previousRootLevelTriple = triples[prevIndex];
    }
    return previousRootLevelTriple;
  }

  static isFirstSubject(triples: Triple[], triple, index) {
    if (index === 0) {
      return true;
    }
    // find previous triple of the same level
    const previousTriple = TriplesModelService.getPreviousTriple(triples, index, triple.getLevel());
    return !previousTriple || triple.getSubject() !== previousTriple.getSubject();
  }

  static isFirstInGroup(triples: Triple[], triple: Triple, index: number) {
    const level = triple.getLevel();
    let isFirst = false;
    if (index > 0) {
      isFirst = triples[index - 1].getLevel() < level;
    }
    return isFirst;
  }

  static isLastInGroup(triples: Triple[], triple: Triple, index: number) {
    const level = triple.getLevel();
    let isLast = false;
    if (level === 0) {
      isLast = false;
    } else {
      const rowsCount = triples.length;
      if (index === rowsCount - 1) {
        isLast = true;
      } else if (index < rowsCount - 1) {
        const nextTripleLevel = triples[index + 1].getLevel();
        // if next triple is nested or is root level we consider current as last in the group
        if (nextTripleLevel > level || nextTripleLevel === 0) {
          isLast = true;
        }
      }
    }
    return isLast;
  }
}
