import {Component, Input, OnInit} from '@angular/core';
import {ModelManagementService} from 'src/app/services/model-management.service';
import {PropertyMappingImpl} from 'src/app/models/property-mapping-impl';
import {SimpleIRIValueMappingImpl} from 'src/app/models/simple-iri-value-mapping-impl';
import {MatDialog} from '@angular/material/dialog';
import {MapperDialogComponent} from 'src/app/main/mapper/mapper-dialog/mapper-dialog.component';
import {MappingDefinitionImpl} from 'src/app/models/mapping-definition-impl';
import {Triple} from 'src/app/models/triple';
import {OBJECT_SELECTOR, PREDICATE_SELECTOR, SUBJECT_SELECTOR} from 'src/app/utils/constants';
import {Type} from 'src/app/models/mapping-definition';

@Component({
  selector: 'app-iteration',
  templateUrl: './iteration.component.html',
  styleUrls: ['./iteration.component.scss'],
})
export class IterationComponent implements OnInit {
  @Input() mapping: MappingDefinitionImpl;

  SUBJECT = SUBJECT_SELECTOR;
  PREDICATE = PREDICATE_SELECTOR;
  OBJECT = OBJECT_SELECTOR;
  triples: Triple[];

  constructor(private modelManagementService: ModelManagementService,
              public dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.init();
  }

  init(): void {
    this.triples = [];
    this.convertToTriples(this.mapping);
  }

  convertToTriples(mapping) {
    mapping.getSubjectMappings().forEach((subject) => {
      this.setTypeMappings(subject);
      this.setPropertyMappings(subject);
    });
  }

  private setTypeMappings(subject) {
    this.getTypeMappings(subject).forEach((mapping) => {
      this.triples.push(new Triple(subject, undefined, mapping, true));
    });
  }

  private setPropertyMappings(subject) {
    this.getPropertyMappings(subject).forEach((property) => {
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

  public openMapperDialog($event, item, selected) {
    const dialogRef = this.dialog.open(MapperDialogComponent, {
      data: {
        mappingData: item,
        selected,
      },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.init();
    });
  }
}
