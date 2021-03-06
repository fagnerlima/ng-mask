import { Directive, Input, ElementRef, AfterContentInit, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

import $ from 'jquery';
import { Mask } from './mask';
import { MaskService } from './mask.service';

require('jquery-mask-plugin');

@Directive({
  selector: '[mask]',
  providers: [MaskService]
})
export class MaskDirective implements AfterContentInit {

  @Input() mask: Mask|string;

  constructor(
    private elementRef: ElementRef,
    private ngControl: NgControl,
    private maskService: MaskService
  ) { }

  ngAfterContentInit() {
    if (!this.mask) {

      return;
    }

    if (this.mask instanceof Mask && this.mask.pattern) {
      this.setInputMask(this.mask);
    } else if (typeof this.mask === 'string' && this.mask.length > 0) {
      const mask: Mask = this.maskService.createMask(this.mask);

      if (mask) {
        this.setInputMask(mask);
      }
    }
  }

  private setInputMask(mask: Mask) {
    $(this.elementRef.nativeElement).mask(mask.pattern, mask.options);
  }

  @HostListener('blur') onBlur() {
    this.ngControl.control.setValue(this.elementRef.nativeElement.value);
  }
}
