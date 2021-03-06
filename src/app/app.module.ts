import {BrowserModule} from '@angular/platform-browser';
import {APP_INITIALIZER, NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {TranslateLoader, TranslateModule, TranslateService} from '@ngx-translate/core';
import {MapperModule} from 'src/app/main/mapper/mapper.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FlexLayoutModule} from '@angular/flex-layout';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatChipsModule} from '@angular/material/chips';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {FormsModule} from '@angular/forms';
import {DirectivesModule} from 'src/app/directives/directives.module';
import {environment} from 'src/environments/environment';
import {ComponentsModule} from 'src/app/main/components/components.module';
import {TokenInterceptor} from './auth/token.interceptor';
import {SatPopoverModule} from '@ncstate/sat-popover';

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, environment.httpLoaderPrefix, environment.httpLoaderSuffix);
}

export function initializeGraphDbUrl() {
  return (): Promise<any> => {
    return new Promise<void>((resolve) => {
      // In href "ontorefine" is overridden to "orefine". Afterwards graphDbUrl variable
      // will be used in redirect or during preview of resource.
      const endOfGraphDbUrlIndex = window.location.href.indexOf('/orefine');
      if (endOfGraphDbUrlIndex > -1) {
        environment.graphDbUrl = window.location.href.substr(0, endOfGraphDbUrlIndex);
      }
      resolve();
    });
  };
}

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MapperModule,
    MatDialogModule,
    HttpClientModule,
    ComponentsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    BrowserAnimationsModule,
    FlexLayoutModule,
    DragDropModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatSnackBarModule,
    FormsModule,
    DirectivesModule,
    SatPopoverModule,
  ],
  providers: [TranslateService, {
    provide: HTTP_INTERCEPTORS,
    useClass: TokenInterceptor,
    multi: true,
  }, {
    provide: APP_INITIALIZER,
    useFactory: initializeGraphDbUrl,
    multi: true,
  }],
  bootstrap: [AppComponent],
  exports: [TranslateModule],
})
export class AppModule {
}
