import {Component, Input} from '@angular/core';
import {SubjectMappingImpl} from 'src/app/models/subject-mapping-impl';
import {ValueMappingImpl} from 'src/app/models/value-mapping-impl';
import {ModelManagementService} from 'src/app/services/model-management.service';
import {PropertyMappingImpl} from 'src/app/models/property-mapping-impl';
import {SimpleIRIValueMappingImpl} from 'src/app/models/simple-iri-value-mapping-impl';

@Component({
  selector: 'app-iteration',
  templateUrl: './iteration.component.html',
  styleUrls: ['./iteration.component.scss'],
})
export class IterationComponent {
    @Input() subject: SubjectMappingImpl | ValueMappingImpl;

    constructor(private modelManagementService: ModelManagementService) {
    }

    ngOnInit(): void {
    }

    getPropertyMappings(): PropertyMappingImpl[] {
      return this.modelManagementService.getPropertyMappings(this.subject);
    }

    getTypeMappings(): SimpleIRIValueMappingImpl[] {
      return this.modelManagementService.getTypeMappings(this.subject);
    }
}
