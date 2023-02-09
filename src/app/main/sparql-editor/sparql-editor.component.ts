import {Component, OnInit, ViewChild} from '@angular/core';
import {OnDestroyMixin, untilComponentDestroyed} from '@w11k/ngx-componentdestroyed';
import {finalize, of} from 'rxjs';
import {SparqlEditorService} from 'src/app/services/rest/sparql-editor.service';
import {MessageService} from 'src/app/services/message.service';
import {MapperService} from 'src/app/services/rest/mapper.service';
import {NotificationService} from 'src/app/services/notification.service';
import {TranslateService} from '@ngx-translate/core';
import {ChannelName} from 'src/app/services/channel-name.enum';
import {FileDownload} from 'src/app/utils/file-download';
import {Source} from 'src/app/models/source';
import {TabConfig, YasguiStorageConfig} from 'src/app/models/sparql-editor/yasgui-storage-config';
import {VisualizationUtils} from './lib-utils-copy/visualization-utils';
import {RenderingMode} from './lib-utils-copy/rendering-mode.enum';
import {DownloadSparqlType, GenerationSparqlType} from 'src/app/models/sparql-editor/sparql-query-type.enum';
import {ChangeEventDetails, LocalStorageService, STORAGE_CHANGE_EVENT_NAME} from 'src/app/services/local-storage.service';
import {SourceService} from 'src/app/services/source.service';
import {RefineRepositoryService} from 'src/app/services/rest/refine-repository.service';
import {EditorUtils} from './utils/editor-utils';
import {CopyUtils} from './utils/copy-utils';


/**
 * The main controller for the SPARQL editor, which contains all of the logic related to the
 * execution of the actions which the user can trigger.
 *
 * The component initializes/loads the configurations required for the Yasgui editor  so that it
 * could be rendered correctly.
 *
 * Note that there are some ugly hacks in here, that may or may not be removed in the future that
 * are needed for some of the functionalities.
 *
 * @author A. Kunchev
 */
@Component({
  selector: 'app-sparql-editor',
  templateUrl: './sparql-editor.component.html',
  styleUrls: ['./sparql-editor.component.scss'],
  providers: [SourceService],
})
export class SparqlEditorComponent extends OnDestroyMixin implements OnInit {
  config: any = {
    query: 'BASE <http://example.com/base/>\n\nSELECT * WHERE {\n  ?s ?p ?o .\n} LIMIT 100',
    showToolbar: false,
    componentId: 'ontotext-yasgui-config',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    yasqeActionButtons: [
      {
        name: 'createSavedQuery',
        visible: false,
      },
      {
        name: 'showSavedQueries',
        visible: false,
      },
      {
        name: 'shareQuery',
        visible: false,
      },
    ],
  };

  sources: Array<Source>;

  @ViewChild('yasgui')
  private editor: any;

  private genTabCounter: number = 0;
  private unstableColumnsFuncWarnGiven: boolean = false;

  // used to calculate diff between the newer and the stored in order to
  // update the state of the 'save' button
  private latestSavedEditorConfig: YasguiStorageConfig;

  constructor(
    private editorService: SparqlEditorService,
    private messageService: MessageService,
    private mapperService: MapperService,
    private notificationService: NotificationService,
    private translateService: TranslateService,
    private storageService: LocalStorageService,
    private refineRepositoryService: RefineRepositoryService) {
    super();
  }

  /**
   * Registers listeners for specific events that are coming from child components.
   */
  ngOnInit(): void {
    this.editorService.getCurrentProjectInfo()
        .pipe(untilComponentDestroyed(this))
        .subscribe((info) => {
          this.initDefaultEditorConfiguration(info);

          this.editorService.getEditorConfiguration()
              .pipe(untilComponentDestroyed(this))
              .subscribe((editorConfig) => this.reloadEditorConfig(editorConfig));

          window.addEventListener(
              STORAGE_CHANGE_EVENT_NAME,
              this.calculateEditorConfigState.bind(this));
        });

    this.messageService.read(ChannelName.SaveEditorConfiguration)
        .pipe(untilComponentDestroyed(this))
        .subscribe(() => this.onSaveEditorConfiguration());

    this.messageService.read(ChannelName.GenerateSparql)
        .pipe(untilComponentDestroyed(this))
        .subscribe((data) => this.onGenerateSparql(data.getMessage()));

    this.messageService.read(ChannelName.DownloadSparql)
        .pipe(untilComponentDestroyed(this))
        .subscribe((data) => this.onDownloadSparql(data.getMessage()));

    this.messageService.read(ChannelName.DownloadRdf)
        .pipe(untilComponentDestroyed(this))
        .subscribe(() => this.onDownloadRdf());

    this.mapperService.getColumns()
        .pipe(untilComponentDestroyed(this))
        .subscribe((data) => this.sources = data);

    this.messageService.read(ChannelName.SwitchRenderingMode)
        .pipe(untilComponentDestroyed(this))
        .subscribe((data) => this.onRenderingModeSwitch(data.getMessage()));

    this.messageService.read(ChannelName.SwitchEditorOrientation)
        .pipe(untilComponentDestroyed(this))
        .subscribe((data) => this.changeOrientation(data.getMessage()));

    this.messageService.read(ChannelName.OpenInGdb)
        .pipe(untilComponentDestroyed(this))
        .subscribe(() => this.onOpenGdbWorkbench());
  }

