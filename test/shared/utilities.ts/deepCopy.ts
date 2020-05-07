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
        expect(copiedObj[2]).to.equal("to");
    });
    it("Values should have different references", () => {
        expect(copiedObj).to.not.equal(originalObj);
        expect(copiedObj.obj).to.not.equal(originalObj.obj);
        expect(copiedObj.arrayOfVectors).to.not.equal(originalObj.arrayOfVectors);
    });
    it("deepCopy should maintain prototypes", () => {
        expect(deepCopy(new Vector2(2, 5))).to.be.instanceOf(Vector2); // Try prototype of root
        expect(copiedObj.arrayOfVectors[0]).to.be.instanceOf(Vector2); // Try prototype from branch
        expect(copiedObj.arrayOfVectors[0].add(new Vector2(2, 2))).to.eql(new Vector2(3, 4)); // Try a function from prototype
    });
    it("deepCopy should do circular references, without crashing", () => {
        // create circular reference
        let obj1: { obj2: any; } = { obj2: null };
        let obj2: { obj1: any; } = { obj1: null };
        obj1.obj2 = obj2;
        obj2.obj1 = obj1;

        // Copy circular reference
        let copy = deepCopy(obj1);

        // Test circular reference
        expect(copy, "crashed from circular definition").to.exist;
        expect(copy.obj2, "Referenced to original object").to.not.equal(obj1.obj2.obj1.obj2.obj1.obj2);

        // Properties set on copy should not be on original
        copy.obj2.obj1.obj2.a = "a";
        expect(obj2["a"], "Referenced to original object").to.not.exist;
        copy.obj2.obj1.obj2.obj1.b = "b";
        expect(obj1["b"], "Referenced to original object").to.not.exist;

        expect(copy.obj2, "obj2 changes throughout the chain").to.be.equal(copy.obj2.obj1.obj2.obj1.obj2);

    });
});
