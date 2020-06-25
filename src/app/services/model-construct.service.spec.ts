import {TestBed} from '@angular/core/testing';

import {ModelConstructService} from './model-construct.service';
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {RouterTestingModule} from "@angular/router/testing";

describe('ModelConstructService', () => {
  let service: ModelConstructService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule
      ]
    });
    service = TestBed.inject(ModelConstructService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
