import { TestBed } from '@angular/core/testing';

import { ColumnsService } from './columns.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";

describe('ColumnsService', () => {
  let service: ColumnsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ]
    });
    service = TestBed.inject(ColumnsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
