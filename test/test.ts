import { helloTest } from './../src/hello-test';
import { expect } from 'chai';
import 'mocha';

const expected = "elephant";

describe('First test', () => {

<<<<<<< HEAD
    it(`should return ${expected}`, () => {
        const result = helloTest();
        expect(result).to.equal(expected);
    });
=======
  it(`should return ${expected}`, () => {
    const result = helloTest();
    expect(result).to.equal(expected);
  });
>>>>>>> 6f1a9f1cc96b2ecc0190a1b3eed9c91b8d4bc1c2

});