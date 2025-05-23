class SudokuSolver {
  validate(puzzleString) {
    if (!puzzleString) {
      return { valid: false, error: 'Required field missing' };
    }
    if (puzzleString.length !== 81) {
      return { valid: false, error: 'Expected puzzle to be 81 characters long' };
    }
    if (!/^[1-9.]+$/.test(puzzleString)) {
      return { valid: false, error: 'Invalid characters in puzzle' };
    }
    return { valid: true };
  }

  // Helper to convert puzzle string to a 2D array (grid)
  transformPuzzleToGrid(puzzleString) {
    const grid = [];
    for (let i = 0; i < 9; i++) {
      grid.push(puzzleString.substring(i * 9, (i + 1) * 9).split(''));
    }
    return grid;
  }

  checkRowPlacement(board, row, column, value) {
    // board is the 2D array representation of the puzzle
    // row and column are 0-indexed
    // value is the number to check (as a string or number)

    for (let col = 0; col < 9; col++) {
      if (col !== column && board[row][col] == value) {
        return false;
      }
    }
    return true;
  }

  checkColPlacement(board, row, column, value) {
    for (let r = 0; r < 9; r++) {
      // Skip the current cell when checking for conflicts
      if (r === row) {
          continue;
      }
      if (board[r][column] == value) { // Using loose comparison assuming board values might be strings
          return false; // Conflict found
      }
  }
  return true; // No conflict in the column
  }

  checkRegionPlacement(board, row, column, value) {
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(column / 3) * 3;

    for (let r = startRow; r < startRow + 3; r++) {
        for (let c = startCol; c < startCol + 3; c++) {
            // Skip the current cell when checking for conflicts
            if (r === row && c === column) {
                continue;
            }
            if (board[r][c] == value) { // Loose comparison
                return false; // Conflict found
            }
        }
    }
    return true; // No conflict in the region
  }

  // Backtracking Sudoku Solver
  solve(puzzleString) {
    const validationResult = this.validate(puzzleString);
    if (validationResult.error) {
        return validationResult; // Pass through the validation error
    }

    const board = this.transformPuzzleToGrid(puzzleString);

    if (!this._solveSudoku(board)) {
      return { error: 'Puzzle cannot be solved' };
    }

    // Convert solved board back to a string
    let solvedString = '';
    for (let r = 0; r < 9; r++) {
      solvedString += board[r].join('');
    }
    return { solution: solvedString };
  }

  _solveSudoku(board) {
    let emptyCell = this._findEmpty(board);
    if (!emptyCell) {
      return true; // No empty cells, puzzle solved
    }

    const [row, col] = emptyCell;

    for (let num = 1; num <= 9; num++) {
      // Check if 'num' can be placed at (row, col)
      if (
        this.checkRowPlacement(board, row, col, num) &&
        this.checkColPlacement(board, row, col, num) &&
        this.checkRegionPlacement(board, row, col, num)
      ) {
        board[row][col] = String(num); // Place the number (store as string)

        if (this._solveSudoku(board)) {
          return true; // If placing this number leads to a solution, return true
        }

        board[row][col] = '.'; // Backtrack: undo the placement
      }
    }
    return false; // No number works for this cell
  }

  _findEmpty(board) {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === '.') {
          return [r, c]; // Return [row, col] of the empty cell
        }
      }
    }
    return null; // No empty cell found
  }
}

module.exports = SudokuSolver;