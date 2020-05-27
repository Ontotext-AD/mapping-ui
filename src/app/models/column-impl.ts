import {Column, Source} from 'src/app/models/mapping-definition';
import {Expose} from 'class-transformer';

export class ColumnImpl implements Column {
  @Expose() columnName?: string;
  @Expose() source: Source;
  @Expose() constant?: string;

  constructor(columnName: string, source: Source, constant: string) {
    this.columnName = columnName;
    this.source = source;
    this.constant = constant;
  }

  public getColumnName(): string {
    return this.columnName;
  }

  public setColumnName(value: string) {
    this.columnName = value;
  }

  public getSource(): Source {
    return this.source;
  }

  public setSource(value: Source) {
    this.source = value;
  }

  public getConstant(): string {
    return this.constant;
  }

  public setConstant(value: string) {
    this.constant = value;
  }
}
