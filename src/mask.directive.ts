import { Directive, Input, ElementRef, AfterContentInit } from '@angular/core';
import { NgControl }                                      from '@angular/forms';

import { MaskOptions } from './mask-options';

/**
 * jQuery
 */
declare let $: any;

/**
 * MaskDirective.
 * @author Fagner Lima
 * @since 1.0.0
 */
@Directive({
  selector: '[mask]',
  host: {
    '(blur)': 'onBlur()'
  }
})
export class MaskDirective implements AfterContentInit {
  @Input('mask') pattern: string;
  @Input('maskOptions') options: MaskOptions = {};

  constructor(private elementRef: ElementRef, private ngControl: NgControl) {}

  ngAfterContentInit() {
    $(this.elementRef.nativeElement).mask(this.pattern, this.options);
  }

  onBlur() {
    this.ngControl.control.setValue(this.elementRef.nativeElement.value);
  }
}