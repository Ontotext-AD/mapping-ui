/**
 * Contains constants with selectors for the SPARQL Query Editor.
 *
 * @author A. Kunchev
 */
export class SparqlEditorComponentSelectors {
  static readonly TAB_ID = '#mat-tab-label-0-1';
  static readonly YASGUI_HOST = '.sparql-editor-container .yasgui-host-element';
  static readonly YASGUI = '.yasgui';
  static readonly YASGUI_ADD_TAB_BTN = '.addTab';
  static readonly YASQE = '.yasqe';
  static readonly ACTIVE_CODE_MIRROR = '.active .CodeMirror';
  static readonly YASR = '.yasr';
  static readonly SAVE_BTN = '.save-primary';
  static readonly GENERATE_QUERY_BTN = '.template-options';
  static readonly GENERATE_QUERY_MENU = '.queries-template-menu';
  static readonly OPEN_IN_GRAPHDB_BTN = '.open-gdb-primary';
  static readonly DOWNLOAD_BTN = '.download-options';
  static readonly DOWNLOAD_MENU = '.download-menu';
  static readonly EXECUTE_QUERY_BTN = '.yasqe_queryButton';
  static readonly DATASET_COLUMNS_CONTAINER = '.editor-top-header .rdfm-columns-container';
}
