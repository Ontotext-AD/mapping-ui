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
      let typeUpperCase;
      if (this.type === Type.DatatypeLiteral || this.type === Type.LanguageLiteral) {
        typeUpperCase = Type.Literal.toUpperCase();
      } else {
        typeUpperCase = this.type.toUpperCase();
      }

      const labelKey = `LABELS.${typeUpperCase}`;
      const labelValue = this.translateService.instant(labelKey);
      if (this.type === Type.IRI) {
        return '<' + labelValue + '>';
      }
      if (this.type === Type.ValueBnode || this.type === Type.UniqueBnode) {
        return '_:' + labelValue;
      }
      if (this.type === Type.DatatypeLiteral || this.type === Type.LanguageLiteral || this.type === Type.Literal) {
        return '"' + labelValue + '"';
      }
    }
  }

  public getClass() {
    let cssClass = '';
    if (this.type) {
      if (this.type === Type.LanguageLiteral || this.type === Type.DatatypeLiteral) {
        cssClass = `type-${Type.Literal}`;
      } else {
        cssClass = `type-${this.type}`;
      }
    }
    return cssClass;
  }
}
