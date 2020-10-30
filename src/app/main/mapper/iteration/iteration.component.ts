import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ModelManagementService} from 'src/app/services/model-management.service';
import {PropertyMappingImpl} from 'src/app/models/property-mapping-impl';
import {SimpleIRIValueMappingImpl} from 'src/app/models/simple-iri-value-mapping-impl';
import {MatDialog} from '@angular/material/dialog';
import {MapperDialogComponent} from 'src/app/main/mapper/mapper-dialog/mapper-dialog.component';
import {MappingDefinitionImpl} from 'src/app/models/mapping-definition-impl';
import {Triple} from 'src/app/models/triple';
import {
  COLUMN,
  COMMA,
  DOT,
  OBJECT_SELECTOR,
  PREDICATE_SELECTOR,
  SUBJECT_SELECTOR,
} from 'src/app/utils/constants';
import {Source as SourceEnum, Type} from 'src/app/models/mapping-definition';
import {Source} from 'src/app/models/source';
import {ValueMappingImpl} from 'src/app/models/value-mapping-impl';
import {MappingDetails} from 'src/app/models/mapping-details';
import {SubjectMappingImpl} from 'src/app/models/subject-mapping-impl';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {OnDestroyMixin, untilComponentDestroyed} from '@w11k/ngx-componentdestroyed';
import {DialogService} from 'src/app/main/components/dialog/dialog.service';
import {TranslateService} from '@ngx-translate/core';
import {ModelConstructService} from 'src/app/services/model-construct.service';
import {TypeMapping} from 'src/app/models/type-mapping';
import {TabService} from 'src/app/services/tab.service';
import {RepositoryService} from 'src/app/services/rest/repository.service';
import {Language} from 'src/app/models/language';
import {MappingBase} from 'src/app/models/mapping-base';
import {SourceService} from 'src/app/services/source.service';
import {MessageService} from 'src/app/services/message.service';
import {ChannelName} from 'src/app/services/channel-name.enum';
import {Helper} from 'src/app/utils/helper';
import {classToClass, plainToClass} from 'class-transformer';
import {MapperService} from 'src/app/services/rest/mapper.service';
import {ViewMode} from 'src/app/services/view-mode.enum';
import {NotificationService} from 'src/app/services/notification.service';
import {NamespaceService} from '../../../services/namespace.service';
import {Namespaces} from '../../../models/namespaces';
import {TriplesModelService} from '../../../services/triples-model.service';

@Component({
  selector: 'app-iteration',
  templateUrl: './iteration.component.html',
  styleUrls: ['./iteration.component.scss'],
})
export class IterationComponent extends OnDestroyMixin implements OnInit, AfterViewInit, OnDestroy {
  @Input() rdfMapping: Observable<{mapping: MappingDefinitionImpl, isDirty: boolean}>;
  @Input() sources: Array<Source>;
  @Output() updateMapping: EventEmitter<MappingDefinitionImpl> = new EventEmitter<MappingDefinitionImpl>();

  mapping: MappingDefinitionImpl;
  SUBJECT = SUBJECT_SELECTOR;
  PREDICATE = PREDICATE_SELECTOR;
  OBJECT = OBJECT_SELECTOR;
  triples: Triple[];
  mappingDetails: MappingDetails;
  isDirty: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  repoNamespaces: Namespaces;
  usedSources: Set<string>;

  private boundCheckDirty: any;
  private isPreviewOn = true;
  private viewMode: ViewMode = ViewMode.Configuration;

  constructor(private modelManagementService: ModelManagementService,
              public dialog: MatDialog,
              private dialogService: DialogService,
              private translateService: TranslateService,
              private repositoryService: RepositoryService,
              private modelConstructService: ModelConstructService,
              private tabService: TabService,
              private sourceService: SourceService,
              private messageService: MessageService,
              private mapperService: MapperService,
              private notificationService: NotificationService) {
    super();
  }

