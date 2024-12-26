import { Cell } from "./Cell";
import { Colors } from "./Colors";
import { Bishop } from "./figures/Bishop";
import { Figure } from "./figures/Figure";
import { King } from "./figures/King";
import { Knight } from "./figures/Knight";
import { Pawn } from "./figures/Pawn";
import { Queen } from "./figures/Queen";
import { Rook } from "./figures/Rook";

export class Board {
  cells: Cell[][] = [];
  lostBlackFigures: Figure[] = [];
  lostWhiteFigures: Figure[] = [];
  inPassingTarget: Cell | null = null;

  public initCells() {
    for (let i = 0; i < 8; i++) {
      const row: Cell[] = [];
      for (let j = 0; j < 8; j++) {
        if ((i + j) % 2 !== 0) {
          row.push(new Cell(this, j, i, Colors.BLACK, null)); // Black cells
        } else {
          row.push(new Cell(this, j, i, Colors.WHITE, null)); // White cells
        }
      }
      this.cells.push(row);
    }
  }

  public getCopyBoard(): Board {
    const newBoard = new Board();
    newBoard.cells = this.cells;
    newBoard.lostBlackFigures = this.lostBlackFigures;
    newBoard.lostWhiteFigures = this.lostWhiteFigures;
    return newBoard;
  }

  public highlightCells(selectedCell: Cell | null) {
    for (let i = 0; i < this.cells.length; i++) {
      const row = this.cells[i];
      for (let j = 0; j < row.length; j++) {
        const target = row[j];
        target.available = !!selectedCell?.figure?.canMove(target);
      }
    }
  }

  public getCell(x: number, y: number) {
    return this.cells[y][x];
  }

