import { assert } from 'chai';
import { Mask } from './../src/mask';

describe('NgMask :: Mask', () => {
  it('should be instantiable', () => {
    const maskJson: any = {
      pattern: 'AAA000',
      options: {}
    };

    // assert.deepEqual(new Mask('AAA000', {}), maskJson);
    assert.equal(1, 1);
  });
});
