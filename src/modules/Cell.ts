import { Board } from "./Board";
import { Colors } from "./Colors";
import { Figure } from "./figures/Figure";
import { King } from "./figures/King";
import { Pawn } from "./figures/Pawn";

export class Cell {
  x: number;
  y: number;
  readonly color: Colors;
  figure: Figure | null;
  board: Board;
  available: boolean; // Can you move?
  id: number; // For keys of React
  isKingInCheck: boolean;

  constructor(board: Board, x: number, y: number, color: Colors, figure: Figure | null) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.figure = figure;
    this.board = board;
    this.available = false;
    this.id = Math.random();
    this.isKingInCheck = false;
  }

  isEmpty(ignoreOpponentKing: boolean = false, color: Colors): boolean {
    if (ignoreOpponentKing && this.figure instanceof King && this.figure.color !== color) {
      return true;
    }
    return this.figure === null;
  }

  isEnemy(target: Cell): boolean {
    if (target.figure) {
      return this.figure?.color !== target.figure.color;
    }
    return false;
  }

  isEmptyVertical(target: Cell, color: Colors): boolean {
    if (this.x !== target.x)
      return false;

    const min = Math.min(this.y, target.y);
    const max = Math.max(this.y, target.y);
    for (let y = min + 1; y < max; y++) {
      const cell = this.board.getCell(this.x, y);
      if (!cell.isEmpty(true, color)) {
        return false;
      }
    }
    return true;
  }

  isEmptyHorizontal(target: Cell, color: Colors): boolean {
    if (this.y !== target.y)
      return false;

    const min = Math.min(this.x, target.x);
    const max = Math.max(this.x, target.x);
    for (let x = min + 1; x < max; x++) {
      if (!this.board.getCell(x, this.y).isEmpty(true, color)) {
        return false;
      }
    }
    return true;
  }

  isEmptyDiagonal(target: Cell, color: Colors): boolean {
    const absX = Math.abs(target.x - this.x);
    const absY = Math.abs(target.y - this.y);
    if (absY !== absX)
      return false;

    const dx = this.x < target.x ? 1 : -1;
    const dy = this.y < target.y ? 1 : -1;

    for (let i = 1; i < absY; i++) {
      if (!this.board.getCell(this.x + dx * i, this.y + dy * i).isEmpty(true, color))
        return false;
    }

    return true;
  }

  isPathClear(target: Cell, color: Colors): boolean {
    const dx = target.x - this.x;
    const dy = target.y - this.y;

    const stepX = dx === 0 ? 0 : dx / Math.abs(dx);
    const stepY = dy === 0 ? 0 : dy / Math.abs(dy);

    let x = this.x + stepX;
    let y = this.y + stepY;

    while (x !== target.x || y !== target.y) {
      const cell = this.board.getCell(x, y);
      if (!cell.isEmpty(true, color) && cell.figure?.color !== this.figure?.color) {
        return false;
      }
      if (!cell.isEmpty(true, color) && cell.figure?.color === this.figure?.color) {
        return false;
      }
      x += stepX;
      y += stepY;
    }

    return true;
  }

  setFigure(figure: Figure) {
    this.figure = figure;
    this.figure.cell = this;
  }

  addLostFigure(figure: Figure) {
    figure.color === Colors.BLACK
      ? this.board.lostBlackFigures.push(figure)
      : this.board.lostWhiteFigures.push(figure);
  }

  moveFigure(target: Cell) {
    if (this.figure && this.figure.canMove(target)) {
      if (this.figure instanceof Pawn && this.board.inPassingTarget && target.x === this.board.inPassingTarget.x && target.y === this.board.inPassingTarget.y) {
        const passingPawnCell = this.board.getCell(this.board.inPassingTarget.x, this.figure.cell.y);

        if (passingPawnCell.figure) {
          this.addLostFigure(passingPawnCell.figure);
          passingPawnCell.figure = null;
        }
      }

      this.figure.moveFigure(target);
      if (target.figure) {
        this.addLostFigure(target.figure);
      }
      target.setFigure(this.figure);
      this.figure = null;

      if (this.board.isKingInCheck(Colors.WHITE)) {
        this.board.highlightKing(Colors.WHITE);
      }

      if (this.board.isKingInCheck(Colors.BLACK)) {
        this.board.highlightKing(Colors.BLACK);
      }
    }
  }
}