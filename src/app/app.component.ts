import {Component} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import 'reflect-metadata';
import {AutocompleteService} from './services/rest/autocomplete.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(public translate: TranslateService, private autocompleteService: AutocompleteService) {
    this.initTranslation();
    this.autocompleteService.autocompleteStatus().subscribe();
  }

  private initTranslation() {
    this.translate.addLangs(['en']);
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }
}
