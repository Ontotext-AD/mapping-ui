import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {HeaderComponent} from "src/app/main/mapper/header/header.component";
import { SourceComponent } from 'src/app/main/mapper/sources/source.component';
import {CellComponent} from 'src/app/main/mapper/cell/cell.component';
import {TranslateModule} from "@ngx-translate/core";
import {MatButtonModule} from "@angular/material/button";
import {MatFormFieldModule} from "@angular/material/form-field";
import {FlexLayoutModule} from "@angular/flex-layout";
import {DragDropModule} from "@angular/cdk/drag-drop";
import {RdfValueDialog} from "src/app/main/mapper/mapper.component";
import {FormsModule} from "@angular/forms";
import {MatDialogModule} from "@angular/material/dialog";
import {MatInputModule} from "@angular/material/input";



@NgModule({
  declarations: [
    HeaderComponent,
    SourceComponent,
    CellComponent,
    RdfValueDialog
  ],
  exports: [
    HeaderComponent,
    CellComponent,
    SourceComponent,
    RdfValueDialog
  ],
  imports: [
    CommonModule,
    TranslateModule,

    FlexLayoutModule,
    MatFormFieldModule,
    MatButtonModule,
    DragDropModule,
    FormsModule,
    MatDialogModule,
    MatInputModule
  ]
})
export class MapperModule { }
