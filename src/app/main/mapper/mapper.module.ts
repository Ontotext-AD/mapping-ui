import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HeaderComponent, JSONValueDialog} from 'src/app/main/mapper/header/header.component';
import {SourceComponent} from 'src/app/main/mapper/sources/source.component';
import {TranslateModule} from '@ngx-translate/core';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FlexLayoutModule} from '@angular/flex-layout';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {MapperComponent} from 'src/app/main/mapper/mapper.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatDialogModule} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';
import {DirectivesModule} from 'src/app/directives/directives.module';
import {CellComponent} from 'src/app/main/mapper/cell/cell.component';
import {IterationComponent} from 'src/app/main/mapper/iteration/iteration.component';
import {MapperDialogComponent} from './mapper-dialog/mapper-dialog.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatRadioModule} from '@angular/material/radio';


@NgModule({
  declarations: [
    MapperComponent,
    HeaderComponent,
    SourceComponent,
    JSONValueDialog,
    CellComponent,
    IterationComponent,
    MapperDialogComponent,
  ],
  exports: [
    MapperComponent,
    HeaderComponent,
    CellComponent,
    IterationComponent,
    SourceComponent,
    JSONValueDialog,
  ],
  imports: [
    CommonModule,
    TranslateModule.forRoot(),

    FlexLayoutModule,
    MatFormFieldModule,
    MatButtonModule,
    DragDropModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatInputModule,
    DirectivesModule,
    MatCheckboxModule,
    MatRadioModule,
  ],
})
export class MapperModule { }
