import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { NgMaskModule } from '../src';
import { DemoComponent } from './demo.component';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    NgMaskModule
  ],
  declarations: [DemoComponent],
  bootstrap: [DemoComponent]
})
export class DemoModule { }
