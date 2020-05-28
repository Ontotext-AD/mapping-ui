import { TestBed } from '@angular/core/testing';

import { ColumnsService } from './columns.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';

describe('ColumnsService', () => {
  let service: ColumnsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule
      ]
    });
    service = TestBed.inject(ColumnsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
