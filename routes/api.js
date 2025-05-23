const SudokuSolver = require('../controllers/sudoku-solver.js');

module.exports = function (app) {

  const solver = new SudokuSolver();

  app.route('/api/solve')
    .post((req, res) => {
      const { puzzle } = req.body;

      if (!puzzle) {
        return res.json({ error: 'Required field missing' });
      }

      const validationResult = solver.validate(puzzle);
      if (validationResult.error) {
        // Directly return the error from the solver.validate method
        return res.json(validationResult);
      }

      const solutionResult = solver.solve(puzzle); // This will call the solver's main solve method
      if (solutionResult.error) {
        return res.json(solutionResult); // Return 'Puzzle cannot be solved' error or other validation errors
      }

      return res.json({ solution: solutionResult.solution });

    });

  app.route('/api/check')
    .post((req, res) => {
      const { puzzle, coordinate, value } = req.body;

      // --- Existing validations (ensure these are correct too) ---
      if (!puzzle || !coordinate || !value) {
        return res.json({ error: 'Required field(s) missing' });
      }

      const validationResult = solver.validate(puzzle);
      if (validationResult.error) {
        return res.json(validationResult);
      }

      // --- **FOCUS ON THIS PART FOR 'Invalid coordinate' ERROR** ---
      // Validate coordinate format (e.g., A1, B9)
      // It should be a letter A-I followed by a number 1-9
      const rowChar = coordinate[0]; // e.g., 'A', 'B', 'C', ...
      const colNum = parseInt(coordinate[1]); // e.g., 1, 2, 3, ...

      // Check if rowChar is a valid letter (A-I, case-insensitive)
      // And if colNum is a valid digit (1-9)
      // And if the coordinate string has exactly 2 characters
      if (
        !rowChar ||
        !colNum ||
        coordinate.length !== 2 || // Ensure it's exactly one letter and one number
        !/^[A-I]$/i.test(rowChar) || // Check if the first char is A-I (case-insensitive)
        isNaN(colNum) || // Check if the second char is a number
        colNum < 1 || colNum > 9 // Check if the number is within 1-9
      ) {
        return res.json({ error: 'Invalid coordinate' });
      }

      // Convert coordinate to 0-indexed values for internal use
      const row = rowChar.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0); // 0-8
      const col = colNum - 1; // 0-8

      // Validate value
      const val = parseInt(value);
      if (isNaN(val) || val < 1 || val > 9) {
        return res.json({ error: 'Invalid value' }); // This handles test #14
      }

      const board = solver.transformPuzzleToGrid(puzzle);

      // Check if the value is already at the coordinate and is not conflicting
      if (board[row][col] == val) { // Using == for loose comparison if board stores strings
        const conflict = [];
        // You must still call checkRowPlacement, etc.
        // But these methods should be written such that they don't flag a conflict
        // with the value *at the current coordinate*
        const isRowValid = solver.checkRowPlacement(board, row, col, val);
        const isColValid = solver.checkColPlacement(board, row, col, val);
        const isRegionValid = solver.checkRegionPlacement(board, row, col, val);
        if (!isRowValid) conflict.push('row');
        if (!isColValid) conflict.push('column');
        if (!isRegionValid) conflict.push('region');

        if (conflict.length === 0) {
          return res.json({ valid: true });
        } else {
          // This case means the *initial* puzzle passed was invalid
          // because the value at that coordinate was conflicting with itself.
          return res.json({ valid: false, conflict });
        }
      }

      // Check for conflicts for a new placement (Handles tests #7, #8)
      const conflicts = [];
      if (!solver.checkRowPlacement(board, row, col, val)) {
        conflicts.push('row');
      }
      if (!solver.checkColPlacement(board, row, col, val)) {
        conflicts.push('column');
      }
      if (!solver.checkRegionPlacement(board, row, col, val)) {
        conflicts.push('region');
      }

      if (conflicts.length > 0) {
        res.json({ valid: false, conflict: conflicts });
      } else {
        res.json({ valid: true });
      }

    });
};