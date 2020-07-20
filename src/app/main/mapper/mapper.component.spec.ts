import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MapperComponent} from './mapper.component';
import {HeaderComponent} from "src/app/main/mapper/header/header.component";
import {SourceComponent} from "src/app/main/mapper/sources/source.component";
import {DragDropModule} from "@angular/cdk/drag-drop";
import {TranslateModule} from "@ngx-translate/core";
import {MatDialogModule} from "@angular/material/dialog";
import {MatInputModule} from "@angular/material/input";
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {IterationComponent} from "src/app/main/mapper/iteration/iteration.component";
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {ModelManagementService} from 'src/app/services/model-management.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatIconModule} from "@angular/material/icon";
import {MatChipsModule} from "@angular/material/chips";
import {FlexLayoutModule} from "@angular/flex-layout";
import {DirectivesModule} from "src/app/directives/directives.module";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatTooltipModule} from "@angular/material/tooltip";
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {CellModule} from "src/app/main/mapper/cell/cell.module";
import {NO_ERRORS_SCHEMA} from "@angular/core";

jest.mock("src/app/services/rest/mapping-definition.service")

describe('MapperComponent', () => {
  let component: MapperComponent;
  let fixture: ComponentFixture<MapperComponent>;
  // let model: ModelManagementService = new ModelManagementService(null);
  let modelMock;

  let spy;
  const modelManagementServiceMock = {
    getValueSource: () => {
      return {}},
    removePreview: () => {
      return {}},
    getTypeMappings:  () => {
      return []},
    getStoredModelMapping:  () => {
      return {}},
    getTypeMappings2:  () => {
      return []}
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        MapperComponent,
        HeaderComponent,
        SourceComponent,
        IterationComponent,
      ],
      imports: [
        CellModule,

        DragDropModule,
        TranslateModule.forRoot(),
        MatDialogModule,
        HttpClientTestingModule,
        RouterTestingModule,
        BrowserAnimationsModule,
        FormsModule,
        MatInputModule,
        MatIconModule,
        MatChipsModule,
        FlexLayoutModule,
        DirectivesModule,
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatTooltipModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        MatSlideToggleModule
      ], providers: [
         {provide: ModelManagementService, useValue: {}},
        // ModelManagementService
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    //model = TestBed.get(ModelManagementService);
    // spy = jest.spyOn(model, 'getStoredModelMapping').mockReturnValue(of(plainToClass(MappingDefinitionImpl, amsterdamMapping)));
    // jest.spyOn(model, 'getValueSource').mockReturnValue(null);
    // jest.spyOn(model, 'getStoredModelMapping').mockReturnValue(new BehaviorSubject<any>(""));
    fixture = TestBed.createComponent(MapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();


  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
