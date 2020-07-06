import { TestBed } from '@angular/core/testing';

import { MappingDefinitionService } from './mapping-definition.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {MatSnackBarModule} from '@angular/material/snack-bar';

describe('MappingDefinitionService', () => {
  let service: MappingDefinitionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        MatSnackBarModule,
      ]
    });
    service = TestBed.inject(MappingDefinitionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
