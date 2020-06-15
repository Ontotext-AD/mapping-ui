import { TestBed } from '@angular/core/testing';

import { MapperService } from './mapper.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';

describe('ColumnsService', () => {
  let service: MapperService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule
      ]
    });
    service = TestBed.inject(MapperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
