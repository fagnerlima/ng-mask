import { TestBed } from '@angular/core/testing';

import { App } from './app';

describe('App', () => {
  async function render() {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    return fixture.nativeElement as HTMLElement;
  }

  function type(input: HTMLInputElement, value: string) {
    input.value = value;
    input.dispatchEvent(new InputEvent('input', { inputType: 'insertText' }));
  }

  it('renders a field for every Brazilian preset', async () => {
    const element = await render();

    expect(element.querySelector('h1')?.textContent).toBe('ng-mask');
    expect(element.querySelector('input[name="brCnpj"]')).not.toBeNull();
    expect(element.querySelector('input[name="brPlaca"]')).not.toBeNull();
  });

  it('masks a preset field and shows its raw value', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const field: HTMLElement = fixture.nativeElement.querySelector('app-preset-field');
    const input = field.querySelector('input') as HTMLInputElement;

    type(input, '12345678909');
    await fixture.whenStable();

    expect(input.value).toBe('123.456.789-09');
    expect(field.textContent).toContain('raw: 12345678909');
    expect(field.textContent).toContain('complete');
  });

  it('formats values with the pipe', async () => {
    const element = await render();

    expect(element.querySelector('table')?.textContent).toContain('12.ABC.345/01DE-35');
  });
});
