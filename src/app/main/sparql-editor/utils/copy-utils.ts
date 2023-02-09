/**
 * Contains convenient logic for copying of objects.
 *
 * @author A. Kunchev
 */
export class CopyUtils {
  /**
   * Creates a shallow copy of the given object.
   *
   * @param object to copy
   * @returns shallow copy of the input object
   */
  static spread<T>(object: T): T {
    return object ? {...object} : object;
  }

  /**
   * Creates a copy of the given value.
   *
   * @param value to copy
   * @returns copy of the input value
   */
  static copy<T>(value: T): T {
    if (!value) {
      return value;
    }
    return structuredClone ? structuredClone(value) : JSON.parse(JSON.stringify(value));
  }
}
