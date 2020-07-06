import { TestBed } from '@angular/core/testing';

import { RepositoryService } from './repository.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {MatSnackBarModule} from '@angular/material/snack-bar';


describe('RepositoryService', () => {
  let service: RepositoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        MatSnackBarModule,
      ]
    });
    service = TestBed.inject(RepositoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
