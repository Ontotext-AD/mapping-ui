import {RenderingMode} from './rendering-mode.enum';


/**
 * Utility containing convenient methods for retrieving specific HTML elements related to the YASGUI editor.
 */
export class HtmlElementsUtil {
  /**
   * Fetches the yasgui html element.
   *
   * @param hostElement the host element of "ontotext-yasgui-web-component".
   */
  static getOntotextYasgui(hostElement: HTMLElement): HTMLElement {
    return hostElement.querySelector('.ontotext-yasgui');
  }

  /**
   * Retrieves yasgui toolbar button for specific rendering mode.
   *
   * @param mode the rendering mode
   * @returns the HTML element of the button
   */
  static getRenderModeButton(mode: RenderingMode): HTMLElement {
    return document.querySelector(`.btn-${mode}`);
  }

  /**
   * Fetches the orientation button.
   *
   * @returns the HTML element of the orientation button
   */
  static getOrientationButton(): HTMLElement {
    return document.querySelector('.btn-orientation');
  }

  /**
   * Fetches the toolbar element.
   *
   * @returns the HTML element of the toolbar
   */
  static getToolbar(): HTMLElement {
    return document.querySelector('.yasgui-toolbar');
  }
}
