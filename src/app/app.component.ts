import {Component} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import 'reflect-metadata';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(public translate: TranslateService) {
    this.initTranslation();
  }

  private initTranslation() {
    this.translate.addLangs(['en']);
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }
}
