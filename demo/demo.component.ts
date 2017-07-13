import { Component } from '@angular/core';

@Component({
  selector: 'fl-demo-app',
  template: `
    <h1>DemoComponent</h1>
    <input type="text" [(ngModel)]="money" [flMask]="moneyMask" placeholder="money" />{{ money }}<br />
    <input type="text" [(ngModel)]="cep" [flMask]="cepMask" placeholder="cep" />{{ cep }}
  `
})
export class DemoComponent {

  public readonly cepMask: string = '00000-000';
  public readonly moneyMask: string = '#0.00?reverse=true';

  public cep: string;
  public money: string;
}