  public isUnderAttack(cell: Cell, color: Colors): boolean {
    for (let row of this.cells) {
      for (let currentCell of row) {
        const figure = currentCell.figure;
        if (figure && figure.color !== color) {
          if (figure.canAttack(cell)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  public isKingInCheck(color: Colors): boolean {
    const kingCell = this.findKing(color);
    if (!kingCell) {
      return false;
    }
    return this.isUnderAttack(kingCell, color);
  }

  public findKing(color: Colors): Cell | null {
    for (let row of this.cells) {
      for (let cell of row) {
        if (cell.figure instanceof King && cell.figure.color === color) {
          return cell;
        }
      }
    }
    return null;
  }

  public highlightKing(color: Colors) {
    const kingCell = this.findKing(color);
    if (kingCell) {
      kingCell.isKingInCheck = true;
    }
  }

  public attackerCellOnKing(cell: Cell, color: Colors): boolean {
    const kingCell = this.findKing(color);
    if (!kingCell || !this.isKingInCheck(color)) {
      return false; // If there is no check, blocking is not required
    }
    // Determine the piece that attacks the king
    const attackerCells: Cell[] = [];
    for (let row of this.cells) {
      for (let currentCell of row) {
        const figure = currentCell.figure;
        if (figure && figure.color !== color && figure.canAttack(kingCell)) {
          attackerCells.push(currentCell);
        }
      }
    }
    // If check is declared by more than one piece, blocking is not possible
    if (attackerCells.length !== 1) {
      return false;
    }
    const attackerCell = attackerCells[0];
    if (cell === attackerCell) {
      return true;
    }
    return false;
  }

  public canBlockCheck(cell: Cell, color: Colors): boolean {
    // Find the king's cell
    const kingCell = this.findKing(color);
    if (!kingCell || !this.isKingInCheck(color)) {
      return false; // If there is no check, blocking is not required
    }

    // Determine the piece that attacks the king
    const attackerCells: Cell[] = [];
    for (let row of this.cells) {
      for (let currentCell of row) {
        const figure = currentCell.figure;
        if (figure && figure.color !== color && figure.canAttack(kingCell)) {
          attackerCells.push(currentCell);
        }
      }
    }

    // If check is declared by more than one piece, blocking is not possible
    if (attackerCells.length !== 1) {
      return false;
    }

    const attackerCell = attackerCells[0];
    const attackingFigure = attackerCell.figure!;

    // If it's check from the knight, the only way to block it is to take the knight
    if (attackingFigure instanceof Knight) {
      return cell === attackerCell;
    }

    // Determine the cells in the path between the king and the attacking piece
    const blockingCells: Cell[] = [];
    let x = attackerCell.x;
    let y = attackerCell.y;

    const xStep = Math.sign(kingCell.x - x);
    const yStep = Math.sign(kingCell.y - y);

    while (x !== kingCell.x || y !== kingCell.y) {
      x += xStep;
      y += yStep;
      const pathCell = this.getCell(x, y);
      blockingCells.push(pathCell);
    }

    // Check if the current cell coincides with one of the cells on the path
    return blockingCells.includes(cell);
  }

  public canMoveWithoutCheck(fromCell: Cell, toCell: Cell, color: Colors): boolean {
    const originalFigure = fromCell.figure; // Save the figure, which was on the cell
    const originalEnemyFigure = toCell.figure;

    if (toCell.figure && toCell.figure.color !== color) {
      // Moving our figure
      fromCell.figure = null;
      toCell.figure = originalFigure;

      // Checking, is King safe?
      const isKingSafe = !this.isKingInCheck(color);

      // And put everything back in place
      toCell.figure = originalEnemyFigure;
      fromCell.figure = originalFigure;

      return isKingSafe;
    } else {
      // Moving our figure
      fromCell.figure = null;
      toCell.figure = originalFigure;

      // Checking, is King safe?
      const isKingSafe = !this.isKingInCheck(color);

      // And put everything back in place
      toCell.figure = null;
      fromCell.figure = originalFigure;

      return isKingSafe;
    }
  }

  public findRook(color: Colors, x: number, y: number): Rook | null {
    for (let row of this.cells) {
      for (let cell of row) {
        const rook = cell.figure;
        if (cell.x === x && cell.y === y && rook instanceof Rook && rook.color === color) {
          return rook;
        }
      }
    }
    return null;
  }

  public findCellForRookCastle(x: number, y: number): Cell | null {
    for (let row of this.cells) {
      for (let cell of row) {
        if (cell.x === x && cell.y === y) {
          return cell;
        }
      }
    }
    return null;
  }

  public findCellForKingCastle(x: number, y: number): Cell | null {
    for (let row of this.cells) {
      for (let cell of row) {
        if (cell.x === x && cell.y === y) {
          return cell;
        }
      }
    }
    return null;
  }

  private addKings() {
    new King(Colors.BLACK, this.getCell(4, 0));
    new King(Colors.WHITE, this.getCell(4, 7));
  }

  private addQueens() {
    new Queen(Colors.BLACK, this.getCell(3, 0));
    new Queen(Colors.WHITE, this.getCell(3, 7));
  }

  private addRooks() {
    new Rook(Colors.BLACK, this.getCell(0, 0));
    new Rook(Colors.BLACK, this.getCell(7, 0));
    new Rook(Colors.WHITE, this.getCell(0, 7));
    new Rook(Colors.WHITE, this.getCell(7, 7));
  }

  private addBishops() {
    new Bishop(Colors.BLACK, this.getCell(2, 0));
    new Bishop(Colors.BLACK, this.getCell(5, 0));
    new Bishop(Colors.WHITE, this.getCell(2, 7));
    new Bishop(Colors.WHITE, this.getCell(5, 7));
  }

  private addKnights() {
    new Knight(Colors.BLACK, this.getCell(1, 0));
    new Knight(Colors.BLACK, this.getCell(6, 0));
    new Knight(Colors.WHITE, this.getCell(1, 7));
    new Knight(Colors.WHITE, this.getCell(6, 7));
  }

  private addPawns() {
    for (let i = 0; i < 8; i++) {
      new Pawn(Colors.BLACK, this.getCell(i, 1));
      new Pawn(Colors.WHITE, this.getCell(i, 6));
    }
  }

  public addFigures() {
    this.addKings();
    this.addQueens();
    this.addRooks();
    this.addBishops();
    this.addKnights();
    this.addPawns();
  }
}