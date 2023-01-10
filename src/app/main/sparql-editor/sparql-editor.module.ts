import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SparqlEditorComponent} from './sparql-editor.component';
import {EditorHeaderComponent} from './editor-header/editor-header.component';
import {TranslateModule} from '@ngx-translate/core';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';
import {SourceModule} from 'src/app/main/mapper/sources/source.module';
import {MatDividerModule} from '@angular/material/divider';


@NgModule({
  declarations: [
    SparqlEditorComponent,
    EditorHeaderComponent,
  ],
  exports: [
    SparqlEditorComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule.forRoot(),
    MatTooltipModule,
    MatMenuModule,
    MatIconModule,
    SourceModule,
    MatDividerModule,
  ],
  // TODO: why
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SparqlEditorModule { }
