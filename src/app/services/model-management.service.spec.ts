import { TestBed } from '@angular/core/testing';

import { ModelManagementService } from './model-management.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';

describe('ModelManagementService', () => {
  let service: ModelManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule
      ]
    });
    service = TestBed.inject(ModelManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
