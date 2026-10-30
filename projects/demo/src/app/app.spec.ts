import { ComponentFixture, TestBed } from '@angular/core/testing';

import { App } from './app';

describe('App', () => {
  let fixture: ComponentFixture<App>;
  let element: HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    element = fixture.nativeElement;
  });

  function type(input: HTMLInputElement, value: string) {
    input.value = value;
    input.dispatchEvent(new InputEvent('input', { inputType: 'insertText' }));
  }

  const query = <T extends Element>(selector: string) => element.querySelector(selector) as T;

  it('renders a field for every Brazilian preset', () => {
    expect(query('h1').textContent).toBe('ng-mask');
    expect(query('input[name="brCnpj"]')).not.toBeNull();
    expect(query('input[name="brPlaca"]')).not.toBeNull();
  });

  it('masks a preset field and describes it with its hint and raw value', async () => {
    const input = query<HTMLInputElement>('#preset-brCpf');

    type(input, '12345678909');
    await fixture.whenStable();

    expect(input.value).toBe('123.456.789-09');
    const descriptions = input
      .getAttribute('aria-describedby')!
      .split(' ')
      .map((id) => element.querySelector(`#${id}`)?.textContent ?? '');
    expect(descriptions[0]).toContain('000.000.000-00');
    expect(descriptions[1]).toContain('raw: 12345678909');
    expect(query('label[for="preset-brCpf"]').textContent).not.toContain('raw');
  });

  it('uses keyboard hints that fit each preset', () => {
    expect(query('#preset-brCpf').getAttribute('inputmode')).toBe('numeric');
    expect(query('#preset-brCnpj').getAttribute('autocapitalize')).toBe('characters');
    expect(query('#preset-brTelefone').getAttribute('type')).toBe('tel');
    expect(query('#preset-brTelefone').getAttribute('autocomplete')).toBe('tel-national');
    expect(query('#preset-brCep').getAttribute('autocomplete')).toBe('postal-code');
  });

  async function submitAndWaitForStatus() {
    query<HTMLButtonElement>('button[type="submit"]').click();
    await fixture.whenStable();
    const cleared = query('[role="status"]').textContent?.trim();
    await new Promise((resolve) => setTimeout(resolve, 150));
    await fixture.whenStable();

    return cleared;
  }

  it('reports errors and focuses the first invalid field on an invalid submit', async () => {
    await submitAndWaitForStatus();

    const name = query<HTMLInputElement>('#form-name');
    expect(query('[role="status"]').textContent).toContain('Fix 2 fields');
    expect(document.activeElement).toBe(name);
    expect(name.getAttribute('aria-invalid')).toBe('true');
    expect(query(`#${name.getAttribute('aria-describedby')}`).textContent).toContain('Required');
  });

  it('clears and re-announces the status on a repeated invalid submit', async () => {
    await submitAndWaitForStatus();
    const cleared = await submitAndWaitForStatus();

    expect(cleared).toBe('');
    expect(query('[role="status"]').textContent).toContain('Fix 2 fields');
  });

  it('explains an invalid CPF/CNPJ', async () => {
    const documentInput = query<HTMLInputElement>('#form-document');
    type(documentInput, '12345678900');
    documentInput.dispatchEvent(new Event('blur'));
    await fixture.whenStable();

    expect(documentInput.getAttribute('aria-describedby')).toContain('form-document-error');
    expect(query('#form-document-error').textContent).toContain('Invalid CPF or CNPJ');
  });

  it('disables masking for an empty custom pattern', async () => {
    const pattern = query<HTMLInputElement>('#custom-pattern');
    type(pattern, '');
    await fixture.whenStable();
    const custom = query<HTMLInputElement>('#custom-value');

    type(custom, 'free text');

    expect(custom.value).toBe('free text');
  });

  it('formats values with the pipe', () => {
    const table = query('table').textContent;

    expect(table).toContain('12.ABC.345/01DE-35');
    expect(table).toContain('1.234,50');
  });
});
