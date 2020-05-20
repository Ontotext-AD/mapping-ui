import {NgModule} from '@angular/core';
import {CypressDataDirective} from 'src/app/directives/cypress-data.directive';

@NgModule({
  imports: [],
  declarations: [
    CypressDataDirective,
  ],
  exports: [
    CypressDataDirective,
  ],
})
export class DirectivesModule { }
