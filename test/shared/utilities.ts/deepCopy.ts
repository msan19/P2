// deepCopy.ts
/**
 * Test of {@link Handler}
 * @packageDocumentation
 * @category planningScheduler test
 */

import { deepCopy } from "../../../src/shared/utilities";
import { Vector2 } from "../../../src/shared/vector2";
import { expect } from 'chai';
import 'mocha';

let originalObj = {
    a: "1",
    b: 2,
    2: "to",
    obj: {
        a: "2",
        b: null
    },
    arrayOfVectors: [
        new Vector2(1, 2),
        new Vector2(3, 4)
    ]
};
let copiedObj = deepCopy(originalObj);

let originalVector = new Vector2(2, 5);
let copiedVector = deepCopy(new Vector2(2, 5));


describe("deepCopy", () => {
    it("Values should remain equal", () => {
        expect(copiedObj).to.eql(originalObj);
        expect(copiedObj[2]).to.equal("to");
    });
    it("Values should have different references", () => {
        expect(copiedObj).to.not.equal(originalObj);
        expect(copiedObj.obj).to.not.equal(originalObj.obj);
        expect(copiedObj.arrayOfVectors).to.not.equal(originalObj.arrayOfVectors);
    });
    it("deepCopy should maintain prototypes", () => {
        expect(deepCopy(new Vector2(2, 5)) instanceof Vector2).to.be.true; // Try prototype of root
        expect(copiedObj.arrayOfVectors[0] instanceof Vector2).to.be.true; // Try prototype from branch
        expect(copiedObj.arrayOfVectors[0].add(new Vector2(2, 2))).to.eql(new Vector2(3, 4)); // Try a function from prototype
    });
});
