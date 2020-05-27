import {ValueTransformation} from 'src/app/models/mapping-definition';
import {Expose} from 'class-transformer';

export class ValueTransformationImpl implements ValueTransformation {
  @Expose() expression?: string;
  @Expose() language?: string;

  constructor(expression: string, language: string) {
    this.expression = expression;
    this.language = language;
  }

  public getExpression(): string {
    return this.expression;
  }

  public setExpression(value: string) {
    this.expression = value;
  }

  public getLanguage(): string {
    return this.language;
  }

  public setLanguage(value: string) {
    this.language = value;
  }
}
