import {AfterViewInit, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ModelManagementService} from 'src/app/services/model-management.service';
import {PropertyMappingImpl} from 'src/app/models/property-mapping-impl';
import {SimpleIRIValueMappingImpl} from 'src/app/models/simple-iri-value-mapping-impl';
import {MatDialog} from '@angular/material/dialog';
import {MapperDialogComponent} from 'src/app/main/mapper/mapper-dialog/mapper-dialog.component';
import {MappingDefinitionImpl} from 'src/app/models/mapping-definition-impl';
import {Triple} from 'src/app/models/triple';
import {OBJECT_SELECTOR, PREDICATE_SELECTOR, SUBJECT_SELECTOR} from 'src/app/utils/constants';
import {Source as SourceEnum, Type} from 'src/app/models/mapping-definition';
import {Source} from 'src/app/models/source';
import {ValueMappingImpl} from 'src/app/models/value-mapping-impl';
import {MappingDetails} from 'src/app/models/mapping-details';
import {SubjectMappingImpl} from 'src/app/models/subject-mapping-impl';
import {BehaviorSubject, of} from 'rxjs';
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
import {Helper} from '../../../utils/helper';


@Component({
  selector: 'app-iteration',
  templateUrl: './iteration.component.html',
  styleUrls: ['./iteration.component.scss'],
})
export class IterationComponent extends OnDestroyMixin implements OnInit, AfterViewInit, OnDestroy {
  @Input() mapping: MappingDefinitionImpl;
  @Input() sources: Array<Source>;

  SUBJECT = SUBJECT_SELECTOR;
  PREDICATE = PREDICATE_SELECTOR;
  OBJECT = OBJECT_SELECTOR;
  triples: Triple[];
  mappingDetails: MappingDetails;
  isDirty: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  repoNamespaces: { [key: string]: string };
  usedSources: Set<string>;

  private boundCheckDirty: any;

  constructor(private modelManagementService: ModelManagementService,
              public dialog: MatDialog,
              private dialogService: DialogService,
              private translateService: TranslateService,
              private repositoryService: RepositoryService,
              private modelConstructService: ModelConstructService,
              private tabService: TabService,
              private sourceService: SourceService,
              private messageService: MessageService) {
    super();
  }

  ngOnChanges() {
    this.init();
  }

  ngOnInit(): void {
    this.init();
    this.boundCheckDirty = this.checkDirty.bind(this);

    this.messageService.read(ChannelName.MappingSaved)
        .pipe(untilComponentDestroyed(this))
        .subscribe(() => {
          this.isDirty.next(false);
        });

    this.isDirty.subscribe((isDirty) => this.messageService.publish(ChannelName.DirtyMapping, isDirty));
  }

  ngAfterViewInit() {
    window.addEventListener('beforeunload', this.boundCheckDirty);
  }

  init(isDirty?: boolean) {
    if (isDirty) {
      this.isDirty.next(isDirty);
    }

    this.usedSources = new Set();
    this.triples = [];
    this.convertToTriples(this.mapping);
    this.triples.push(new Triple(undefined, undefined, undefined));
    this.initMappingDetails();
    this.repositoryService.getNamespaces()
        .pipe(untilComponentDestroyed(this))
        .subscribe(
            (data) => {
              this.repoNamespaces = data;
            });

    this.sourceService.usedSources.next(this.usedSources);
  }

  getAllNamespaces() {
    return {...this.repoNamespaces, ...this.mapping.namespaces};
  }


  convertToTriples(mapping) {
    mapping.getSubjectMappings().forEach((subject) => {
      this.setUsedSources(subject);
      const isRoot = true;
      if (subject.getTypeMappings().length > 0 || subject.getPropertyMappings().length > 0) {
        this.setTypeMappings(subject, isRoot)
            .pipe(untilComponentDestroyed(this))
            .subscribe((isRoot) => {
              this.setPropertyMappings(subject, isRoot);
            });
      } else {
        this.triples.push(new Triple(subject, undefined, undefined, false, isRoot));
      }
    });
  }

  private initMappingDetails() {
    this.mappingDetails = {} as MappingDetails;
  }

  private setTypeMappings(subject, isRoot, isIRI?) {
    this.getTypeMappings(subject) && this.getTypeMappings(subject).forEach((mapping) => {
      this.setUsedSources(mapping);
      this.triples.push(new Triple(subject, undefined, mapping, true, isRoot, isIRI));
      isRoot = false;
    });
    return of(isRoot);
  }

  private setPropertyMappings(subject, isRoot, isIRI?) {
    this.getPropertyMappings(subject) && this.getPropertyMappings(subject).forEach((property) => {
      this.setUsedSources(property);
      if (property.getValues()) {
        property.getValues().forEach((object) => {
          this.setUsedSources(object);
          this.triples.push(new Triple(subject, property, object, false, isRoot, isIRI));
          isRoot = false;
          if (object.getValueType() && object.getValueType().getType() === Type.IRI) {
            this.setTypeMappings(object, false, true);
            this.setPropertyMappings(object, false, true);
          }
        });
      } else {
        this.triples.push(new Triple(subject, property, undefined, false, isRoot));
      }
    });
  }

