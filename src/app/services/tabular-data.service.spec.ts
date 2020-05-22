import { TestBed } from '@angular/core/testing';

import { TabularDataService } from './tabular-data.service';

describe('TabularDataService', () => {
  let service: TabularDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TabularDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
