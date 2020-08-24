import {Namespace, Namespaces} from '../models/namespaces';
import {COLON} from '../utils/constants';

export class NamespaceService {
  static getPrefix(prefix) {
    return prefix ? prefix : COLON;
  }

  static toUIModel(namespaces: Namespaces): Namespaces {
    // TODO: maybe add some cache here
    const model = {};
    if (namespaces) {
      this.walkNamespaces(namespaces, ((namespace) => {
        const prefix = this.getPrefix(namespace.prefix);
        const isEmptyPrefix = !namespace.prefix;
        model[prefix] = isEmptyPrefix ? namespaces[''] : namespaces[prefix];
      }));
    }
    return model;
  }

  static mergeNamespaces(ns1: Namespaces, ns2: Namespaces): Namespaces {
    return {...ns1, ...ns2};
  }

  static removeNamespace(namespaces: Namespaces, key: string): void {
    delete namespaces[key];
  }

  static addNamespace(namespaces: Namespaces, namespace: Namespace): void {
    if (namespace) {
      namespaces[namespace.prefix] = namespace.value;
    }
  }

  static toNamespace(prefix: string, value: string): Namespace | undefined {
    return {prefix, value};
  }

  static walkNamespaces(namespaces: Namespaces, cb: (namespace: Namespace) => void) {
    if (namespaces && cb) {
      Object.keys(namespaces).forEach((prefix) => {
        const value = namespaces[prefix];
        cb({prefix, value});
      });
    }
  }
}
