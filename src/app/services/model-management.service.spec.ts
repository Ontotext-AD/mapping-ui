import { TestBed } from '@angular/core/testing';

import { ModelManagementService } from './model-management.service';

describe('ModelManagementService', () => {
  let service: ModelManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModelManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
