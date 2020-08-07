import {TestBed} from '@angular/core/testing';

import {MapperService} from './mapper.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {MatSnackBarModule} from '@angular/material/snack-bar';

describe('MapperService', () => {
  let service: MapperService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        MatSnackBarModule,
      ]
    });
    service = TestBed.inject(MapperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
