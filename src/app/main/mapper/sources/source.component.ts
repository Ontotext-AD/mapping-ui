import {Component, Input, OnInit} from '@angular/core';
import {Source} from 'src/app/models/source';
import {SourceService} from 'src/app/services/source.service';

@Component({
  selector: 'app-sources',
  templateUrl: './source.component.html',
  styleUrls: ['./source.component.scss'],
})
export class SourceComponent implements OnInit {
  @Input() sources: Array<Source>;
  @Input() droppingContainers: [];

  constructor(private sourceService: SourceService) {
  }

  ngOnInit(): void {
    this.sourceService.usedSources.subscribe((set) => {
      this.sources && this.sources.forEach((source) => {
        source.setUsed(set.has(source.title));
      });
    });
  }
}
