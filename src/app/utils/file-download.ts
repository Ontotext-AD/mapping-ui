/**
 * Utility class containing convenient methods for file downloading in the browser.
 *
 * @author A. Kunchev
 */
export class FileDownload {
  /**
   * Initiates download of a file in the browser.
   *
   * @param filename for the file that will be downloaded
   * @param content of the file
   * @param contentType of the data
   */
  static downloadFile(filename: string, content: any, contentType: string = 'text/plain'): void {
    const data = `data:${contentType};charset=utf-8,${encodeURIComponent(content)}`;
    const element = document.createElement('a');
    element.setAttribute('href', data);
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();
    document.body.removeChild(element);
  }
}
