import {
  COLON, COLON_NOT_ALLOWED_KEY,
  EMPTY_NAMESPACE_KEY,
  MALFORMED_NAMESPACE_KEY,
} from '../utils/constants';
import {Injectable} from '@angular/core';
import {ValidatorResult} from '../models/validator';
import {Namespace} from '../models/namespaces';
import {Helper} from '../utils/helper';

@Injectable({
  providedIn: 'root',
})
export class NamespaceValidator {
  static isPrefixValid(prefix: string): boolean {
    return prefix.indexOf(COLON) === -1;
  }

  static isNamespaceValid(namespace: string): boolean {
    return namespace && namespace.trim().length > 0 && namespace.indexOf(COLON) > -1 && Helper.isIRI(namespace);
  }

  public validate(namespace: Namespace): ValidatorResult {
    const result = {valid: true, error: null};

    if (!namespace.value) {
      result.valid = false;
      result.error = EMPTY_NAMESPACE_KEY;
      return result;
    }

    if (!NamespaceValidator.isPrefixValid(namespace.prefix)) {
      result.valid = false;
      result.error = COLON_NOT_ALLOWED_KEY;
      return result;
    }

    if (!NamespaceValidator.isNamespaceValid(namespace.value)) {
      result.valid = false;
      result.error = MALFORMED_NAMESPACE_KEY;
      return result;
    }

    return result;
  }
}
