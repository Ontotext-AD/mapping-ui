import {RenderingMode} from './rendering-mode.enum';
import {Orientation} from './oprientation.enum';
import {HtmlElementsUtil} from './html-elements-util';


/**
 * Utility containing convenient logic for controlling how the YASGUI will be displayed.
 * The utility relies on specific selectors to process the different elements.
 */
export class VisualizationUtils {
  /**
   * Changes the rendering mode of the YASGUI editor.
   * The method takes care of the buttons selection status as well.
   *
   * @param hostElement the element of the editor
   * @param newMode the new mode in which the editor should be rendered
   */
  static changeRenderMode(hostElement: HTMLElement, newMode: RenderingMode): void {
    VisualizationUtils.unselectAllToolbarButtons();
    const button = HtmlElementsUtil.getRenderModeButton(newMode);
    button.classList.add('btn-selected');

    const modes: string[] = Object.values(RenderingMode);
    hostElement.classList.remove(...modes);
    hostElement.classList.add(newMode);
  }

  /**
   * Changes the icon of the button that changes the orientation of the YASGUI editor.
   *
   * @param newOrientation the new orientation of the YASGUI editor
   */
  static toggleLayoutOrientationButton(newOrientation: Orientation): void {
    const buttonOrientation = HtmlElementsUtil.getOrientationButton();
    if (Orientation.HORIZONTAL === newOrientation) {
      buttonOrientation.classList.add('icon-rotate-quarter');
    } else {
      buttonOrientation.classList.remove('icon-rotate-quarter');
    }
  }

  /**
   * Changes the layout orientation of the YASGUI editor. The method takes care of the button icon
   * switching.
   *
   * @param hostElement the element of the editor
   * @param isVerticalOrientation flag showing whether the current orientation is vertical or not
   */
  static toggleLayoutOrientation(hostElement: HTMLElement, isVerticalOrientation: boolean): void {
    const newOrientation = isVerticalOrientation ? Orientation.VERTICAL : Orientation.HORIZONTAL;
    const orientations: string[] = Object.values(Orientation);
    hostElement.classList.remove(...orientations);
    hostElement.classList.add(newOrientation);

    VisualizationUtils.toggleLayoutOrientationButton(newOrientation);
  }

  /**
   * Removes selection class from all buttons in the YASGUI toolbar.
   *
   * @private
   */
  private static unselectAllToolbarButtons(): void {
    document
        .querySelectorAll('.yasgui-btn')
        .forEach((button) => button.classList.remove('btn-selected'));
  }
}
