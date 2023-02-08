/**
 * Utility providing convenient methods used in editor functionalities.
 *
 * @author A. Kunchev
 */
export class EditorUtils {
  /**
   * Checks whether the query in the currently active tab is of specific type.
   *
   * The method uses some questionable logic related to the Yasgui and CodeMirror and
   * probably is not very reliable.
   *
   * @param type expected type of the query
   * @param defaultVal used when the actual type cannot be retrieved
   * @returns true when the expected type matches the actual type of the query in the active tab of
   *          the editor, false otherwise
   */
  static isActiveQueryType(type: 'construct' | 'select', defaultVal: boolean = true) {
    const activeCmElement = document.querySelector('.active .CodeMirror');
    if (!activeCmElement) {
      // can't calculate
      return defaultVal;
    }

    // @ts-ignore
    const activeQueryType: string = activeCmElement.CodeMirror.getQueryType();
    return activeQueryType && activeQueryType.toLowerCase() === type;
  }
}
