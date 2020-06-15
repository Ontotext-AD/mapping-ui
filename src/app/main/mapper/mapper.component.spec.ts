import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapperComponent } from './mapper.component';
import {HeaderComponent} from "src/app/main/mapper/header/header.component";
import {SourceComponent} from "src/app/main/mapper/sources/source.component";
import {DragDropModule} from "@angular/cdk/drag-drop";
import {TranslateModule} from "@ngx-translate/core";
import {MatDialogModule} from "@angular/material/dialog";
import {MatInputModule} from "@angular/material/input";
import {FormsModule} from '@angular/forms';
import {IterationComponent} from "src/app/main/mapper/iteration/iteration.component";
import {CellComponent} from "src/app/main/mapper/cell/cell.component";
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {of} from 'rxjs';
import {ModelManagementService} from 'src/app/services/model-management.service';
import amsterdamMapping from 'src/app/models/amsterdam-mapping.json';
import {plainToClass} from 'class-transformer';
import {MappingDefinitionImpl} from 'src/app/models/mapping-definition-impl';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatIconModule} from "@angular/material/icon";

describe('MapperComponent', () => {
  let component: MapperComponent;
  let fixture: ComponentFixture<MapperComponent>;
  let model: ModelManagementService;
  let spy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        MapperComponent,
        HeaderComponent,
        SourceComponent,
        IterationComponent,
        CellComponent,
      ],
      imports: [
        DragDropModule,
        TranslateModule.forRoot(),
        MatDialogModule,
        HttpClientTestingModule,
        RouterTestingModule,
        BrowserAnimationsModule,
        FormsModule,
        MatInputModule,
        MatIconModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    model = TestBed.get(ModelManagementService);
    spy = jest.spyOn(model, 'getStoredModelMapping').mockReturnValue(of(plainToClass(MappingDefinitionImpl, amsterdamMapping)));
    fixture = TestBed.createComponent(MapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
