import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HttpClient, HttpClientModule} from '@angular/common/http';
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
import {SatPopoverModule} from '@ncstate/sat-popover';
import {SparqlEditorModule} from 'src/app/main/sparql-editor/sparql-editor.module';
import {MatTabsModule} from '@angular/material/tabs';
import {MatIconModule} from '@angular/material/icon';

export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, environment.httpLoaderPrefix, environment.httpLoaderSuffix);
}

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MapperModule,
    SparqlEditorModule,
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
    MatTabsModule,
    MatIconModule,
  ],
  providers: [TranslateService],
  bootstrap: [AppComponent],
  exports: [TranslateModule],
})
export class AppModule {
}
