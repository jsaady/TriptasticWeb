import { EntityProperty, Platform, TransformContext, Type } from '@mikro-orm/core';

export class VectorType extends Type<number[], string> {
  convertToDatabaseValue(value: string | number[], platform: Platform, context?: boolean | TransformContext | undefined): string {
    return typeof(value) === 'string' ? value : JSON.stringify(value);
  }

  convertToJSValue(value: string | number[], platform: Platform): number[] {
    return typeof(value) === 'string' ? JSON.parse(value) : value;
  }

  getColumnType(prop: EntityProperty<any>, platform: Platform): string {
    return 'vector';
  }
}
