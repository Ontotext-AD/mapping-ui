import {Helper} from 'src/app/utils/helper';

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

  getReasonableLongTitle() {
    return Helper.getReasonableLongWord(this.title);
  }

  getTitle() {
    return this.title;
  }
}
