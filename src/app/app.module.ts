import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {DirectivesModule} from 'src/app/directives/directives.module';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    DirectivesModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
