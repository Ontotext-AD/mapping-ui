import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MapperDialogComponent} from './mapper-dialog.component';
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatRadioModule} from "@angular/material/radio";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {ReactiveFormsModule} from "@angular/forms";
import {MatButtonModule} from "@angular/material/button";
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {Triple} from "src/app/models/triple";

describe('MapperDialogComponent', () => {
  let component: MapperDialogComponent;
  let fixture: ComponentFixture<MapperDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MapperDialogComponent],
      imports: [
        TranslateModule.forRoot(),
        MatFormFieldModule,
        MatRadioModule,
        MatCheckboxModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatDialogModule
      ],
      providers: [
        TranslateService,
        {provide: MatDialogRef, useValue: {}},
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            mappingData: new Triple(undefined, undefined, undefined, false),
            selected: ''
          }
        },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapperDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
