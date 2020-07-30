export class Namespace {
  prefix: string;
  value: string

  constructor(prefix, value) {
    this.setPrefix(prefix)
    this.setValue(value);
  }

  setPrefix(prefix: string) {
    if (prefix.endsWith(':')) {
      this.prefix = prefix.slice(0, -1);
    } else {
      this.prefix = prefix;
    }
  }

  getPrefix() {
    if (!this.prefix.endsWith(':')) {
      return this.prefix + ':';
    }
    return this.prefix;
  }

  getRawPrefix() {
    if (this.prefix.endsWith(':')) {
      return this.prefix.slice(0, -1);
    }
    return this.prefix;
  }

  setValue(value: string) {
    this.value = value;
  }

  getValue() {
    return this.value;
  }
}
