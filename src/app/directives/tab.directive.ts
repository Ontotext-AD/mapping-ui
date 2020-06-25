import {Directive, ElementRef, Input, OnInit} from '@angular/core';
import {TabService} from 'src/app/services/tab.service';

@Directive({
  selector: '[tabIndex], [tabPosition]',
})
export class TabDirective implements OnInit {
  private _index: number;
  get index(): any {
    return this._index;
  }
  @Input('tabIndex')
  set index(i: any) {
    this._index = parseInt(i);
  }

  constructor(private el: ElementRef, private tabService: TabService) {
  }

  ngOnInit() {
    this.tabService.selectedInput.subscribe((i) => {
      if (i === this.index) {
        this.el.nativeElement.focus();
      }
    });

    this.tabService.selectCommand.subscribe((index) => {
      this.tabService.selectedInput.next(index);
    });
  }
}
