import {Component, Input, OnInit} from '@angular/core';
import {Source} from 'src/app/models/source';

@Component({
  selector: 'app-definitions',
  templateUrl: './source.component.html',
  styleUrls: ['./source.component.scss'],
})
export class SourceComponent implements OnInit {
  @Input() sources: Array<Source>;
  @Input() droppingContainers: [];

  constructor() { }

  ngOnInit(): void {
  }
}