  ngOnInit(): void {
    this.messageService.read(ChannelName.ViewMode)
        .pipe(untilComponentDestroyed(this))
        .subscribe((event) => {
          if (this.modelManagementService.isValidMapping(this.mapping)) {
            this.viewMode = event.getMessage().source.buttonToggleGroup.value;
            this.isPreviewOn = this.viewMode === ViewMode.Preview || this.viewMode === ViewMode.PreviewAndConfiguration;
            this.initWithPreview();
          } else {
            event.getMessage().source.buttonToggleGroup.value = this.viewMode;
            this.notificationService.error(this.translateService.instant('MESSAGES.INCOMPLETE_MAPPING_ERROR'));
          }
        });

    this.boundCheckDirty = this.checkDirty.bind(this);

    this.messageService.read(ChannelName.MappingSaved)
        .pipe(untilComponentDestroyed(this))
        .subscribe(() => {
          this.isDirty.next(false);
        });

    this.isDirty.pipe(untilComponentDestroyed(this))
        .subscribe((isDirty) => {
          this.messageService.publish(ChannelName.DirtyMapping, isDirty);
        });

    this.rdfMapping.pipe(untilComponentDestroyed(this))
        .subscribe((rdfMapping) => {
          this.mapping = rdfMapping.mapping;
          this.init(rdfMapping.isDirty);
        });
  }

  ngAfterViewInit() {
    window.addEventListener('beforeunload', this.boundCheckDirty);
  }

  getRowSize(triple: Triple) {
    return TriplesModelService.getRowSize(triple);
  }

  getCellSize(triple: Triple) {
    return TriplesModelService.getCellSize(triple);
  }

  isFirstInGroup(triple: Triple, index: number) {
    return TriplesModelService.isFirstInGroup(this.triples, triple, index);
  }

  isLastInGroup(triple: Triple, index: number) {
    return TriplesModelService.isLastInGroup(this.triples, triple, index);
  }

  initWithPreview(isDirty?: boolean) {
    if (this.shouldPreview()) {
      this.mapperService.preview(classToClass(this.mapping))
          .pipe(untilComponentDestroyed(this))
          .subscribe((data) => {
            this.mapping = plainToClass(MappingDefinitionImpl, data);
            this.init(isDirty);
          });
    } else {
      this.init(isDirty);
    }
  }

  private shouldPreview() {
    return this.hasSubjectMappings() && this.isPreviewApplicable() && this.isCompeteAndValidMapping();
  }

  private hasSubjectMappings() {
    return this.mapping.getSubjectMappings() && this.mapping.getSubjectMappings().length;
  }

  private isPreviewApplicable() {
    return this.isPreviewOn && (this.viewMode === ViewMode.PreviewAndConfiguration || this.viewMode === ViewMode.Preview);
  }

  private isCompeteAndValidMapping() {
    return this.isComplete(this.mapping) && this.modelManagementService.isValidMapping(this.mapping);
  }

  init(isDirty?: boolean) {
    this.updateMapping.emit(this.mapping);
    if (isDirty) {
      this.isDirty.next(isDirty);
    }

    this.usedSources = new Set();
    this.triples = [];
    this.convertToTriples(this.mapping);

    if (this.modelManagementService.isValidMapping(this.mapping)) {
      TriplesModelService.addTriple(this.triples, new Triple(), 0);
    }

    this.initMappingDetails();
    this.repositoryService.getNamespaces()
        .pipe(untilComponentDestroyed(this))
        .subscribe(
            (data: Namespaces) => {
              this.repoNamespaces = data;
            });

    this.sourceService.usedSources.next(this.usedSources);
  }

  getAllNamespaces() {
    return NamespaceService.mergeNamespaces(this.repoNamespaces, this.mapping.namespaces);
  }

  isCompleteCell(subject, isRoot) {
    let isCompleteMapping = true;
    if (isRoot && subject.getPropertyMappings().length === 0 && subject.getTypeMappings().length === 0 &&
      !(subject.getValueType().getType() === Type.UniqueBnode || subject.getValueType().getType() === Type.ValueBnode)) {
      isCompleteMapping = false;
    }
    if (subject.getPropertyMappings()) {
      subject.getPropertyMappings().forEach((propertyMapping) => {
        if (!propertyMapping.getValues() || propertyMapping.getValues().length === 0) {
          isCompleteMapping = false;
        } else {
          let valid = true;
          propertyMapping.getValues().forEach((valueMapping) => {
            valid = valid && this.isCompleteCell(valueMapping, false);
          });
          isCompleteMapping = isCompleteMapping && valid;
        }
      });
    }
    return isCompleteMapping;
  }

  isComplete(mapping: MappingDefinitionImpl): boolean {
    let isCompleteMapping = true;
    mapping.getSubjectMappings().forEach((subject) => {
      isCompleteMapping = isCompleteMapping && this.isCompleteCell(subject, true);
    });
    return isCompleteMapping;
  }

