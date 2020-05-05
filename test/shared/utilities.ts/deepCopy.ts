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


describe("deepCopy", () => {
    it("Values should remain equal", () => {
        expect(copiedObj).to.eql(originalObj);
    });
    it("Values should have different references", () => {
        expect(copiedObj).to.not.equal(originalObj);
        expect(copiedObj.obj).to.not.equal(originalObj.obj);
        expect(copiedObj.arrayOfVectors).to.not.equal(originalObj.arrayOfVectors);
    });
    it("deepCopy should maintain prototypes", () => {
        expect(copiedObj.arrayOfVectors[0] instanceof Vector2).to.be.true;
    });
});
