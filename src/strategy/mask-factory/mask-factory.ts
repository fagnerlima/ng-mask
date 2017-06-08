import { Mask, MaskOptions } from '../../mask';

export abstract class MaskFactory {

  protected pattern: string = null;
  protected options: MaskOptions = {};

  public constructor(protected mask: string) { }

  public abstract create(): Mask;
}
