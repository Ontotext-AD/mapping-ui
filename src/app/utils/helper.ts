export class Helper {
  public static enumToArray(enumm): string[] {
    return Object.keys(enumm)
        .map((key) => enumm[key]);
  }

  public static enumKeysToArray(enumm): string[] {
    return Object.keys(enumm);
  }

  public static getEnumKeyByEnumValue(myEnum, enumValue) {
    const keys = Object.keys(myEnum).filter((x) => myEnum[x] == enumValue);
    return keys.length > 0 ? keys[0] : null;
  }

  public static isBlank(string: string): boolean {
    return !string || string.match(/^\s*$/) !== null;
  }
}
