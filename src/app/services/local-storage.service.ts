import {Injectable} from '@angular/core';

export const STORAGE_CHANGE_EVENT_NAME = 'storage_change_event';

/**
 * Service wrapping the Storage functionality. Additionally the service creates a Proxy over the
 * methods that are modifying the storage in order to add notification via event dispatching.
 *
 * @author A. Kunchev
 */
@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  constructor() {
    this.proxySetItem();
    this.proxyRemoveItem();
    this.proxyClear();
  }

  /**
   * Retrieves value from the store.
   *
   * @param key of the value that needs to be retrieved
   * @returns the found value or null if there is no value
   */
  get(key: string): string {
    return localStorage.getItem(key);
  }

  /**
   * Sets new value to a specific property in the store.
   *
   * @param key of the property
   * @param value of the property
   */
  set(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  /**
   * Removes property from the store.
   *
   * @param key of the property that should be removed
   */
  remove(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Clears all properties from the store.
   */
  clear(): void {
    localStorage.clear();
  }

  private proxySetItem(): void {
    Storage.prototype.setItem = new Proxy(Storage.prototype.setItem, {
      apply(target, thisArg, argumentList) {
        const event = new CustomEvent(STORAGE_CHANGE_EVENT_NAME, {
          detail: {
            key: argumentList[0],
            type: 'set',
          },
        });
        window.dispatchEvent(event);
        return Reflect.apply(target, thisArg, argumentList);
      },
    });
  }

  private proxyRemoveItem(): void {
    Storage.prototype.removeItem = new Proxy(Storage.prototype.removeItem, {
      apply(target, thisArg, argumentList) {
        const event = new CustomEvent(STORAGE_CHANGE_EVENT_NAME, {
          detail: {
            key: argumentList[0],
            type: 'remove',
          },
        });
        window.dispatchEvent(event);
        return Reflect.apply(target, thisArg, argumentList);
      },
    });
  }

  private proxyClear(): void {
    Storage.prototype.clear = new Proxy(Storage.prototype.clear, {
      apply(target, thisArg, argumentList) {
        const event = new CustomEvent(STORAGE_CHANGE_EVENT_NAME, {
          detail: {
            key: '__all__',
            type: 'clear',
          },
        });
        window.dispatchEvent(event);
        return Reflect.apply(target, thisArg, argumentList);
      },
    });
  }
}
