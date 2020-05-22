import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SourceComponent } from 'src/app/main/mapper/sources/source.component';
import {MapperModule} from "src/app/main/mapper/mapper.module";
import {DragDropModule} from "@angular/cdk/drag-drop";
import {TranslateLoader, TranslateModule, TranslateService} from "@ngx-translate/core";
import {HttpLoaderFactory} from "src/app/app.module";
import * as Http from "http";

describe('SourceComponent', () => {
  let component: SourceComponent;
  let fixture: ComponentFixture<SourceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SourceComponent ],
      imports: [
        TranslateModule.forRoot(),
        DragDropModule
      ],
      providers: [TranslateService]

    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
