import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SourceComponent} from './source.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import {DragDropModule} from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [
    SourceComponent,
  ],
  exports: [
    SourceComponent,
  ],
  imports: [
    CommonModule,
    MatTooltipModule,
    DragDropModule,
  ],
})
export class SourceModule { }
