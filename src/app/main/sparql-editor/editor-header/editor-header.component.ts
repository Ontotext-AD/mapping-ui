import {Component, OnInit} from '@angular/core';
import {OnDestroyMixin, untilComponentDestroyed} from '@w11k/ngx-componentdestroyed';
import {MessageService} from 'src/app/services/message.service';
import {ChannelName} from 'src/app/services/channel-name.enum';
import {RenderingMode} from '../lib-utils-copy/rendering-mode.enum';
import {DownloadSparqlType, GenerationSparqlType} from 'src/app/models/sparql-editor/sparql-query-type.enum';
import {DIRTY_EDITOR, PRISTINE_EDITOR} from 'src/app/utils/constants';
import {EditorUtils} from '../utils/editor-utils';


/**
 * Component for the header area of the SPARQL editor. It contains button controlling the editor
 * visualization and almost all of the action buttons that are related to the functionalities of
 * the editor.
 *
 * The component communicates with its parent via events that transfer the necessary information
 * for the correct action execution.
 *
 * @author A. Kunchev
 */
@Component({
  selector: 'app-editor-header',
  templateUrl: './editor-header.component.html',
  styleUrls: ['./editor-header.component.scss'],
})
export class EditorHeaderComponent extends OnDestroyMixin implements OnInit {
  downloadingInProgress: boolean;
  generatingSparqlInProgress: boolean;
  savingEditorConfigurationInProgress: boolean;
  editorConfigurationChanged: boolean;

  isEditorVerticallyOriented: boolean;

  isMappingUnsaved: boolean;

  readonly renderingMode = RenderingMode;
  readonly downloadSparqlType = DownloadSparqlType;
  readonly generationSparqlType = GenerationSparqlType;

  constructor(private messageService: MessageService) {
    super();
  }

  /**
   * Registers listeners for specific events.
   */
  ngOnInit(): void {
    this.messageService.read(ChannelName.DownloadCompleted)
        .pipe(untilComponentDestroyed(this))
        .subscribe(() => this.downloadingInProgress = false);

    this.messageService.read(ChannelName.SparqlGenerationCompleted)
        .pipe(untilComponentDestroyed(this))
        .subscribe(() => this.generatingSparqlInProgress = false);

    this.messageService.read(ChannelName.EditorConfigurationSaveCompleted)
        .pipe(untilComponentDestroyed(this))
        .subscribe(() => {
          this.savingEditorConfigurationInProgress = false;
          this.editorConfigurationChanged = false;
          this.notifyParents(PRISTINE_EDITOR);
        });

    this.messageService.read(ChannelName.EditorOrientationSwitched)
        .pipe(untilComponentDestroyed(this))
        .subscribe(() => this.isEditorVerticallyOriented = !this.isEditorVerticallyOriented);

    this.messageService.read(ChannelName.EditorConfigurationChanged)
        .pipe(untilComponentDestroyed(this))
        .subscribe(() => {
          this.editorConfigurationChanged = true;
          this.notifyParents(DIRTY_EDITOR);
        });

    this.messageService.read(ChannelName.DirtyMapping)
        .pipe(untilComponentDestroyed(this))
        .subscribe(() => this.isMappingUnsaved = true);

    this.messageService.read(ChannelName.MappingSaved)
        .pipe(untilComponentDestroyed(this))
        .subscribe(() => this.isMappingUnsaved = false);
  }

  /**
   * Notifies the parents that there was a change in the state of the editor in order for them to
   * toggle warning for unsaved changes, when the window/iframe is closed.
   *
   * This events/messages are process in the scripts for the rdf-mapping-extension (the Ontorefine
   * GitLab repo, where the monstrosity dwells).
   *
   * Additionally: not sure why this is done here, just following the other implementation for the
   * mapper, which in itself is bad enough...
   */
  private notifyParents(message: string): void {
    window.parent.postMessage(message, '*'); // nosonar
  }

  /**
   * Triggers download of the SPARQL that is placed in the currently active tab of the editor.
   *
   * @param type of the SPARQL query to be downloaded
   */
  downloadSparql(type: DownloadSparqlType): void {
    this.downloadingInProgress = true;
    this.messageService.publish(ChannelName.DownloadSparql, type);
  }

  /**
   * Triggers download of the RDF results from the execution of the query that is placed in the
   * currently active tab of the editor.
   */
  downloadRdf(): void {
    this.downloadingInProgress = true;
    this.messageService.publish(ChannelName.DownloadRdf);
  }

  /**
   * Triggers generation of specific SPARQL query template that will be opened in new tab in the editor.
   *
   * @param type of the SPARQL query to be generated
   */
  generateSparql(type: GenerationSparqlType): void {
    this.generatingSparqlInProgress = true;
    this.messageService.publish(ChannelName.GenerateSparql, type);
  }

  /**
   * Triggers switching of the rendering mode for the editor.
   *
   * @param mode rendering mode for the editor
   */
  changeRenderingMode(mode: RenderingMode): void {
    this.messageService.publish(ChannelName.SwitchRenderingMode, mode);
  }

  /**
   * Triggers changing of the editor orientation.
   */
  changeEditorOrientation(): void {
    this.messageService.publish(ChannelName.SwitchEditorOrientation, this.isEditorVerticallyOriented);
  }

  /**
   * Triggers the save of the editor configuration as a part of the project.
   */
  saveEditorConfiguration(): void {
    this.savingEditorConfigurationInProgress = true;
    this.messageService.publish(ChannelName.SaveEditorConfiguration);
  }

  /**
   * Triggers the generation of the SPARQL query which will be opened in GraphDB.
   */
  openInGdb(): void {
    this.messageService.publish(ChannelName.OpenInGdb);
  }

  /**
   * Hacky way to resolve the type of the query that is currently active in the editor.
   *
   * This method controls the state of the download result button
   */
  isQueryTypeConstruct(): boolean {
    return EditorUtils.isActiveQueryType('construct');
  }
}
