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

  public static getReasonableLongWord(word: string, fromStart= 5, fromEnd = 5) {
    if (word.length > 15) {
      return word.substr(0, fromStart) + ' ... ' + word.substr(word.length -fromEnd, fromEnd);
    }
    return word;
  }
}
