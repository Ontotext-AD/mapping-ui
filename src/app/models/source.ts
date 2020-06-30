export class Source {
  title: string;
  used: boolean

  constructor(title) {
    this.title = title;
  }

  setUsed(used: boolean) {
    this.used = used;
  }

  isUsed() {
    return this.used;
  }

  getShortenTitle() {
    return this.title.substr(0, 5) + ' ... ' + this.title.substr(this.title.length -5, 5);
  }

  getReasonableLongTitle() {
    if (this.title.length > 15) {
      return this.getShortenTitle();
    }
    return this.title;
  }

  getTitle() {
    return this.title;
  }
}