  isFirstSubject(mapping, index) {
    if (index === 0) {
      return true;
    }
    return mapping.getSubject() !== this.triples[index - 1].getSubject();
  }

  isFirstPredicate(mapping, index) {
    if (index === 0) {
      return true;
    }
    return mapping.getPredicate() !== this.triples[index - 1].getPredicate();
  }

  getPropertyMappings(subject): PropertyMappingImpl[] {
    return this.modelManagementService.getPropertyMappings(subject);
  }

  getTypeMappings(subject): SimpleIRIValueMappingImpl[] {
    return this.modelManagementService.getTypeMappings(subject);
  }

  public openMapperDialog($event, triple: Triple, selected, index?, dropped?) {
    const subject = triple && triple.getSubject();
    const predicate = triple && triple.getPredicate();
    const object = triple && triple.getObject();

    if (!subject && !predicate && !object) {
      triple = this.createNewTriple(triple, selected, index);
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

    dialogRef.afterClosed().subscribe((result) => {
      this.initMappingDetails();
      if (result.selected === this.PREDICATE && result.mappingData.isTypeProperty) {
        this.modelConstructService.setRootMappingInModel(result.mappingData, this.mapping);
      } else {
        this.modelConstructService.setRootMappingInModel(result.mappingData, this.mapping);
        this.init(true);
      }

      const position = result.selected === this.SUBJECT ? 1 : result.selected === this.PREDICATE ? 2 : 3;
      this.tabService.selectCommand.emit({index: this.triples.length - 2, position});
    });
  }

  private createNewTriple(triple: Triple, selected?, atIndex?) {
    const index = this.setIndex(atIndex);

    if (selected === this.SUBJECT && atIndex === this.triples.length - 1) {
      return triple.setRoot(true);
    } else if (selected === this.SUBJECT && atIndex) {
      return triple.setSubject(this.triples[index].getSubject());
    } else if (selected === this.PREDICATE) {
      return triple.setSubject(this.triples[index].getSubject());
    } else if (selected === this.OBJECT) {
      triple.setSubject(this.triples[index].getSubject());
      triple.setPredicate(this.triples[index].getPredicate());
      if (!triple.getPredicate()) {
        return triple.setTypeProperty(true);
      }
      return triple;
    }
  }

  private setIndex(atIndex): number {
    if (atIndex) {
      return atIndex - 1;
    }
    return this.triples.length - 2;
  }

  continueMapping($event: MouseEvent, mapping: Triple, index: number) {
    const object = this.getTripleByIndex(index) && this.getTripleByIndex(index).getObject();
    const triple = new Triple(object as ValueMappingImpl, undefined, undefined);
    this.triples.splice(index + 1, 0, triple);
  }

  public isPlusApplicable(index) {
    const object = this.getTripleByIndex(index) && this.getTripleByIndex(index).getObject();
    const subject = this.getTripleByIndex(index + 1) && this.getTripleByIndex(index + 1).getSubject();
    return object && subject !== object && object.getValueType() && object.getValueType().getType() === Type.IRI;
  }

  public isDeleteApplicable(index) {
    return !!this.getTripleByIndex(index).getSubject();
  }

  private getTripleByIndex(index: number): Triple {
    if (index > -1 && index < this.triples.length) {
      return this.triples[index];
    }
  }

  public isInsertApplicable(index: number) {
    return index < this.triples.length - 2;
  }

  public insertMapping($event: MouseEvent, mapping: Triple, index: number) {
    this.triples.splice(index + 1, 0, new Triple(undefined, undefined, undefined));
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

  public onDelete($event: any, mapping: Triple, selected: string) {
    if (selected === this.OBJECT && mapping.isTypeProperty) {
      this.deleteObjectTypeMapping(mapping, true);
    } else if (selected === this.OBJECT) {
      this.deleteObjectPropertyMapping(mapping, false);
    } else if (selected === this.PREDICATE) {
      const propertyMappings = mapping.getSubject().getPropertyMappings();
      const index = propertyMappings.indexOf(mapping.getPredicate());
      if (index > -1) {
        propertyMappings.splice(index, 1);
      }
    } else if (selected === this.SUBJECT) {
      const subject = mapping.getSubject();
      if (subject instanceof SubjectMappingImpl) {
        const mappings = this.mapping.getSubjectMappings();
        const index = mappings.indexOf(subject);
        mappings.splice(index, 1);
      } else {
        subject.setPropertyMappings([]);
        subject.setTypeMappings([]);
      }
    }
    this.init(true);
  }

  private deleteObjectTypeMapping(mapping: Triple, hardDelete: boolean) {
    const typeMappings = mapping.getSubject().getTypeMappings();
    const index = typeMappings.indexOf(mapping.getObject());
    if (index > -1 && hardDelete) {
      typeMappings.splice(index, 1);
    } else if (index > -1 && !hardDelete) {
      typeMappings.splice(index, 1, new SimpleIRIValueMappingImpl(undefined, undefined));
    }
  }

  private deleteObjectPropertyMapping(mapping: Triple, hardDelete: boolean) {
    const propertyMappings = mapping.getSubject().getPropertyMappings();
    propertyMappings.forEach((propertyMapping) => {
      const values = propertyMapping.getValues();
      const index = values.indexOf(mapping.getObject() as ValueMappingImpl);
      if (index > -1 && hardDelete) {
        values.splice(index, 1);
        if (values.length === 0) {
          const propertyMappingIndex = propertyMappings.indexOf(propertyMapping);
          propertyMappings.splice(propertyMappingIndex, 1);
        }
      } else if (index > -1 && !hardDelete) {
        values.splice(index, 1, new ValueMappingImpl(undefined, undefined, undefined));
      }
    });
  }

  public deleteTripleMapping(mapping: Triple) {
    this.dialogService.confirm({
      content: this.translateService.instant('MESSAGES.CONFIRM_MAPPING_DELETION'),
    }).pipe(untilComponentDestroyed(this))
        .subscribe((result) => {
          if (result) {
            if (mapping.isTypeProperty) {
              this.deleteObjectTypeMapping(mapping, true);
            } else {
              this.deleteObjectPropertyMapping(mapping, true);
            }

            if (mapping.isRoot) {
              let countMappings = mapping.getSubject().getTypeMappings().length;
              mapping.getSubject().getPropertyMappings().forEach((propertyMapping) => {
                countMappings += propertyMapping.getValues().length;
              });

              if (countMappings === 0) {
                const subjectMappings = this.mapping.getSubjectMappings();
                const index = subjectMappings.indexOf(mapping.getSubject() as SubjectMappingImpl);
                subjectMappings.splice(index, 1);
              }
            }
            this.init(true);
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
    const value = valueSet.value;
    const source = valueSet.source;
    const previousTriple = this.triples[index - 1];
    if (selected === this.SUBJECT && index === this.triples.length - 1) {
      triple.setRoot(true);
    } else if (selected === this.PREDICATE && triple.getSubject()) {
      if (value === TypeMapping.a) {
        triple.setTypeProperty(true);
      }
    } else if (selected === this.PREDICATE && !triple.getSubject()) {
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
      triple.setSubject(previousTriple.getSubject());
      if (!triple.getPredicate() && !previousTriple.getPredicate()) {
        triple.setTypeProperty(true);
      } else if (!triple.getPredicate() && previousTriple.getPredicate() && !triple.isTypeProperty) {
        triple.setPredicate(previousTriple.getPredicate());
      }
    }
    let prefixTransformation;
    if (source === SourceEnum.Constant) {
      prefixTransformation = this.modelConstructService.getPrefixTransformation(value, this.getAllNamespaces());
    }
    const prefix = prefixTransformation && prefixTransformation.prefix;

    const data = {
      constant: source === SourceEnum.Constant ? value : undefined,
      columnName: source === SourceEnum.Column ? value : undefined,
      source: source,
      type: this.getType(selected, triple, value),
      typeMapping: triple.isTypeProperty,
      expression: prefix ? prefixTransformation.prefix : undefined,
      language: prefix ? Language.Prefix.valueOf() : undefined,
    };

    const settings = {
      isConstant: source === SourceEnum.Constant,
      isColumn: source === SourceEnum.Column,
      isTransformation: !!prefix,
      isRoot: selected === this.SUBJECT,
      selected: selected,
      namespaces: this.getAllNamespaces(),
    };

    if (selected === this.PREDICATE && value === TypeMapping.a) {
      this.modelConstructService.setRootMappingInModel(triple, this.mapping);
    } else {
      const mapping = this.modelConstructService.createMappingObject(data, settings);
      this.modelConstructService.setCellMapping(mapping, data, settings);
      this.modelConstructService.setMappingObjectInTriple(mapping, data, settings, triple);
      this.modelConstructService.setRootMappingInModel(triple, this.mapping);
      this.init(true);
    }
  }

  private getType(selected: string, triple: Triple, value: string) {
    if (selected === this.OBJECT) {
      return triple.getPredicate() ? (Helper.isIRI(value) ? Type.IRI : (Type.Literal)) : TypeMapping.a;
    }
    return undefined;
  }

  private setUsedSources(mapping: MappingBase) {
    const valueSource = mapping.getValueSource();
    if (valueSource && valueSource.getSource() === SourceEnum.Column) {
      this.usedSources.add(valueSource.getColumnName());
    }
  }
}
