import { Directive, Input, ElementRef, AfterContentInit, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

import $ from 'jquery';
import { Mask } from '.';

require('jquery-mask-plugin');

@Directive({
  selector: '[mask]'
})
export class MaskDirective implements AfterContentInit {

  @Input() mask: Mask;

  constructor(private elementRef: ElementRef, private ngControl: NgControl) { }

  ngAfterContentInit() {
    if (this.mask && this.mask.pattern) {
      $(this.elementRef.nativeElement).mask(this.mask.pattern, this.mask.options);
    }
  }

  @HostListener('blur') onBlur() {
    this.ngControl.control.setValue(this.elementRef.nativeElement.value);
  }
}
