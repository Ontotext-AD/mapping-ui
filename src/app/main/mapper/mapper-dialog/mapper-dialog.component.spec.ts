import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MapperDialogComponent} from './mapper-dialog.component';
import {TranslateModule, TranslateService} from "@ngx-translate/core";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatRadioModule} from "@angular/material/radio";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {ReactiveFormsModule} from "@angular/forms";
import {MAT_DIALOG_DATA, MatDialogModule, MatDialogRef} from "@angular/material/dialog";
import {Triple} from "src/app/models/triple";
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {Observable} from "rxjs";
import {MatIconModule} from "@angular/material/icon";
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonToggleModule} from "@angular/material/button-toggle";
import {MatInputModule} from "@angular/material/input";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatDividerModule} from "@angular/material/divider";



describe('MapperDialogComponent', () => {
  let component: MapperDialogComponent;
  let fixture: ComponentFixture<MapperDialogComponent>;
  const dialogMock = {
    backdropClick: () => {
      return new Observable<any>()},
    keydownEvents: () => {
      return new Observable<any>()},
    updatePosition:  () => {
      return new Observable<any>()},
    updateSize:  () => {
      return new Observable<any>()}
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MapperDialogComponent],
      imports: [
        TranslateModule.forRoot(),
        MatFormFieldModule,
        MatRadioModule,
        MatCheckboxModule,
        ReactiveFormsModule,
        MatDialogModule,
        HttpClientTestingModule,
        RouterTestingModule,
        MatAutocompleteModule,
        MatIconModule,
        MatSnackBarModule,
        MatTooltipModule,
        MatButtonToggleModule,
        MatInputModule,
        BrowserAnimationsModule,
        MatSlideToggleModule,
        MatDividerModule,
      ],
      providers: [
        TranslateService,
        {provide: MatDialogRef,  useValue: dialogMock},
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            mappingData: new Triple(),
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
