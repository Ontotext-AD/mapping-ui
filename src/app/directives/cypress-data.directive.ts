import {Directive, ElementRef, Renderer2} from '@angular/core';
import {environment} from 'src/environments/environment';

@Directive({
  selector: '[appCypressData]',
})
export class CypressDataDirective {
  constructor(private el: ElementRef, private renderer: Renderer2) {
    if (environment.production) {
      renderer.removeAttribute(el.nativeElement, 'appCypressData ');
    }
  }
}
