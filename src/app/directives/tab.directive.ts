import {AfterViewInit, Directive, ElementRef, Input, OnInit} from '@angular/core';
import {TabService} from 'src/app/services/tab.service';
import {Observable} from "rxjs";

@Directive({
  selector: '[tabIndex], [tabPosition]',
})
export class TabDirective implements OnInit {
  private _index: number;
  private _position: number;
  private _autocomplete: Observable<any>;
  get index(): any {
    return this._index;
  }
  @Input('tabIndex')
  set index(i: any) {
    this._index = parseInt(i);
  }

  get position(): any {
    return this._position;
  }
  @Input('tabPosition')
  set position(i: any) {
    this._position = parseInt(i);
  }

  @Input('autocomplete')
  set autocomplete(auto: any){
    this._autocomplete = auto;
  }

  constructor(private el: ElementRef, private tabService: TabService) {
  }

  ngOnInit() {
    this.tabService.selectedInput.subscribe((command) => {
      if (command.index === 0 && command.position === 1) {
        return;
      }
      if (command.index === this.index && command.position === this.position) {
        this.autocomplete && this.autocomplete.subscribe(() => {
          this.el.nativeElement.focus();
        })

      }
    });

    this.tabService.selectCommand.subscribe((command) => {
      if (command.position === 3) {
        this.tabService.selectedInput.next({index: command.index + 1, position: 1});
      } else {
        this.tabService.selectedInput.next({index: command.index, position: command.position + 1});
      }
    });
  }
}
