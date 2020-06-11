import {Component, Input, OnInit} from '@angular/core';
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


@Component({
  selector: 'app-iteration',
  templateUrl: './iteration.component.html',
  styleUrls: ['./iteration.component.scss'],
})
export class IterationComponent implements OnInit {
  @Input() mapping: MappingDefinitionImpl;
  @Input() sources: Array<Source>;

  SUBJECT = SUBJECT_SELECTOR;
  PREDICATE = PREDICATE_SELECTOR;
  OBJECT = OBJECT_SELECTOR;
  triples: Triple[];
  mappingDetails: MappingDetails;

  constructor(private modelManagementService: ModelManagementService,
              public dialog: MatDialog) {
  }

  ngOnChanges() {
    this.init();
  }

  ngOnInit(): void {
    this.init();
  }

  init() {
    this.triples = [];
    this.convertToTriples(this.mapping);
    this.triples.push(new Triple(undefined, undefined, undefined));
    this.initMappingDetails();
  }

  convertToTriples(mapping) {
    mapping.getSubjectMappings().forEach((subject) => {
      this.setTypeMappings(subject);
      this.setPropertyMappings(subject);
    });
  }

  private initMappingDetails() {
    this.mappingDetails = {} as MappingDetails;
  }

  private setTypeMappings(subject) {
    this.getTypeMappings(subject) && this.getTypeMappings(subject).forEach((mapping) => {
      this.triples.push(new Triple(subject, undefined, mapping, true));
    });
  }

  private setPropertyMappings(subject) {
    this.getPropertyMappings(subject) && this.getPropertyMappings(subject).forEach((property) => {
      property.getValues().forEach((object) => {
        this.triples.push(new Triple(subject, property, object));
        if (object.getValueType().getType() === Type.IRI) {
          this.setTypeMappings(object);
          this.setPropertyMappings(object);
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

  public openMapperDialog($event, triple: Triple, selected, index?) {
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
        sources: this.sources.map((source) => source.title),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.initMappingDetails();
      if (result && result.mappingData.isRoot && result.mappingData.getObject()) {
        this.mapping.getSubjectMappings().push(result.mappingData.getSubject());
        this.init();
      } else if (result && result.mappingData.isRoot && result.selected === this.SUBJECT) {
        this.openMapperDialog(undefined, result.mappingData, this.PREDICATE);
      } else if (result && result.selected === this.PREDICATE && !result.mappingData.getObject()) {
        this.openMapperDialog(undefined, result.mappingData, this.OBJECT);
      } else {
        this.init();
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
    this.mappingDetails.columnName = this.sources[dropped.previousIndex].title;
    this.mappingDetails.source = SourceEnum.Column;
    this.openMapperDialog(undefined, triple, selected, index);
  }
}
