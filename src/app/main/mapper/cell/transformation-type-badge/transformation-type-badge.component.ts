import {
  Component,
  Input,
} from '@angular/core';
import {OnDestroyMixin} from '@w11k/ngx-componentdestroyed';
import {ValueTransformationImpl} from '../../../../models/value-transformation-impl';
import {TranslateService} from '@ngx-translate/core';
import {ModelManagementService} from 'src/app/services/model-management.service';
import {COLON, GREL_CONSTANT, PREFIX_CONSTANT} from '../../../../utils/constants';
import {Type} from '../../../../models/mapping-definition';
import {IRIImpl} from '../../../../models/iri-impl';
import {TransformationTarget} from '../cell.component';

@Component({
  selector: 'app-transformation-type-badge',
  templateUrl: './transformation-type-badge.component.html',
})
export class TransformationTypeBadgeComponent extends OnDestroyMixin {
  @Input() cellMapping: any;
  @Input() target: TransformationTarget;

  GREL = GREL_CONSTANT;
  PREFIX = PREFIX_CONSTANT;
  DATATYPE_LITERAL = Type.DatatypeLiteral;
  LANGUAGE_LITERAL = Type.LanguageLiteral;

  constructor(private modelManagementService: ModelManagementService, private translateService: TranslateService) {
    super();
  }

  public rendered() {
    if (this.target === TransformationTarget.PROPERTYTRANSFORMATION) {
      return this.getTransformationType();
    } else if (this.target === TransformationTarget.VALUETRANSFORMATION) {
      return this.getSecondaryTransformationType();
    } else if (this.target === TransformationTarget.DATATYPETRANSFORMATION) {
      return this.getSecondaryTypeLabel() && this.isSecondaryType();
    }
  }

  public getLabel() {
    if (this.target === TransformationTarget.PROPERTYTRANSFORMATION) {
      return this.getTransformationLabel();
    } else if (this.target === TransformationTarget.VALUETRANSFORMATION) {
      return this.getSecondaryTransformationLabel();
    } else if (this.target === TransformationTarget.DATATYPETRANSFORMATION) {
      return this.getSecondaryTypeLabel();
    }
  }

  public getCssClass() {
    if (this.target === TransformationTarget.PROPERTYTRANSFORMATION) {
      return this.resolveTransformationTypeClass();
    } else if (this.target === TransformationTarget.VALUETRANSFORMATION) {
      return this.resolveTransformationTypeClass(true);
    } else if (this.target === TransformationTarget.DATATYPETRANSFORMATION) {
      return this.resolveDatatypeTransformationTypeClass();
    }
  }

  /**
   * Get value Type. Returns the ValueType but only when the cellMapping is a ValueMapping
   * Only ValueMappings have such a type
   *
   * @return iri
   */
  getValueType(): IRIImpl {
    return this.modelManagementService.getValueType(this.cellMapping);
  }

  getType(): string {
    return this.getValueType() && this.getValueType().getType();
  }

  isSecondaryType() {
    return this.getType() === Type.DatatypeLiteral || this.getType() === Type.LanguageLiteral;
  }

  /**
   * Get the transformation for the cell depending on the cellMapping type
   *
   * @return value transformation
   */
  getTransformation(): ValueTransformationImpl {
    return this.modelManagementService.getTransformation(this.cellMapping);
  }

  getTransformationType() {
    return this.getTransformation() && this.getTransformation().getLanguage();
  }

  getTransformationLabel() {
    if (this.getTransformationType() === this.GREL) {
      return this.translateService.instant('LABELS.GREL');
    } else if (this.getTransformationType() === this.PREFIX) {
      return this.resolveExpressionValue(this.getTransformation());
    }
  }

  getSecondaryTypeLabel() {
    if (this.getType() === this.DATATYPE_LITERAL) {
      return this.translateService.instant('LABELS.DATATYPE_LITERAL');
    } else if (this.getType() === this.LANGUAGE_LITERAL) {
      return this.translateService.instant('LABELS.LANGUAGE_LITERAL');
    }
  }

  getSecondaryTransformationLabel() {
    const secondaryTransformationType = this.getSecondaryTransformationType();
    if (secondaryTransformationType) {
      if (secondaryTransformationType.getLanguage() === this.GREL) {
        return this.translateService.instant('LABELS.GREL');
      } else if (secondaryTransformationType.getLanguage() === this.PREFIX) {
        return this.resolveExpressionValue(secondaryTransformationType);
      }
    }
  }

  getSecondaryTransformationType() {
    return this.modelManagementService.getValueTypeDatatypeTransformation((this.cellMapping)) ||
      this.modelManagementService.getValueTypeLanguageTransformation((this.cellMapping));
  }

  resolveTransformationTypeClass(isSecondary: boolean = false) {
    let transformationType;
    if (isSecondary) {
      transformationType = this.getSecondaryTransformationType() && this.getSecondaryTransformationType().getLanguage();
    } else {
      transformationType = this.getTransformationType();
    }
    let cssClass = 'ti-transform type-';
    if (transformationType === this.GREL) {
      cssClass += this.GREL;
    } else if (transformationType === this.PREFIX) {
      cssClass += this.PREFIX;
    }
    return cssClass;
  }

  resolveDatatypeTransformationTypeClass() {
    const transformationType = this.getType();
    let cssClass = 'ti-type type-';
    if (transformationType === this.DATATYPE_LITERAL) {
      cssClass += 'datatype_literal';
    } else if (transformationType === this.LANGUAGE_LITERAL) {
      cssClass += 'language_literal';
    }
    return cssClass;
  }

  private resolveExpressionValue(transformation) {
    const expression = transformation.getExpression();
    return expression.indexOf(':') >=0 ? expression : expression + COLON;
  }
}