  convertToTriples(mapping: MappingDefinitionImpl): void {
    mapping.getSubjectMappings().forEach((subject) => {
      this.setUsedSources(subject);
      const isRoot = true;
      if (subject.getTypeMappings().length > 0 || subject.getPropertyMappings().length > 0) {
        this.setTypeMappings(subject, isRoot, 0)
            .pipe(untilComponentDestroyed(this))
            .subscribe((root) => {
              this.setPropertyMappings(subject, root, 0);
            });
      } else {
        TriplesModelService.addTriple(this.triples, new Triple(subject, undefined, undefined).setRoot(isRoot), 0);
      }
    });
  }

  private initMappingDetails() {
    this.mappingDetails = {} as MappingDetails;
  }

  private setTypeMappings(subject, isRoot, nestingLevel, isIRI?) {
    const typeMappings = this.getTypeMappings(subject);
    if (typeMappings) {
      typeMappings.forEach((mapping) => {
        this.setUsedSources(mapping);
        const triple = new Triple(subject, undefined, mapping).setTypeProperty(true).setRoot(isRoot).setIRI(isIRI);
        TriplesModelService.addTriple(this.triples, triple, nestingLevel);
        isRoot = false;
      });
    }
    return of(isRoot);
  }

  private setPropertyMappings(subject, isRoot, level, isIRI?) {
    const nestingLevel = level;
    const propertyMappings = this.getPropertyMappings(subject);
    if (propertyMappings) {
      propertyMappings.forEach((property) => {
        this.setUsedSources(property);
        if (property.getValues()) {
          property.getValues().forEach((object) => {
            this.setUsedSources(object);
            TriplesModelService.addTriple(this.triples, new Triple(subject, property, object).setRoot(isRoot).setIRI(isIRI), nestingLevel);
            isRoot = false;
            if (object.getValueType() && (object.getValueType().getType() === Type.IRI ||
              object.getValueType().getType() === Type.UniqueBnode || object.getValueType().getType() === Type.ValueBnode)) {
                this.setTypeMappings(object, false, nestingLevel + 1, true);
                this.setPropertyMappings(object, false, nestingLevel + 1, true);
            }
          });
        } else {
          TriplesModelService.addTriple(this.triples, new Triple(subject, property, undefined).setRoot(isRoot), nestingLevel);
        }
      });
    }
  }

  public isFirstSubject(triple, index) {
    return TriplesModelService.isFirstSubject(this.triples, triple, index);
  }

  public isFirstPredicate(triple, index) {
    if (index === 0) {
      return true;
    }
    const previousTriple = TriplesModelService.getPreviousTriple(this.triples, index, triple.getLevel());
    return !previousTriple || this.isFirstSubject(triple, index) || triple.getPredicate() !== previousTriple.getPredicate();
  }

  public getPropertyMappings(subject): PropertyMappingImpl[] {
    return this.modelManagementService.getPropertyMappings(subject);
  }

  public getTypeMappings(subject): SimpleIRIValueMappingImpl[] {
    return this.modelManagementService.getTypeMappings(subject);
  }

  public openMapperDialog($event, triple: Triple, selected, index?, dropped?) {
    const subject = triple?.getSubject();
    const predicate = triple?.getPredicate();
    const object = triple?.getObject();

    if (!subject && !predicate && !object) {
      triple = TriplesModelService.createNewTriple(this.triples, triple, selected, index);
    }

    const dialogRef = this.dialog.open(MapperDialogComponent, {
      data: {
        mappingData: triple,
        selected,
        mappingDetails: this.mappingDetails,
        sources: this.sources,
        namespaces: this.mapping.namespaces,
        repoNamespaces: this.repoNamespaces,
        dropped,
      },
    });

    dialogRef.afterClosed()
        .pipe(untilComponentDestroyed(this))
        .subscribe((result) => {
          this.initMappingDetails();

          if (result) {
            const editedTriple = result.mappingData;
            this.modelConstructService.setRootMappingInModel(editedTriple, this.mapping);
            if (TriplesModelService.isTripleComplete(editedTriple)) {
              this.initWithPreview(true);
              this.messageService.publish(ChannelName.UpdateMapping, this.mapping);
            }

            const position = result.selected === this.SUBJECT ? 1 : result.selected === this.PREDICATE ? 2 : 3;
            this.tabService.selectCommand.emit({index: this.triples.length - 2, position});
          }
        });
  }

