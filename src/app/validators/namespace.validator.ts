import {COLON} from '../utils/constants';
import {Injectable} from '@angular/core';
import {ValidatorResult} from '../models/validator';
import {Namespace} from '../models/namespaces';

@Injectable({
  providedIn: 'root',
})
export class NamespaceValidator {
  static isPrefixValid(prefix: string): boolean {
    return prefix.indexOf(COLON) === -1;
  }

  static isNamespaceValid(namespace: string): boolean {
    return namespace && namespace.trim().length > 0 && namespace.indexOf(COLON) > -1;
  }

  public validate(namespace: Namespace, value: string): ValidatorResult {
    const result = {valid: true, error: null};

    if (!namespace && value.length > 0) {
      result.valid = false;
      result.error = 'ERROR.EMPTY_NAMESPACE';
      return result;
    } else if (!namespace && value.length === 0) {
      result.valid = true;
      return result;
    }

    if (!NamespaceValidator.isPrefixValid(namespace.prefix)) {
      result.valid = false;
      result.error = 'ERROR.COLON_NOT_ALLOWED';
      return result;
    }

    if (!NamespaceValidator.isNamespaceValid(namespace.value)) {
      result.valid = false;
      result.error = 'ERROR.MALFORMED_NAMESPACE';
      return result;
    }

    return result;
  }
}
