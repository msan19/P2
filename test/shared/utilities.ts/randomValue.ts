/**
 * Test of randomValue
 * @packageDocumentation
 * @category Test
 */

import { randomValue } from "../../../src/shared/utilities";
import { expect } from 'chai';
import 'mocha';

describe("randomKey", () => {
    let array = ["one", "two", "three", "four", "five"];
    let dictionary = {
        "a": "one",
        "b": "two",
        "c": "three",
        "d": "four",
        "e": "five"
    };

    it("Random value should be returned from non-empty sets", () => {
        expect(randomValue(array)).to.exist;
        expect(randomValue(dictionary)).to.exist;
    });


    it("Random value of empty array should not return", () => {
        expect(randomValue([])).to.be.undefined;
        expect(randomValue({})).to.be.undefined;
    });
});
