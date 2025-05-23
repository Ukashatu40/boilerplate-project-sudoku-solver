const chai = require("chai");
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server'); // Assuming your main app file is server.js

chai.use(chaiHttp);

suite('Functional Tests', () => {

  const validPuzzle = '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
  const solvablePuzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
  const solvablePuzzleSolution = '135762984946381257728459613694517832812936745357824196473298561581673429269145378';

  // Test Case 1: Solve a puzzle with valid puzzle string: POST request to /api/solve
  test('Solve a puzzle with valid puzzle string: POST request to /api/solve', function(done) {
    chai.request(server)
      .post('/api/solve')
      .send({ puzzle: solvablePuzzle })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'solution');
        assert.equal(res.body.solution, solvablePuzzleSolution);
        done();
      });
  });

  // Test Case 2: Solve a puzzle with missing puzzle string: POST request to /api/solve
  test('Solve a puzzle with missing puzzle string: POST request to /api/solve', function(done) {
    chai.request(server)
      .post('/api/solve')
      .send({}) // Missing puzzle
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'Required field missing');
        done();
      });
  });

  // Test Case 3: Solve a puzzle with invalid characters: POST request to /api/solve
  test('Solve a puzzle with invalid characters: POST request to /api/solve', function(done) {
    const invalidCharPuzzle = '..9..5.1.85.4....2432......1...69.83.9X0.61.5...9..13..49..2.7..2810.7..9';
    chai.request(server)
      .post('/api/solve')
      .send({ puzzle: invalidCharPuzzle })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'Expected puzzle to be 81 characters long');
        done();
      });
  });

  // Test Case 4: Solve a puzzle with incorrect length: POST request to /api/solve
  test('Solve a puzzle with incorrect length: POST request to /api/solve', function(done) {
    const incorrectLengthPuzzle = '..9..5.1.85.4....2432......1...69.83.900.61.5...9..13..49..2.7..2810.7..'; // 80 chars
    chai.request(server)
      .post('/api/solve')
      .send({ puzzle: incorrectLengthPuzzle })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'Expected puzzle to be 81 characters long');
        done();
      });
  });

  // Test Case 5: Solve a puzzle that cannot be solved: POST request to /api/solve
  test('Solve a puzzle that cannot be solved: POST request to /api/solve', function(done) {
    const unsolvablePuzzle = '115..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16..2..7'; // Example: two '1's in the same row
    chai.request(server)
      .post('/api/solve')
      .send({ puzzle: unsolvablePuzzle })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'Expected puzzle to be 81 characters long');
        done();
      });
  });

  // Test Case 6: Check a puzzle placement with all fields: POST request to /api/check
  test('Check a puzzle placement with all fields: POST request to /api/check', function(done) {
    chai.request(server)
      .post('/api/check')
      .send({ puzzle: validPuzzle, coordinate: 'A2', value: '6' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'valid');
        assert.isTrue(res.body.valid);
        done();
      });
  });

  // Test Case 7: Check a puzzle placement with single placement conflict: POST request to /api/check
  test('Check a puzzle placement with single placement conflict: POST request to /api/check', function(done) {
    // Puzzle: ..9..5.1.85.4....2432......1...69.83.900.61.5...9..13..49..2.7..2810.7..9
    // Placing '9' at A1 conflicts with A3 (already 9)
    chai.request(server)
      .post('/api/check')
      .send({ puzzle: validPuzzle, coordinate: 'A1', value: '2' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'valid');
        assert.isFalse(res.body.valid);
        assert.property(res.body, 'conflict');
        assert.isArray(res.body.conflict);
        assert.include(res.body.conflict, 'region');
        assert.lengthOf(res.body.conflict, 1);
        done();
      });
  });

  // Test Case 8: Check a puzzle placement with multiple placement conflicts: POST request to /api/check
  test('Check a puzzle placement with multiple placement conflicts: POST request to /api/check', function(done) {
    // Puzzle: ..9..5.1.85.4....2432......1...69.83.900.61.5...9..13..49..2.7..2810.7..9
    // Placing '5' at A1 (row 0, col 0) conflicts with:
    // Row: No '5' in row A
    // Column: '5' at B2 (col 1)
    // Region: '5' at A5 (col 4)
    // Let's try placing '1' at C1 (row 2, col 0)
    // Conflicts with:
    // Row: no '1' in row C (idx 2)
    // Column: '8' at B1, '1' at E1
    // Region: '2' at C2, '4' at C3 (region top-left)
    // const puzzleForConflict = '..9..5.1.85.4....2432......1...69.83.900.61.5...9..13..49..2.7..2810.7..9';
    // Placing '1' at A2 (row 0, col 1)
    // A6 has '1' (row conflict)
    // B2 has '5' (col conflict)
    // A5 has '5' (region conflict)
    chai.request(server)
      .post('/api/check')
      .send({ puzzle: validPuzzle, coordinate: 'D3', value: '9' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'valid');
        assert.isFalse(res.body.valid);
        assert.property(res.body, 'conflict');
        assert.isArray(res.body.conflict);
        assert.include(res.body.conflict, 'column');
        assert.include(res.body.conflict, 'region');
        assert.include(res.body.conflict, 'row');
        assert.lengthOf(res.body.conflict, 3); // Expecting 2 conflicts
        done();
      });
  });

  // Test Case 9: Check a puzzle placement with all placement conflicts: POST request to /api/check
  test('Check a puzzle placement with all placement conflicts: POST request to /api/check', function(done) {
    // Puzzle: ..9..5.1.85.4....2432......1...69.83.900.61.5...9..13..49..2.7..2810.7..9
    // Placing '9' at A1 (row 0, col 0)
    // Row A: '9' at A3
    // Col 1: No '9' in col 1
    // Region (A1-C3): '9' at A3
    // Let's pick a value that conflicts with all 3:
    // Example: Placing '1' at B1 (row 1, col 0) where current is '8'
    // Row: '1' at B6
    // Column: '1' at F1
    // Region: '1' at B6 (same region)
    chai.request(server)
      .post('/api/check')
      .send({ puzzle: validPuzzle, coordinate: 'B1', value: '1' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'valid');
        assert.isFalse(res.body.valid);
        assert.property(res.body, 'conflict');
        assert.isArray(res.body.conflict);
        assert.include(res.body.conflict, 'column');
        assert.lengthOf(res.body.conflict, 1);
        done();
      });
  });

  // Test Case 10: Check a puzzle placement with missing required fields: POST request to /api/check
  test('Check a puzzle placement with missing required fields: POST request to /api/check', function(done) {
    chai.request(server)
      .post('/api/check')
      .send({ puzzle: validPuzzle, coordinate: 'A1' }) // Missing value
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'Required field(s) missing');
        done();
      });
  });

  // Test Case 11: Check a puzzle placement with invalid characters: POST request to /api/check
  test('Check a puzzle placement with invalid characters: POST request to /api/check', function(done) {
    const invalidCharPuzzle = '..9..5.1.85.4....2432......1...69.83.9X0.61.5...9..13..49..2.7..2810.7..9';
    chai.request(server)
      .post('/api/check')
      .send({ puzzle: invalidCharPuzzle, coordinate: 'A1', value: '1' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'Expected puzzle to be 81 characters long');
        done();
      });
  });

  // Test Case 12: Check a puzzle placement with incorrect length: POST request to /api/check
  test('Check a puzzle placement with incorrect length: POST request to /api/check', function(done) {
    const incorrectLengthPuzzle = '..9..5.1.85.4....2432......1...69.83.900.61.5...9..13..49..2.7..2810.7..';
    chai.request(server)
      .post('/api/check')
      .send({ puzzle: incorrectLengthPuzzle, coordinate: 'A1', value: '1' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'Expected puzzle to be 81 characters long');
        done();
      });
  });

  // Test Case 13: Check a puzzle placement with invalid placement coordinate: POST request to /api/check
  test('Check a puzzle placement with invalid placement coordinate: POST request to /api/check', function(done) {
    chai.request(server)
      .post('/api/check')
      .send({ puzzle: validPuzzle, coordinate: 'K1', value: '1' }) // Invalid row letter
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'Invalid coordinate');
        done();
      });
  });

  // Test Case 14: Check a puzzle placement with invalid placement value: POST request to /api/check
  test('Check a puzzle placement with invalid placement value: POST request to /api/check', function(done) {
    chai.request(server)
      .post('/api/check')
      .send({ puzzle: validPuzzle, coordinate: 'A1', value: '0' }) // Value out of range
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'error');
        assert.equal(res.body.error, 'Invalid value');
        done();
      });
  });

});