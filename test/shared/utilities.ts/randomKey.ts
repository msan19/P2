import { randomKey } from "../../../src/shared/utilities";
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

    it("Returned key should be in the original object", () => {
        expect(array[randomKey(array)]).to.exist;
        expect(dictionary[randomKey(dictionary)]).to.exist;
    });

    it("Returned key should not be in a disjoint set ", () => {
        expect(dictionary[randomKey(array)]).to.not.exist;
        expect(array[randomKey(dictionary)]).to.not.exist;
    });

    it("Random key of empty array should not return", () => {
        expect(randomKey([])).to.be.undefined;
        expect(randomKey({})).to.be.undefined;
    });
});
