import {BehaviorSubject} from 'rxjs';

export class SourceService {
  usedSources: BehaviorSubject<Set<string>> = new BehaviorSubject(new Set<string>());

  constructor() {
    // no-op
  }
}
