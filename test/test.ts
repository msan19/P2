import { helloTest } from './../src/hello-test';
import { expect } from 'chai';
import 'mocha';

const expected = "elephant";

describe('First test', () => {

  it(`should return ${expected}`, () => {
    const result = helloTest();
    expect(result).to.equal(expected);
  });

});