  ngOnDestroy(): void {
    window.removeEventListener(STORAGE_CHANGE_EVENT_NAME, this.calculateEditorConfigState.bind(this));
  }

  /**
   * Initializes the configurations that is passed to the YASGUI editor.
   */
  private initDefaultEditorConfiguration(info: any): void {
    this.config = {
      ...this.config,
      endpoint: info.refineRepoUrl,
      componentId: info.projectId,
    };
  }

  private reloadEditorConfig(editorConfig: YasguiStorageConfig): void {
    if (!editorConfig) {
      return;
    }

    const tabConfigs = editorConfig.val.tabConfig;
    const tabNamePrefix: string = this.translateService.instant('TABS.GENERATED');
    Object.values(tabConfigs).forEach((item) => {
      // hack to make the query execution btn work...
      item.requestConfig.endpoint = this.config.endpoint;
      this.initTabCounter(item, tabNamePrefix);
    });

    this.storageService.set(this.getStorageKey(), JSON.stringify(editorConfig));
    this.latestSavedEditorConfig = CopyUtils.copy(editorConfig);
  }

  /**
   * Retrieves the key to which is bound the editor configuration in the browser store.
   */
  private getStorageKey(): string {
    return `yagui__${this.config.componentId}`;
  }

  /**
   * Initializes the counter for the generated tabs so that it can continue from the last number.
   */
  private initTabCounter(item: TabConfig, tabNamePrefix: string): void {
    if (!item.name.startsWith(tabNamePrefix)) {
      return;
    }

    // the +1 is for the space character as we only want the number
    const genNumber = item.name.substring(tabNamePrefix.length + 1);
    if (Number(genNumber) > this.genTabCounter) {
      this.genTabCounter = parseInt(genNumber);
    }
  }

  /**
   * Calculates whether there is a significant change in the editor in order to enable the save
   * button.
   */
  private calculateEditorConfigState(event: CustomEvent<ChangeEventDetails>): void {
    if (event.detail.key !== this.getStorageKey()) {
      return;
    }

    const currentConfig = JSON.parse(event.detail.value) || CopyUtils.copy(this.getCurrentYasguiConfig(false));
    if (!currentConfig) {
      return;
    }

    if (!this.latestSavedEditorConfig) {
      // In case there isn't cached config, init the latest with the current.
      // It looks, feels and is a hack to toggle the save button
      this.latestSavedEditorConfig = currentConfig;
      return;
    }

    if (this.latestSavedEditorConfig.time === currentConfig.time) {
      return;
    }

    if (currentConfig.val.active !== this.latestSavedEditorConfig.val.active) {
      this.messageService.publish(ChannelName.EditorConfigurationChanged);
      return;
    }

    this.compareConfigs(this.latestSavedEditorConfig, currentConfig);
  }

  private compareConfigs(
      latestCached: YasguiStorageConfig,
      currentConfig: YasguiStorageConfig): void {
    const activeTab = currentConfig.val.active;
    const latestActiveTabConfig = latestCached.val.tabConfig[activeTab];
    const currentActiveTabConfig = currentConfig.val.tabConfig[activeTab];

    const areTabsDifferent = !this.compare(latestCached.val.tabs, currentConfig.val.tabs);
    const isActiveTabConfigDifferent = !this.compare(latestActiveTabConfig, currentActiveTabConfig);
    const areQueriesDifferent = latestActiveTabConfig?.yasqe?.value !== currentActiveTabConfig?.yasqe?.value;

    if (areTabsDifferent || isActiveTabConfigDifferent || areQueriesDifferent) {
      this.messageService.publish(ChannelName.EditorConfigurationChanged);
    }
  }

  // Slow for large objects.
  // Will return false if the order is different, but the objects aren't different in other way
  // In case we need better and faster comparison, we need to use Underscore, but it has sec issues
  private compare(first: any, second: any): boolean {
    return JSON.stringify(first) === JSON.stringify(second);
  }

