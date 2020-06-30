import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SourceService {
  usedSources: BehaviorSubject<Set<string>> = new BehaviorSubject(new Set<string>());

  constructor() { }
}
