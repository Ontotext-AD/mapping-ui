import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HeaderComponent} from 'src/app/main/mapper/header/header.component';
import {SourceComponent} from 'src/app/main/mapper/sources/source.component';
import {TranslateModule} from '@ngx-translate/core';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FlexLayoutModule} from '@angular/flex-layout';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {RdfValueDialog} from 'src/app/main/mapper/mapper.component';
import {FormsModule} from '@angular/forms';
import {MatDialogModule} from '@angular/material/dialog';
import {MatInputModule} from '@angular/material/input';
import {DirectivesModule} from 'src/app/directives/directives.module';
import {CellComponent} from 'src/app/main/mapper/cell/cell.component';
import {IterationComponent} from 'src/app/main/mapper/iteration/iteration.component';


@NgModule({
  declarations: [
    HeaderComponent,
    SourceComponent,
    RdfValueDialog,
    CellComponent,
    IterationComponent,
    RdfValueDialog
  ],
  exports: [
    HeaderComponent,
    CellComponent,
    IterationComponent,
    SourceComponent,
    RdfValueDialog,
  ],
  imports: [
    CommonModule,
    TranslateModule.forRoot(),

    FlexLayoutModule,
    MatFormFieldModule,
    MatButtonModule,
    DragDropModule,
    FormsModule,
    MatDialogModule,
    MatInputModule,
    DirectivesModule,
  ],
})
export class MapperModule { }
