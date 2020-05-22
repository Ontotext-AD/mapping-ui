import {TestBed, async} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {AppComponent} from './app.component';
import {MapperComponent} from "src/app/main/mapper/mapper.component";
import {HeaderComponent} from "src/app/main/mapper/header/header.component";
import {SourceComponent} from "src/app/main/mapper/sources/source.component";
import {DragDropModule} from "@angular/cdk/drag-drop";
import {TranslateModule} from "@ngx-translate/core";
import {MatDialogModule} from "@angular/material/dialog";

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        DragDropModule,
        TranslateModule.forRoot(),
        MatDialogModule
      ],
      declarations: [
        AppComponent,
        MapperComponent,
        HeaderComponent,
        SourceComponent
      ]
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'mapping-ui'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('mapping-ui');
  });
});
