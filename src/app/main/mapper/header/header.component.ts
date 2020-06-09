import {Component, OnInit, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  @Output() savedMapping = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
  }

  saveMapping(): void {
    this.savedMapping.emit();
  }
}
