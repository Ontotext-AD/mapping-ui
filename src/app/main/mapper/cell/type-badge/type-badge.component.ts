import {
  Component,
  Input,
} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {OnDestroyMixin} from '@w11k/ngx-componentdestroyed';
import {Type} from '../../../../models/mapping-definition';

@Component({
  selector: 'app-type-badge',
  templateUrl: './type-badge.component.html',
})
export class TypeBadgeComponent extends OnDestroyMixin {
  @Input() type: string;

  IRI = Type.IRI;
  DATATYPE_LITERAL = Type.DatatypeLiteral;
  LANGUAGE_LITERAL = Type.LanguageLiteral;

  constructor(private translateService: TranslateService) {
    super();
  }

  public getValueTypeLabel() {
    if (this.type) {
      const typeUpperCase = this.type.toUpperCase();
      const labelKey = `LABELS.${typeUpperCase}`;
      return this.translateService.instant(labelKey);
    }
  }

  public getClass() {
    let cssClass = '';
    if (this.type) {
      cssClass = `type-${this.type}`;
    }
    return cssClass;
  }
}
