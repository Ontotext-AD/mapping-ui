import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapperComponent } from './mapper.component';
import {HeaderComponent} from "src/app/main/mapper/header/header.component";
import {SourceComponent} from "src/app/main/mapper/sources/source.component";
import {DragDropModule} from "@angular/cdk/drag-drop";
import {TranslateModule} from "@ngx-translate/core";
import {MatDialogModule} from "@angular/material/dialog";
import {IterationComponent} from "src/app/main/mapper/iteration/iteration.component";
import {CellComponent} from "src/app/main/mapper/cell/cell.component";
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';



describe('MapperComponent', () => {
  let component: MapperComponent;
  let fixture: ComponentFixture<MapperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        MapperComponent,
        HeaderComponent,
        SourceComponent,
        IterationComponent,
        CellComponent
      ],
      imports: [
        DragDropModule,
        TranslateModule.forRoot(),
        MatDialogModule,
        HttpClientTestingModule,
        RouterTestingModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
