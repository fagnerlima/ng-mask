export class MaskPatternNotFoundError implements Error {

  private _name: string = 'MaskPatternNotFoundError';

  public constructor(private _message: string = 'Mask pattern not found') { }

  public get name(): string {
    return this._name;
  }

  public get message(): string {
    return this._message;
  }
}