  public continueMapping($event: MouseEvent, index: number) {
    const tripleByIndex = TriplesModelService.getTripleByIndex(this.triples, index);
    const object = tripleByIndex && tripleByIndex.getObject();
    if (object) {
      const triple = new Triple(object as ValueMappingImpl, undefined, undefined).setNewMappingRole(PREDICATE_SELECTOR);
      triple.setLevel(tripleByIndex.getLevel() + 1);
      const allNestedTriplesSize = object.getPropertyMappings().length + object.getTypeMappings().length;
      this.triples.splice(index + allNestedTriplesSize + 1, 0, triple);
    }
  }

  /**
   * Nesting under current triple is applicable when current object is of type IRI.
   *
   * @param index Current row index in the mapping.
   * @return boolean if the nesting is applicable.
   */
  public isNestApplicable(index) {
    const tripleByIndex = TriplesModelService.getTripleByIndex(this.triples, index);
    const object = tripleByIndex && tripleByIndex.getObject();
     return !!(object && object.getValueType() && (object.getValueType().getType() === Type.IRI ||
      object.getValueType().getType() === Type.ValueBnode || object.getValueType().getType() === Type.UniqueBnode));
  }

  public isDeleteApplicable(index) {
    return !!TriplesModelService.getTripleByIndex(this.triples, index).getSubject();
  }

  public onDrop(dropped, triple: Triple, selected, index) {
    if (dropped.item.data instanceof Source) {
      this.handleDroppedSource(dropped, triple, selected, index);
    } else {
      this.openMapperDialog(undefined, triple, selected, index, dropped.item.data);
    }
  }

  private handleDroppedSource(dropped, triple: Triple, selected, index) {
    this.mappingDetails.columnName = dropped.item.data.title;
    this.mappingDetails.source = SourceEnum.Column;
    this.openMapperDialog(undefined, triple, selected, index);
  }

  public onDelete($event: any, triple: Triple, selected: string) {
    if (selected === this.OBJECT && triple.isTypeProperty) {
      TriplesModelService.deleteObjectTypeMapping(triple, false);
    } else if (selected === this.OBJECT) {
      TriplesModelService.deleteObjectPropertyMapping(triple, false);
    } else if (selected === this.PREDICATE) {
      TriplesModelService.deletePredicateMapping(triple);
    } else if (selected === this.SUBJECT) {
      const subject = triple.getSubject();
      if (subject instanceof SubjectMappingImpl) {
        const mappings = this.mapping.getSubjectMappings();
        const index = mappings.indexOf(subject);
        mappings.splice(index, 1);
      } else {
        subject.setPropertyMappings([]);
        subject.setTypeMappings([]);
      }
    }
    this.initWithPreview(true);
  }

  private hasTypeMappings(node) {
    return node && node.getTypeMappings() && node.getTypeMappings().length;
  }

  private hasPropertyMappings(node) {
    return node && node.getPropertyMappings() && node.getPropertyMappings().length;
  }

  private getOnDeleteWarningMessage(triple: Triple): string {
    let hasChildren = false;
    let messageKey = 'MESSAGES.CONFIRM_MAPPING_DELETION';
    const object = triple.getObject();
    if (object) {
      hasChildren = !!(object && (this.hasTypeMappings(object) || this.hasPropertyMappings(object)));
    }
    if (hasChildren) {
      messageKey = 'MESSAGES.CONFIRM_MAPPING_WITH_CHILDREN_DELETION';
    }
    return messageKey;
  }

  public deleteTripleMapping(triple: Triple) {
    const messageKey = this.getOnDeleteWarningMessage(triple);
    this.dialogService.confirm({
      content: this.translateService.instant(messageKey),
    }).pipe(untilComponentDestroyed(this))
        .subscribe((result) => {
          if (result) {
            if (triple.isTypeProperty) {
              TriplesModelService.deleteObjectTypeMapping(triple, true);
            } else {
              TriplesModelService.deleteObjectPropertyMapping(triple, true);
            }

            if (triple.isRoot) {
              let countMappings = triple.getSubject().getTypeMappings().length;
              triple.getSubject().getPropertyMappings().forEach((propertyMapping) => {
                countMappings += propertyMapping.getValues().length;
              });

              if (countMappings === 0) {
                const subjectMappings = this.mapping.getSubjectMappings();
                const index = subjectMappings.indexOf(triple.getSubject() as SubjectMappingImpl);
                subjectMappings.splice(index, 1);
              }
            }
            this.messageService.publish(ChannelName.UpdateMapping, this.mapping);
            this.initWithPreview(true);
          }
        });
  }

