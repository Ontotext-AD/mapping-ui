import {EventEmitter, Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class TabService {
  selectedInput: BehaviorSubject<number> = new BehaviorSubject<number>(0);
  selectCommand: EventEmitter<any> = new EventEmitter<any>();
}
