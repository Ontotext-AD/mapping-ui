import {NgModule} from '@angular/core';
import {CypressDataDirective} from 'src/app/directives/cypress-data.directive';
import {TabDirective} from 'src/app/directives/tab.directive';

@NgModule({
  imports: [],
  declarations: [
    CypressDataDirective,
    TabDirective,
  ],
  exports: [
    CypressDataDirective,
    TabDirective,
  ],
})
export class DirectivesModule { }
