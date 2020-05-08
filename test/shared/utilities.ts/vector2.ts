/**
 * Test of {@link Vector2}
 * @packageDocumentation
 * @category Test
 */

import { Vector2 } from "../../../src/shared/vector2";
import { expect } from 'chai';
import 'mocha';

let oneVector = new Vector2(10, 10);
let anotherVector = new Vector2(15, 15);

describe(`Vector add`, () => {
    let resultingVector = oneVector.add(anotherVector);
    let expectedVector = new Vector2(25, 25);
    it(`should be the product of the two vectors`, () => {
        expect(resultingVector).to.eql(expectedVector);
    });
});

describe(`Vector subtract`, () => {
    let resultingVector = oneVector.subtract(anotherVector);
    let expectedVector = new Vector2(-5, -5);
    it(`should be the first vector subtracted the second vector`, () => {
        expect(resultingVector).to.eql(expectedVector);
    });
});

describe(`Vector scale`, () => {
    let scalar = -0.3;
    let resultingVector = oneVector.scale(scalar);
    let expectedVector = new Vector2(-3, -3);
    it(`should be the first vector times a scalar`, () => {
        expect(resultingVector).to.eql(expectedVector);
    });
});

describe(`Vector getLength`, () => {
    let resultingLength = parseFloat(oneVector.getLength().toFixed(2));
    let expectedLength = 14.14;
    it(`should be the length of the vector`, () => {
        expect(resultingLength).to.eql(expectedLength);
    });
});

describe(`Vector getDistanceTo`, () => {
    context(`when getting distance to another vector`, () => {
        let resultingLength = parseFloat(oneVector.getDistanceTo(anotherVector).toFixed(2));
        let expectedLength = 7.07;
        it(`should be the length from one vector to another vector`, () => {
            expect(resultingLength).to.eql(expectedLength);
        });
    });

    context(`when getting distance to itself`, () => {
        let resultingLength = parseFloat(oneVector.getDistanceTo(oneVector).toFixed(2));
        let expectedLength = 0.00;
        it(`should be the length from one vector to itself`, () => {
            expect(resultingLength).to.eql(expectedLength);
        });
    });
});

describe(`Vector getManhattanDistanceTo`, () => {
    context(`when getting distance to another vector`, () => {
        let resultingLength = parseFloat(oneVector.getManhattanDistanceTo(anotherVector).toFixed(2));
        let expectedLength = 10.00;
        it(`should be the length from one vector to another vector in a "Manhattan Grid"`, () => {
            expect(resultingLength).to.eql(expectedLength);
        });
    });

    context(`when getting distance to itself`, () => {
        let resultingLength = parseFloat(oneVector.getManhattanDistanceTo(oneVector).toFixed(2));
        let expectedLength = 0.00;
        it(`should be the length from one vector to itself in a "Manhattan Grid"`, () => {
            expect(resultingLength).to.eql(expectedLength);
        });
    });
});

describe(`Vector parse`, () => {
    let originalX = 10;
    let originalY = 15;
    let referenceVector = new Vector2(originalX, originalY);

    context(`when valid x and valid y`, () => {
        let testObject = { x: originalX, y: originalY };
        let resultingVector = Vector2.parse(testObject);
        let expectedVector = referenceVector;
        it(`should be parsed as Vector2`, () => {
            expect(resultingVector).to.eql(expectedVector);
        });
    });

    context(`when valid x and invalid y`, () => {
        let testObject = { x: originalX, y: null };
        let resultingVector = Vector2.parse(testObject);
        let expectedVector = null;
        it(`should not be parsed as Vector2`, () => {
            expect(resultingVector).to.eql(expectedVector);
        });
    });

    context(`when invalid x and valid y`, () => {
        let testObject = { x: null, y: originalY };
        let resultingVector = Vector2.parse(testObject);
        let expectedVector = null;
        it(`should not be parsed as Vector2`, () => {
            expect(resultingVector).to.eql(expectedVector);
        });
    });

    context(`when invalid x and invalid y`, () => {
        let testObject = { x: null, y: null };
        let resultingVector = Vector2.parse(testObject);
        let expectedVector = null;
        it(`should not be parsed as Vector2`, () => {
            expect(resultingVector).to.eql(expectedVector);
        });
    });
});

describe(`Vector clone`, () => {
    let cloneOfVector = oneVector.clone();
    let expectedVector = oneVector;
    it(`should maintain values`, () => {
        expect(cloneOfVector).to.eql(expectedVector);
    });
    it("should be different", () => {
        expect(cloneOfVector).to.not.equal(expectedVector);
    });
});