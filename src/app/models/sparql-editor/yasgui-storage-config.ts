/**
 * Represents the configuration that is stored in the browser local storage for the YASGUI editor.
 * The interface is a wrapping type that contains the actual editor configuration plus additional
 * metadata.
 */
export interface YasguiStorageConfig {

  namespace: string,
  val: EditorConfig,
  time: number,
  exp: number,
}

/**
 * Represents the actual value of the editor configuration. It holds the information about the
 * tabs and the endpoints.
 */
export interface EditorConfig {

  endpointHistory: Array<string>,
  tabs: Array<string>,
  active: string,
  tabConfig: { [value: string]: TabConfig },
  lastClosedTab?: {
    index: number,
    tab: TabConfig
  }
}

/**
 * Represents a single tab configuration.
 */
export interface TabConfig {

  id: string,
  name: string,
  yasqe: {
    value: string
  },
  yasr: {
    settings: {
      selectedPlugin: string,
      pluginsConfig: object
    }
  },
  requestConfig: TabRequestConfig
}

/**
 * Represents a request configuration for the tabs of the editor.
 */
export interface TabRequestConfig {

  endpoint: string,
  method: 'POST' | 'GET',
  acceptHeaderGraph: string
  acceptHeaderSelect: string,
  acceptHeaderUpdate: string,
  namedGraphs: Array<any>,
  defaultGraphs: Array<any>,
  args: Array<any>,
  withCredentials: boolean,
  adjustQueryBeforeRequest: boolean
}
