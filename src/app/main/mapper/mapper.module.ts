import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {HeaderComponent} from "src/app/main/mapper/header/header.component";
import { SourceComponent } from 'src/app/main/mapper/sources/source.component';
import {TranslateModule} from "@ngx-translate/core";
import {MatButtonModule} from "@angular/material/button";
import {MatFormFieldModule} from "@angular/material/form-field";
import {FlexLayoutModule} from "@angular/flex-layout";
import {DragDropModule} from "@angular/cdk/drag-drop";
import {RdfValueDialog} from "src/app/main/mapper/mapper.component";
import {FormsModule} from "@angular/forms";
import {MatDialogModule} from "@angular/material/dialog";
import {MatInputModule} from "@angular/material/input";
import {CypressDataDirective} from "src/app/directives/cypress-data.directive";
import {DirectivesModule} from "src/app/directives/directives.module";



@NgModule({
  declarations: [
    HeaderComponent,
    SourceComponent,
    RdfValueDialog
  ],
  exports: [
    HeaderComponent,
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
    MatInputModule,
    DirectivesModule
  ]
})
export class MapperModule { }
