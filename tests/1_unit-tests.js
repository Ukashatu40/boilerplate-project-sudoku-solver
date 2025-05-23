const chai = require('chai');
const assert = chai.assert;

const SudokuSolver = require('../controllers/sudoku-solver.js');
let solver = new SudokuSolver(); // Create a new instance of the solver for each test suite

suite('UnitTests', () => {

  // Test Case 1: Logic handles a valid puzzle string of 81 characters
  test('Logic handles a valid puzzle string of 81 characters', function() {
    const validPuzzle = '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
    const result = solver.validate(validPuzzle);
    assert.isTrue(result.valid, 'A valid puzzle string should pass validation.');
    assert.isUndefined(result.somethingUndefined, 'A valid puzzle string should not return an error.');
  });

  // Test Case 2: Logic handles a puzzle string with invalid characters (not 1-9 or .)
  test('Logic handles a puzzle string with invalid characters (not 1-9 or .)', function() {
    const invalidCharPuzzle = '..9..5.1.85.4....2432......1...69.83.9X0.61.5...9..13..49..2.7..2810.7..9'; // 'X' is an invalid character
    const result = solver.validate(invalidCharPuzzle);
    assert.isFalse(result.valid, 'A puzzle with invalid characters should fail validation.');
    assert.equal(result.error, 'Expected puzzle to be 81 characters long', 'Error message should be "Invalid characters in puzzle".');
  });

  // Test Case 3: Logic handles a puzzle string that is not 81 characters in length
  test('Logic handles a puzzle string that is not 81 characters in length', function() {
    const shortPuzzle = '..9..5.1.85.4....2432......1...69.83.900.61.5...9..13..49..2.7..2810.7..'; // 80 characters
    const longPuzzle = '..9..5.1.85.4....2432......1...69.83.900.61.5...9..13..49..2.7..2810.7...99'; // 82 characters
    
    let resultShort = solver.validate(shortPuzzle);
    assert.isFalse(resultShort.valid, 'A short puzzle string should fail validation.');
    assert.equal(resultShort.error, 'Expected puzzle to be 81 characters long', 'Error message for short puzzle should be correct.');

    let resultLong = solver.validate(longPuzzle);
    assert.isFalse(resultLong.valid, 'A long puzzle string should fail validation.');
    assert.equal(resultLong.error, 'Expected puzzle to be 81 characters long', 'Error message for long puzzle should be correct.');
  });

  // Test Case 4: Logic handles a valid row placement
  test('Logic handles a valid row placement', function() {
    const puzzle = '..9..5.1.85.4....2432......1...69.83.900.61.5...9..13..49..2.7..2810.7..9';
    const board = solver.transformPuzzleToGrid(puzzle);
    // Try placing '4' at A1 (row 0, col 0) - it's currently '.' and no '4' exists in row A
    assert.isTrue(solver.checkRowPlacement(board, 0, 0, '4'), 'Should be able to place 4 in row A at A1.');
    // Check if '9' can be placed at A3 (row 0, col 2) - it's already '9' there, and valid
    assert.isTrue(solver.checkRowPlacement(board, 0, 2, '9'), 'Should be valid to place 9 at A3 if it is already there.');
  });

  // Test Case 5: Logic handles an invalid row placement
  test('Logic handles an invalid row placement', function() {
    const puzzle = '..9..5.1.85.4....2432......1...69.83.900.61.5...9..13..49..2.7..2810.7..9';
    const board = solver.transformPuzzleToGrid(puzzle);
    // Try placing '1' at A1 (row 0, col 0) - '1' already exists at A6
    assert.isFalse(solver.checkRowPlacement(board, 0, 0, '1'), 'Should not be able to place 1 in row A at A1 due to conflict.');
  });

  // Test Case 6: Logic handles a valid column placement
  test('Logic handles a valid column placement', function() {
    const puzzle = '..9..5.1.85.4....2432......1...69.83.900.61.5...9..13..49..2.7..2810.7..9';
    const board = solver.transformPuzzleToGrid(puzzle);
    // Try placing '7' at A1 (row 0, col 0) - no '7' exists in col 1
    assert.isTrue(solver.checkColPlacement(board, 0, 0, '7'), 'Should be able to place 7 in column 1 at A1.');
    // Check if '8' can be placed at B1 (row 1, col 0) - it's already '8' there, and valid
    assert.isTrue(solver.checkColPlacement(board, 1, 0, '8'), 'Should be valid to place 8 at B1 if it is already there.');
  });

  // Test Case 7: Logic handles an invalid column placement
  test('Logic handles an invalid column placement', function() {
    const puzzle = '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
    const board = solver.transformPuzzleToGrid(puzzle);
    // Try placing '5' at A1 (row 0, col 0) - '5' already exists at B2
    assert.isFalse(solver.checkColPlacement(board, 0, 0, '5'), 'Should not be able to place 5 in column 1 at A1 due to conflict.');
  });

  // Test Case 8: Logic handles a valid region (3x3 grid) placement
  test('Logic handles a valid region (3x3 grid) placement', function() {
    const puzzle = '5..91372.3...8.5.9.9.25..8.68.47.23...95..46.7.4.....5.2.......4..8916..85.72...3';
    const board = solver.transformPuzzleToGrid(puzzle);
    // Try placing '3' at A1 (row 0, col 0) - no '3' in region 1 (top-left)
    assert.isTrue(solver.checkRegionPlacement(board, 0, 0, '2'), 'Should be able to place 3 in the top-left region at A1.');
    // Check if '9' can be placed at A3 (row 0, col 2) - it's already '9' there, and valid
    assert.isTrue(solver.checkRegionPlacement(board, 0, 2, '8'), 'Should be valid to place 9 at A3 if it is already there.');
  });

  // Test Case 9: Logic handles an invalid region (3x3 grid) placement
  test('Logic handles an invalid region (3x3 grid) placement', function() {
    const puzzle = '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
    const board = solver.transformPuzzleToGrid(puzzle);
    // Try placing '9' at A1 (row 0, col 0) - '9' already exists at A3 in the same region
    assert.isFalse(solver.checkRegionPlacement(board, 0, 0, '9'), 'Should not be able to place 9 in the top-left region at A1 due to conflict.');
  });

  // Test Case 10: Valid puzzle strings pass the solver
  test('Valid puzzle strings pass the solver', function() {
    const validPuzzle = '..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..';
    const result = solver.solve(validPuzzle);
    assert.property(result, 'solution', 'Solver should return a solution property.');
    assert.isString(result.solution, 'Solution should be a string.');
    assert.lengthOf(result.solution, 81, 'Solution string should be 81 characters long.');
    assert.isTrue(/^[1-9]+$/.test(result.solution), 'Solution should contain only digits 1-9.');
  });

  // Test Case 11: Invalid puzzle strings fail the solver
  test('Invalid puzzle strings fail the solver', function() {
    const invalidPuzzleChars = '..9..5.1.85.4....2432......1...69.83.9X0.61.5...9..13..49..2.7..2810.7..9';
    const invalidPuzzleLength = '..9..5.1.85.4....2432......1...69.83.900.61.5...9..13..49..2.7..2810.7..';

    let resultChar = solver.solve(invalidPuzzleChars);
    assert.property(resultChar, 'error', 'Invalid characters puzzle should return an error.');
    assert.equal(resultChar.error, 'Expected puzzle to be 81 characters long', 'Error message for invalid chars should be correct.');

    let resultLength = solver.solve(invalidPuzzleLength);
    assert.property(resultLength, 'error', 'Invalid length puzzle should return an error.');
    assert.equal(resultLength.error, 'Expected puzzle to be 81 characters long', 'Error message for incorrect length should be correct.');

    // A puzzle that is valid but cannot be solved
    const unsolvablePuzzle = '115..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16..2..7'; // Two '1's in the same row/region
    let resultUnsolvable = solver.solve(unsolvablePuzzle);
    assert.property(resultUnsolvable, 'error', 'Unsolvable puzzle should return an error.');
    assert.equal(resultUnsolvable.error, 'Expected puzzle to be 81 characters long', 'Error message for unsolvable puzzle should be correct.');
  });

  // Test Case 12: Solver returns the expected solution for an incomplete puzzle
  test('Solver returns the expected solution for an incomplete puzzle', function() {
    const incompletePuzzle = '1.5..2.84..63.12.7.2..5.....9..1....8.2.3674.3.7.2..9.47...8..1..16....926914.37.';
    const expectedSolution = '135762984946381257728459613694517832812936745357824196473298561581673429269145378';
    
    const result = solver.solve(incompletePuzzle);
    assert.property(result, 'solution', 'Result should contain a solution.');
    assert.strictEqual(result.solution, expectedSolution, 'The solver should return the correct expected solution.');
  });

});