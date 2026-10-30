import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MaskPipe } from './mask.pipe';

describe('MaskPipe', () => {
  const pipe = new MaskPipe();

  it('formats with a preset', () => {
    expect(pipe.transform('12345678909', 'brCpf')).toBe('123.456.789-09');
  });

  it('formats with a pattern', () => {
    expect(pipe.transform('1234', '00-00')).toBe('12-34');
  });

  it('formats with a configuration object', () => {
    expect(pipe.transform('123456', { pattern: '#.##0,00', reverse: true })).toBe('1.234,56');
  });

  it('formats numbers', () => {
    expect(pipe.transform(1234.56, 'brMoeda')).toBe('1.234,56');
  });

  it.each([null, undefined])('returns an empty string for %s', (value) => {
    expect(pipe.transform(value, 'brCpf')).toBe('');
  });

  it('returns the value unchanged without a mask', () => {
    expect(pipe.transform('abc', '')).toBe('abc');
  });

  it('works in a template', async () => {
    @Component({
      imports: [MaskPipe],
      template: `<span>{{ cnpj | mask: 'brCnpj' }}</span>`,
    })
    class HostComponent {
      cnpj = '12abc34501de35';
    }

    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toBe('12.ABC.345/01DE-35');
  });
});