  /**
   * Saves the current configuration of the editor as a part of the project metadata.
   */
  private onSaveEditorConfiguration(): void {
    const currentEditorConfig = CopyUtils.copy(this.getCurrentYasguiConfig());
    this.editorService.saveEditorConfigurations(currentEditorConfig)
        .pipe(
            untilComponentDestroyed(this),
            finalize(() => this.messageService.publish(ChannelName.EditorConfigurationSaveCompleted)),
        )
        .subscribe(() => {
          this.latestSavedEditorConfig = currentEditorConfig;
          const message = this.translateService.instant('MESSAGES.EDITOR_CONFIG_SAVED');
          this.notificationService.success(message);
          this.messageService.publish(ChannelName.EditorConfigurationSaveCompleted);
        });
  }

  /**
   * Generates SPARQL query based on specific type and opens it into new tab of the editor.
   * The query generation is done on the backend.
   *
   * @param type of the SPARQL that should be generated
   */
  private onGenerateSparql(type: GenerationSparqlType): void {
    this.editorService.generateQuery(type)
        .pipe(
            untilComponentDestroyed(this),
            finalize(() => this.messageService.publish(ChannelName.SparqlGenerationCompleted)),
        )
        .subscribe((query) => {
          const tabConfig = {
            query: this.tryToFormat(query),
            queryName: `${this.translateService.instant('TABS.GENERATED')} ${++this.genTabCounter}`,
            isPublic: true,
          };
          this.editor.nativeElement.openTab(tabConfig);
          this.messageService.publish(ChannelName.SparqlGenerationCompleted);
        });
  }

  /**
   * Downloads as file, the SPARQL query that is currently placed in the active tab of the editor.
   * When the type of the SparqlType is 'SERVICE', to the query will be added service clause before
   * the download.
   */
  private onDownloadSparql(type: DownloadSparqlType): void {
    const activeTab = this.getActiveTabConfig();
    const sparql = this.tryToFormat(activeTab.yasqe.value);

    let queryAsObservable = of(sparql);
    if (type === DownloadSparqlType.SERVICE) {
      queryAsObservable = this.editorService.setServiceClause(sparql);
    }

    queryAsObservable
        .pipe(
            untilComponentDestroyed(this),
            finalize(() => this.messageService.publish(ChannelName.DownloadCompleted)),
        )
        .subscribe((content) => this.downloadAsFile(`${activeTab.name || 'query'}.sparql`, content));
  }

  private downloadAsFile(name: string, content: string): void {
    FileDownload.downloadFile(name, content);
    this.messageService.publish(ChannelName.DownloadCompleted);
  }

  /**
   * Downloads the RDF result from execution of the query in the currently active tab.
   */
  private onDownloadRdf(): void {
    if (!EditorUtils.isActiveQueryType('construct')) {
      const warning = this.translateService.instant('WARNING.DOWNLOAD_RESULT_AVAILABILITY');
      this.notificationService.warning(warning);
      this.messageService.publish(ChannelName.DownloadCompleted);
      return;
    }

    const activeTab = this.getActiveTabConfig();
    this.refineRepositoryService.executeQuery(activeTab.yasqe.value)
        .pipe(
            untilComponentDestroyed(this),
            finalize(() => this.messageService.publish(ChannelName.DownloadCompleted)),
        )
        .subscribe((result) => this.downloadAsFile(`${activeTab.name || 'rdf-result'}.ttl`, result));
  }

  /**
   * Handles the switching of the rendering mode of the editor.
   */
  private onRenderingModeSwitch(mode: RenderingMode): void {
    if (mode !== RenderingMode.YASGUI) {
      VisualizationUtils.toggleLayoutOrientation(this.editor.nativeElement, true);
    }
    VisualizationUtils.changeRenderMode(this.editor.nativeElement, mode);
    this.messageService.publish(ChannelName.RenderingModeSwitched, mode);
  }

  /**
   * Handles the changing of the layout orientation of the editor.
   * If the editor is not in YASGUI mode, it will be switched.
   */
  private changeOrientation(isVerticalOrientation: boolean): void {
    VisualizationUtils.toggleLayoutOrientation(this.editor.nativeElement, isVerticalOrientation);
    VisualizationUtils.changeRenderMode(this.editor.nativeElement, RenderingMode.YASGUI);
    this.messageService.publish(ChannelName.EditorOrientationSwitched, isVerticalOrientation);
  }

  /**
   * Action handler for the 'Open in GraphDb' button. The method will invoke generation of SPARQL
   * query which will be appended to a URL leading to the connected GraphDB as query parameter.
   * The method will open the Workbench in new browser tab.
   */
  private onOpenGdbWorkbench(): void {
    const sparql = this.getActiveTabConfig().yasqe.value;
    this.editorService.getGraphDbQueryUrl(this.tryToFormat(sparql))
        .pipe(untilComponentDestroyed(this))
        .subscribe((url) => window.parent.open(url));
  }

