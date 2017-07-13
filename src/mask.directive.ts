import { Directive, Input, ElementRef, AfterContentInit, HostListener, forwardRef } from '@angular/core';
import { NgControl, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { Mask } from './mask';
import { MaskService } from './mask.service';

import $ = require('jquery');
require('jquery-mask-plugin');

@Directive({
  selector: '[flMask]',
  providers: [
    MaskService,
    // {
    //   provide: NG_VALUE_ACCESSOR,
    //   useExisting: forwardRef(() => MaskDirective),
    //   multi: true
    // }
  ]
})
export class MaskDirective implements AfterContentInit, ControlValueAccessor {

  @Input() public flMask: Mask | string;

  public constructor(
    private elementRef: ElementRef,
    private maskService: MaskService
  ) { }

  public ngAfterContentInit(): void {
    if (!this.flMask) {

      return;
    }

    if (this.flMask instanceof Mask && this.flMask.pattern) {
      this.setInputMask(this.flMask);
    } else if (typeof this.flMask === 'string' && this.flMask.length > 0) {
      const mask: Mask = this.maskService.createMask(this.flMask);

      if (mask) {
        this.setInputMask(mask);
      }
    }
  }

  @HostListener('blur', ['$event']) public onBlur(): void {
    // this.ngControl.control.setValue(this.elementRef.nativeElement.value);
  }

  public writeValue(value: string): void {
    if (!value) {
      return;
    }

    // $(this.elementRef.nativeElement).mask(mask.pattern, mask.options);
    console.log(value);
  }

  public registerOnChange(fn: any): void {
    this._onChange = fn;
    return;
  }

  private _onChange = (_: any) => { };

  private setInputMask(mask: Mask): void {
    $(this.elementRef.nativeElement).mask(mask.pattern, mask.options);
  }
}
