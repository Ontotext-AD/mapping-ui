import {AfterViewInit, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ModelManagementService} from 'src/app/services/model-management.service';
import {PropertyMappingImpl} from 'src/app/models/property-mapping-impl';
import {SimpleIRIValueMappingImpl} from 'src/app/models/simple-iri-value-mapping-impl';
import {MatDialog} from '@angular/material/dialog';
import {MapperDialogComponent} from 'src/app/main/mapper/mapper-dialog/mapper-dialog.component';
import {MappingDefinitionImpl} from 'src/app/models/mapping-definition-impl';
import {Triple} from 'src/app/models/triple';
import {
  OBJECT_SELECTOR,
  PREDICATE_SELECTOR,
  SUBJECT_SELECTOR,
} from 'src/app/utils/constants';
import {Source as SourceEnum, Type} from 'src/app/models/mapping-definition';
import {Source} from 'src/app/models/source';
import {ValueMappingImpl} from 'src/app/models/value-mapping-impl';
import {MappingDetails} from 'src/app/models/mapping-details';
import {SubjectMappingImpl} from 'src/app/models/subject-mapping-impl';
import {Observable, of} from 'rxjs';
import {OnDestroyMixin, untilComponentDestroyed} from '@w11k/ngx-componentdestroyed';
import {DialogService} from 'src/app/main/components/dialog/dialog.service';
import {TranslateService} from '@ngx-translate/core';
import {RepositoryService} from '../../../services/rest/repository.service';


@Component({
  selector: 'app-iteration',
  templateUrl: './iteration.component.html',
  styleUrls: ['./iteration.component.scss'],
})
export class IterationComponent extends OnDestroyMixin implements OnInit, AfterViewInit, OnDestroy {
  @Input() mapping: MappingDefinitionImpl;
  @Input() sources: Array<Source>;
  @Input() onSave: Observable<any>;

  SUBJECT = SUBJECT_SELECTOR;
  PREDICATE = PREDICATE_SELECTOR;
  OBJECT = OBJECT_SELECTOR;
  triples: Triple[];
  mappingDetails: MappingDetails;
  isDirty: boolean = false;
  repoNamespaces: { [key: string]: string };

  private boundCheckDirty: any;

  constructor(private modelManagementService: ModelManagementService,
              public dialog: MatDialog,
              private dialogService: DialogService,
              private translateService: TranslateService,
              private repositoryService: RepositoryService) {
    super();
  }

  ngOnChanges() {
    this.init();
  }

  ngOnInit(): void {
    this.init();
    this.boundCheckDirty = this.checkDirty.bind(this);
    this.onSave
        .pipe(untilComponentDestroyed(this))
        .subscribe(() => {
          this.isDirty = false;
        });
  }

  ngAfterViewInit() {
    window.addEventListener('beforeunload', this.boundCheckDirty);
  }

  init(isDirty?: boolean) {
    if (isDirty) {
      this.isDirty = isDirty;
    }

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
  }

  convertToTriples(mapping) {
    mapping.getSubjectMappings().forEach((subject) => {
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

  private setTypeMappings(subject, isRoot) {
    this.getTypeMappings(subject) && this.getTypeMappings(subject).forEach((mapping) => {
      this.triples.push(new Triple(subject, undefined, mapping, true, isRoot));
      isRoot = false;
    });
    return of(isRoot);
  }

  private setPropertyMappings(subject, isRoot) {
    this.getPropertyMappings(subject) && this.getPropertyMappings(subject).forEach((property) => {
      property.getValues().forEach((object) => {
        this.triples.push(new Triple(subject, property, object, false, isRoot));
        isRoot = false;
        if (object.getValueType() && object.getValueType().getType() === Type.IRI) {
          this.setTypeMappings(object, false);
          this.setPropertyMappings(object, false);
        }
      });
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
      if (result && result.mappingData.isRoot && result.mappingData.getObject()) {
        const subjectMappings = this.mapping.getSubjectMappings();
        const subject = result.mappingData.getSubject();
        const index = subjectMappings.indexOf(subject);
        if (index > -1) {
          subjectMappings.splice(index, 1, subject);
        } else {
          subjectMappings.push(result.mappingData.getSubject());
        }
        this.init(true);
      } else if (result && result.mappingData.isRoot && result.selected === this.SUBJECT) {
        this.openMapperDialog(undefined, result.mappingData, this.PREDICATE);
      } else if (result && result.selected === this.PREDICATE && !result.mappingData.getObject()) {
        this.openMapperDialog(undefined, result.mappingData, this.OBJECT);
      } else {
        this.init(true);
      }
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
    this.openMapperDialog(undefined, triple, this.PREDICATE);
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
      subject.setPropertyMappings([]);
      subject.setTypeMappings([]);
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
}
