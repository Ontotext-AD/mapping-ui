import {enableProdMode} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {AppModule} from './app/app.module';
import {environment} from './environments/environment';

import {defineCustomElements} from 'ontotext-yasgui-web-component/loader/index';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
    .catch((err) => console.error(err));

// initializes the SPARQL editor
defineCustomElements(window);
