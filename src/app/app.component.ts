import {Component} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import 'reflect-metadata';
import {AutocompleteService} from './services/rest/autocomplete.service';
import {WindowMessageHandlingService} from 'src/app/services/window-message-handling.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(public translate: TranslateService, private autocompleteService: AutocompleteService,
              private windowMessageHandlingService: WindowMessageHandlingService) {
    this.initTranslation();
    this.autocompleteService.autocompleteStatus().subscribe();
    this.windowMessageHandlingService.subscribeToWindowParentMessageEvent();
  }

  private initTranslation() {
    this.translate.addLangs(['en']);
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }
}