  /**
   * Handles the click events of the column names in the sources component.
   * When the column name is clicked, it will generate binding for that column and add it to the
   * and of the WHERE clause statements.
   * Additionally, when modifying the query, the method will update the local store as well, because
   * it is not updated when the editor content is edited.
   * The method updates the editor by replacing the entire query that is displayed.
   */
  onColumnNameClick(source: Source): void {
    let sparql = this.getActiveTabConfig().yasqe.value;

    sparql = this.tryToFormat(sparql, true);

    const column = source.getTitle().replace(/\s+/g, '_');
    const updatedSparql = this.insetColumnBinding(sparql, column);

    const newEditorConfig = {...this.getCurrentYasguiConfig()};
    newEditorConfig.val.tabConfig[newEditorConfig.val.active].yasqe.value = updatedSparql;
    this.updateEditorConfiguration(newEditorConfig);
  }

  /**
   * Tries to format the query by using the static methods from the Yasqe object, which should be
   * available in the window object.
   */
  private tryToFormat(sparql: string, notify: boolean = false): string {
    // @ts-ignore
    if (!window.Yasgui && !this.unstableColumnsFuncWarnGiven) {
      if (notify) {
        const warn = this.translateService.instant('WARNING.UNAVAILABLE_YASGUI_INSTANCE');
        this.notificationService.warning(warn);
        // The warning has been given. Their fate is now their own.
        this.unstableColumnsFuncWarnGiven = true;
      }
    } else {
      // @ts-ignore
      sparql = window.Yasgui.Yasqe.autoformatString(sparql);
    }

    return sparql;
  }

  /**
   * Inserts the column binding into the provided sparql. The binding is added to the end of the
   * statements in the WHERE clause of the query.
   */
  private insetColumnBinding(sparql: string, column: string): string {
    const sparqlLines = sparql.split('\n');
    const containsService = /service/i.test(sparql);
    const bindingPosition = this.calculateInsertionPosition(sparqlLines, containsService ? 2 : 1);
    const columnBinding = `${containsService ? '    ' : '  '}BIND(?c_${column} as ?${column})`;
    sparqlLines.splice(bindingPosition, 0, columnBinding);
    const updatedSparql = sparqlLines.join('\n');
    this.editor.nativeElement.setQuery(updatedSparql);
    return updatedSparql;
  }

  /**
   * Calculates the position where the new statements should be inserted, based on the
   * brackets at the end of the query.
   * The logic in the method relies that the query string will be formatted and in certain
   * situations where it is not, the logic may behave in a weird way.
   */
  private calculateInsertionPosition(sparqlLines: string[], bracketsLevel: 1 | 2): number {
    let currentBracketsLevel = 1;
    let position = 0;
    for (let i = sparqlLines.length - 1; i >= 0; i--) {
      if (sparqlLines[i].includes('}')) {
        if (bracketsLevel === 1 || currentBracketsLevel === bracketsLevel) {
          position = i;
          break;
        }

        currentBracketsLevel++;
      }
    }
    return position;
  }

  /**
   * Retrieves the configuration of the currently active tab of the editor.
   */
  private getActiveTabConfig(): TabConfig {
    const currentConfig = this.getCurrentYasguiConfig();
    const activeTab = currentConfig.val.tabConfig[currentConfig.val.active];

    if (activeTab) {
      return activeTab;
    }

    this.notificationService.error(this.translateService.instant('ERROR.NO_ACTIVE_EDITOR_TAB'));
    throw new Error('There are no tabs in the editor.');
  }

  /**
   * Retrieves the current YASGUI configuration from the browser local storage.
   * If the retrieval fails the method will throw an error.
   */
  private getCurrentYasguiConfig(failOnMissingConfig: boolean = true): YasguiStorageConfig {
    if (!this.config.componentId) {
      this.notificationService.error(this.translateService.instant('ERROR.NO_PROJECT_IDENTIFIER'));
      throw new Error('There is no project identifier.');
    }

    const configAsStr = this.storageService.get(this.getStorageKey());
    if (configAsStr) {
      return JSON.parse(configAsStr);
    }

    if (failOnMissingConfig) {
      const errorMsg = this.translateService.instant('ERROR.EDITOR_CONFIG_LOADING_FAILED');
      this.notificationService.error(errorMsg);
      throw new Error('Failed to retrieve the editor configuration from the local browser storage.');
    }

    return null;
  }

  /**
   * Updates the editor configuration stored in the the browser storage.
   */
  private updateEditorConfiguration(configuration: YasguiStorageConfig): void {
    if (!this.config.componentId) {
      this.notificationService.error(this.translateService.instant('ERROR.NO_PROJECT_IDENTIFIER'));
      throw new Error('There is no project identifier.');
    }

    this.storageService.set(this.getStorageKey(), JSON.stringify(configuration));
  }
}
