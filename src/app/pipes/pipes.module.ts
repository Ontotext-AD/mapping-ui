import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HighlightNamespacePipe} from './highlightNamespace.pipe';

@NgModule({
  declarations: [HighlightNamespacePipe],
  imports: [CommonModule],
  exports: [HighlightNamespacePipe],
})
export class PipesModule { }
