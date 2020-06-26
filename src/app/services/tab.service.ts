import {EventEmitter, Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class TabService {
  selectedInput: BehaviorSubject<any> = new BehaviorSubject<any>({index: 0, position: 1});
  selectCommand: EventEmitter<any> = new EventEmitter<any>();
}
