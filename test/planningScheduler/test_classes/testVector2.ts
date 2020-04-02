import { Vector2 } from "./../../../src/planningScheduler/classes/vector2"
import { expect } from 'chai';
import 'mocha';




function checkVector(vector: Vector2, expX: number, expY: number) {
    it('x and y are as expected', function () {
        expect(vector.x).to.equal(expX);
        expect(vector.y).to.equal(expY);
    });
}

function checkNumber(actual: number, expected: number) {
    it(`${expected} should be ${actual}`, function () {
        expect(actual).to.equal(expected);
    });
}


function testAdd() {
    let vectors = [];
    vectors.push(new Vector2(10, 20));
    vectors.push(new Vector2(40, 5));
    vectors.push(new Vector2(43, 57));
    let expects = [[50, 25], [50, 25], [83, 62], [53, 77]];
    let results = [];

    results.push(vectors[0].add(vectors[1]));
    results.push(vectors[1].add(vectors[0]));
    results.push(vectors[2].add(vectors[1]));
    results.push(vectors[0].add(vectors[2]));

    for (let i = 0; i < results.length; i++) {
        checkVector(results[i], expects[i][0], expects[i][1]);
    }
}

function testSubtract() {
    let vectors = [];
    vectors.push(new Vector2(10, 20));
    vectors.push(new Vector2(40, 5));
    vectors.push(new Vector2(43, 57));
    let expects = [[-30, 15], [30, -15], [3, 52], [-33, -37]];
    let results = [];

    results.push(vectors[0].subtract(vectors[1]));
    results.push(vectors[1].subtract(vectors[0]));
    results.push(vectors[2].subtract(vectors[1]));
    results.push(vectors[0].subtract(vectors[2]));

    for (let i = 0; i < results.length; i++) {
        checkVector(results[i], expects[i][0], expects[i][1]);
    }
}

function testScale() {
    let vectors = [];
    let scalars = [7, -4, 3.2];
    vectors.push(new Vector2(10, 20));
    vectors.push(new Vector2(40, 5));
    vectors.push(new Vector2(43, 57));
    let expects = [ [70, 140], [-40, -80], [32.0, 64.0],
                    [280, 35], [-160, -20], [128.0, 16.0],
                    [301, 399], [-172, -228], [137.6, 182.4]
                  ];
    let results = [];

    for (let i = 0; i < vectors.length; i++) {
        for (let j = 0; j < scalars.length; j++) {
            results.push(vectors[i].scale(scalars[j]));
        }
    }

    for (let i = 0; i < results.length; i++) {
        checkVector(results[i], expects[i][0], expects[i][1]);
    }
}

function testLength() {
    let vectors = [];
    vectors.push(new Vector2(10, 20));
    vectors.push(new Vector2(40, 5));
    vectors.push(new Vector2(43, 57));
    let expects = [22.36, 40.31, 71.40];
    let results = [];

    for (let i = 0; i < vectors.length; i++) {
        results.push(parseFloat(vectors[i].getLength().toFixed(2)));
    }


    for (let i = 0; i < results.length; i++) {
        checkNumber(results[i], expects[i]);
    }

}

function testDistanceTo() {
    let vectors = [];
    vectors.push(new Vector2(10, 20));
    vectors.push(new Vector2(40, 5));
    vectors.push(new Vector2(43, 57));
    let expects = [33.54, 49.58, 52.09];
    let results = [];

    /* first: 0 to 1, second: 0 to 2, third: 1 to 2 */
    for (let i = 0; i < vectors.length; i++) {
        for (let j = i + 1; j < vectors.length; j++) {
            results.push(parseFloat(vectors[i].getDistanceTo(vectors[j]).toFixed(2)));
        }
    }

    for (let i = 0; i < results.length; i++) {
        checkNumber(results[i], expects[i]);
    }
}

// Test of vector add
describe("Vector 'add' test", testAdd);
// Test of vector subtract
describe("Vector 'subtract' test", testSubtract);
// Test of vector scale
describe("Vector 'scale' test", testScale);
// Test of vector length
describe("Vector 'length' test", testLength);
// Test of vector getDistanceTo
describe("Vector 'distance to' test", testDistanceTo);

