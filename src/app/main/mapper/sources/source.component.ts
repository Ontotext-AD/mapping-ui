import {Component, Input, OnInit} from '@angular/core';
import {Source} from 'src/app/models/source';
import {SourceService} from 'src/app/services/source.service';
import {OnDestroyMixin, untilComponentDestroyed} from '@w11k/ngx-componentdestroyed';

@Component({
  selector: 'app-sources',
  templateUrl: './source.component.html',
  styleUrls: ['./source.component.scss'],
})
export class SourceComponent extends OnDestroyMixin implements OnInit {
  @Input() sources: Array<Source>;
  @Input() droppingContainers: [];

  constructor(private sourceService: SourceService) {
    super();
  }

  ngOnInit(): void {
    this.sourceService.usedSources
        .pipe(untilComponentDestroyed(this))
        .subscribe((set) => {
          this.sources && this.sources.forEach((source) => {
            source.setUsed(set.has(source.title));
          });
        });
  }
}