  private checkDirty(event) {
    if (this.isDirty) {
      event.preventDefault();
      event.returnValue = '';
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('beforeunload', this.boundCheckDirty);
  }

  public onValueSet(valueSet, triple: Triple, selected: string, index: number) {
    let value = valueSet.value;
    let prefixTransformation = valueSet.prefixTransformation;
    const source = valueSet.source;
    if (selected === this.SUBJECT && index === this.triples.length - 1) {
      triple.setRoot(true);
    } else if (selected === this.PREDICATE && triple.getSubject()) {
      if (value === TypeMapping.a || this.modelConstructService.isTypeMappingPredicate(valueSet.value, valueSet.prefixTransformation)) {
        value = TypeMapping.a;
        prefixTransformation = undefined;
        triple.setTypeProperty(true);
      }
    } else if (selected === this.PREDICATE && !triple.getSubject()) {
      const previousTriple = TriplesModelService.getPreviousTriple(this.triples, index, 0);
      if (!previousTriple) {
        return;
      }

      if (this.modelConstructService.isTypeMappingPredicate(valueSet.value, valueSet.prefixTransformation)) {
        value = TypeMapping.a;
        prefixTransformation = undefined;
      }

      triple.setSubject(previousTriple.getSubject());
      triple.setPredicate(triple.getPredicate());
      if (value === TypeMapping.a) {
        triple.setTypeProperty(true);
      }
    } else if (selected === this.OBJECT && triple.getSubject()) {
      if (!triple.getPredicate()) {
        triple.setTypeProperty(true);
      }
    } else if (selected === this.OBJECT && !triple.getSubject() && this.triples.length > 0) {
      const previousTriple = TriplesModelService.getPreviousTriple(this.triples, index, 0);
      if (!previousTriple) {
        return;
      }
      triple.setSubject(previousTriple.getSubject());
      if (!triple.getPredicate() && !previousTriple.getPredicate()) {
        triple.setTypeProperty(true);
      } else if (!triple.getPredicate() && previousTriple.getPredicate() && !triple.isTypeProperty) {
        triple.setPredicate(previousTriple.getPredicate());
      }
    }

    let prefix;
    if (prefixTransformation) {
      prefix = prefixTransformation;
    } else if (source === SourceEnum.Constant) {
      prefixTransformation = this.modelConstructService.getPrefixTransformation(value, this.getAllNamespaces());
      if (this.modelConstructService.isValidPrefixTransformation(prefixTransformation, value)) {
        prefix = prefixTransformation.prefix;
      }
    }

    const data = {
      constant: source === SourceEnum.Constant ? value : undefined,
      columnName: source === SourceEnum.Column ? value : undefined,
      source,
      type: this.getType(selected, triple, value, prefix),
      typeMapping: triple.isTypeProperty,
      expression: prefix,
      language: prefix ? Language.Prefix.valueOf() : undefined,
    };

    const settings = {
      isConstant: source === SourceEnum.Constant,
      isColumn: source === SourceEnum.Column,
      isTransformation: !!prefix,
      isRoot: selected === this.SUBJECT,
      selected,
      namespaces: this.mapping.namespaces,
      repoNamespaces: this.repoNamespaces,
    };

    if (selected === this.PREDICATE && value === TypeMapping.a) {
      this.modelConstructService.setRootMappingInModel(triple, this.mapping);
    } else {
      const mapping = this.modelConstructService.createMappingObject(data, settings);
      this.modelConstructService.setCellMapping(mapping, data, settings);
      this.modelConstructService.setMappingObjectInTriple(mapping, data, settings, triple);
      this.modelConstructService.setRootMappingInModel(triple, this.mapping);
      if (TriplesModelService.isTripleComplete(triple)) {
        this.messageService.publish(ChannelName.UpdateMapping, this.mapping);
        this.initWithPreview(true);
      }
    }
  }

  private getType(selected: string, triple: Triple, value: string, prefix: string) {
    if (selected === this.OBJECT) {
      return triple.getPredicate() ? (prefix || Helper.isIRI(value) ? Type.IRI : (Type.Literal)) : TypeMapping.a;
    }
    return undefined;
  }

  private setUsedSources(mapping: MappingBase) {
    const valueSource = mapping.getValueSource();
    if (valueSource && valueSource.getSource() === SourceEnum.Column) {
      this.usedSources.add(valueSource.getColumnName());
    }
  }

  public getViewMode() {
    return this.viewMode;
  }

  addNewSibling($event: any, triple: Triple, triplePosition: string, index: number) {
    if (!this.modelManagementService.isValidMapping(this.mapping)) {
      return;
    }

    if (triplePosition === this.SUBJECT) {
      const insertAt = this.triples.length - 1;
      this.tabService.selectedInput.next({index: insertAt, position: 1});
      TriplesModelService.insertTriple(this.triples, new Triple().setNewMappingRole(SUBJECT_SELECTOR), insertAt);
    } else if (triplePosition === this.PREDICATE) {
      let newTripleIndex = index;
      while (triple.getSubject() === this.triples[newTripleIndex].getSubject() || triple.getLevel() < this.triples[newTripleIndex].getLevel()) {
        newTripleIndex++;
      }
      const newTriple = new Triple(triple.getSubject(), undefined, undefined).setNewMappingRole(PREDICATE_SELECTOR);
      newTriple.setLevel(triple.getLevel());
      TriplesModelService.insertTriple(this.triples, newTriple, newTripleIndex);
    } else {
      const newTripleIndex = this.calculateNewTripleIndex(triple, index);
      const newTriple = new Triple(triple.getSubject(), triple.getPredicate(), undefined)
          .setTypeProperty(triple.isTypeProperty)
          .setNewMappingRole(OBJECT_SELECTOR);
      newTriple.setLevel(triple.getLevel());
      TriplesModelService.insertTriple(this.triples, newTriple, newTripleIndex);
    }
  }

  private calculateNewTripleIndex(triple: Triple, index: number): number {
    let newTripleIndex = index - 1;
    let next: boolean;
    do {
      newTripleIndex++;
      const currentTriple = this.triples[newTripleIndex];
      const currentPredicate = currentTriple.getPredicate();
      const targetPredicate = triple.getPredicate();
      const isNested = triple.getLevel() < currentTriple.getLevel();
      const hasEqualPredicates = targetPredicate === currentPredicate;
      // find a spot for the new sibling where its predicate is not the same as the target one
      // and both target triple and new sibling triple should not be type properties which is technically the same as above
      // and the new siblings should not be nested
      next = (targetPredicate && currentPredicate && hasEqualPredicates) || (triple.isTypeProperty && currentTriple.isTypeProperty) || isNested;
    } while (next);
    return newTripleIndex;
  }

  private getRowEnding(triple: Triple) {
    const subject = triple.getSubject();
    if (!subject) {
      return '';
    }
    const typeMappings = subject.getTypeMappings();
    const propertyMappings = subject.getPropertyMappings();
    const object = triple.getObject();
    // Has type mappings
    if (triple.isTypeProperty && typeMappings && typeMappings.length > 0) {
      const lastTypeMapping = typeMappings[typeMappings.length - 1];
      if (object === lastTypeMapping) {
        // This is the last type mapping, but there are other properties on the same subject ;
        if (propertyMappings.length > 0) {
          return COLUMN;
        // This is the last type mapping, no other other properties on the same subject, ends the triple .
        } else {
          return DOT;
        }
      }
      // Not the last type mapping ,
      return COMMA;
    } else if (propertyMappings && propertyMappings.length > 0) {
      const predicate = triple.getPredicate();
      if (!predicate || !predicate.getValues()) {
        return '';
      }
      const predicateValues = predicate.getValues();
      const lastPredicate = propertyMappings[propertyMappings.length - 1];
      const lastObject = predicateValues[predicateValues.length - 1];
      // If it is the last predicate of the subject and the last object if the predicate end with .
      if (predicate === lastPredicate && object === lastObject) {
        return DOT;
      // If it is the last object, but there are other predicates ;
      } else if (object === lastObject) {
        return COLUMN;
      // If is not the last object of the predicate
      } else {
        return COMMA;
      }
    }
    return '';
  }

  getBlockEnd(triple: Triple) {
    const end = this.getRowEnding(triple);
    return end ? 'triples-block-end-' + end : '';
  }
}
