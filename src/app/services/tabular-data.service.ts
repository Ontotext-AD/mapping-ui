import { Injectable } from '@angular/core';
import {Source} from "src/app/models/source";

@Injectable({
  providedIn: 'root'
})
export class TabularDataService {

  constructor() { }

  getData(): any {
    return [
      new Source('Episode I - The Phantom Menace'),
      new Source('Episode II - Attack of the Clones'),
      new Source('Episode III - Revenge of the Sith'),
      new Source('Episode IV - A New Hope'),
      new Source('Episode V - The Empire Strikes Back'),
      new Source('Episode VI - Return of the Jedi'),
      new Source('Episode VII - The Force Awakens'),
      new Source('Episode VIII - The Last Jedi'),
      new Source('Episode IX – The Rise of Skywalker')
    ];
  }

}
