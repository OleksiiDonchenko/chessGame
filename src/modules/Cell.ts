import { Board } from "./Board";
import { Colors } from "./Colors";
import { Figure } from "./figures/Figure";
import { King } from "./figures/King";
import { Pawn } from "./figures/Pawn";
import { Rook } from "./figures/Rook";

export class Cell {
  x: number;
  y: number;
  readonly color: Colors;
  figure: Figure | null;
  board: Board;
  available: boolean; // Can you move?
  id: number; // For keys of React
  isKingInCheck: boolean;
  isCheckmate: boolean;
  isVictory: boolean;
  resign: boolean;
  losingByTime: boolean;
  isStalemate: boolean;
  isDraw: boolean;

  constructor(board: Board, x: number, y: number, color: Colors, figure: Figure | null) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.figure = figure;
    this.board = board;
    this.available = false;
    this.id = Math.random();
    this.isKingInCheck = false;
    this.isCheckmate = false;
    this.isVictory = false;
    this.resign = false;
    this.losingByTime = false;
    this.isStalemate = false;
    this.isDraw = false;
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
    if (!figure.isItPromotionFigure) {
      figure.color === Colors.BLACK
        ? this.board.lostBlackFigures.push(figure)
        : this.board.lostWhiteFigures.push(figure);
    } else if (figure.isItPromotionFigure) {
      if (figure.color === Colors.BLACK) {
        let found = false;
        this.board.blackPromotionFigureValues.forEach((value, i) => {
          if (figure.value === value && !found) {
            this.board.blackPromotionFigureValues.splice(i, 1);
            found = true;
          }
        })
      } else if (figure.color === Colors.WHITE) {
        let found = false;
        this.board.whitePromotionFigureValues.forEach((value, i) => {
          if (figure.value === value && !found) {
            this.board.whitePromotionFigureValues.splice(i, 1);
            found = true;
          }
        })
      }
    }
  }

  moveFigure(target: Cell) {
    if (this.figure && this.figure.canMove(target)) {
      const white = Colors.WHITE;
      const black = Colors.BLACK;
      const enemyColor = this.figure.color === Colors.WHITE ? Colors.BLACK : Colors.WHITE;

      if (this.figure instanceof Pawn && this.board.enPassantTarget && target.x === this.board.enPassantTarget.x && target.y === this.board.enPassantTarget.y) {
        const enPassantPawnCell = this.board.getCell(this.board.enPassantTarget.x, this.figure.cell.y);

        if (enPassantPawnCell.figure) {
          this.addLostFigure(enPassantPawnCell.figure);
          enPassantPawnCell.figure = null;
        }
        this.figure.moveFigure(target);
        target.setFigure(this.figure);
        this.figure = null;

        if (this.board.isKingInCheck(white)) {
          this.board.handleMove('check');
          this.board.highlightKing(white);
          this.board.isCheckmate(white);
        } else if (this.board.isKingInCheck(black)) {
          this.board.handleMove('check');
          this.board.highlightKing(black);
          this.board.isCheckmate(black);
        } else {
          this.board.handleMove('capture');
        }

        this.board.isStalemate(enemyColor);
        return;
      }

      // The King moves
      if (this.figure instanceof King) {
        const king = this.figure;
        const enemy = this.isEnemy(target);

        this.figure.moveFigure(target);
        if (target.figure) {
          this.addLostFigure(target.figure);
        }
        target.setFigure(this.figure);
        this.figure = null;

        if (king.castleMove && !king.hasMoved) {
          if (this.board.isKingInCheck(white)) {
            this.board.highlightKing(white);
            this.board.isCheckmate(white);
          } else if (this.board.isKingInCheck(black)) {
            this.board.highlightKing(black);
            this.board.isCheckmate(black);
          } else {
            this.board.handleMove('castle');
          }
        } else if (enemy) {
          if (this.board.isKingInCheck(white)) {
            this.board.handleMove('check');
            this.board.highlightKing(white);
            this.board.isCheckmate(white);
          } else if (this.board.isKingInCheck(black)) {
            this.board.handleMove('check');
            this.board.highlightKing(black);
            this.board.isCheckmate(black);
          } else {
            this.board.handleMove('capture');
          }
        } else if (!enemy && !king.castleMove) {
          if (this.board.isKingInCheck(white)) {
            this.board.handleMove('check');
            this.board.highlightKing(white);
            this.board.isCheckmate(white);
          } else if (this.board.isKingInCheck(black)) {
            this.board.handleMove('check');
            this.board.highlightKing(black);
            this.board.isCheckmate(black);
          } else {
            this.board.handleMove('move');
          }
        }

        this.board.isStalemate(enemyColor);
        king.hasMoved = true;
        king.castleMove = false;

        return;
      }

      // The Rook moves
      if (this.figure instanceof Rook) {
        const rook = this.figure;
        const enemy = this.isEnemy(target);

        this.figure.moveFigure(target);
        if (target.figure) {
          this.addLostFigure(target.figure);
        }
        target.setFigure(this.figure);
        this.figure = null;

        if (rook.castleMove && !rook.firstMove) {
          if (this.board.isKingInCheck(white)) {
            this.board.handleMove('check');
            this.board.highlightKing(white);
            this.board.isCheckmate(white);
          } else if (this.board.isKingInCheck(black)) {
            this.board.handleMove('check');
            this.board.highlightKing(black);
            this.board.isCheckmate(black);
          }
        } else if (enemy) {
          if (this.board.isKingInCheck(white)) {
            this.board.handleMove('check');
            this.board.highlightKing(white);
            this.board.isCheckmate(white);
          } else if (this.board.isKingInCheck(black)) {
            this.board.handleMove('check');
            this.board.highlightKing(black);
            this.board.isCheckmate(black);
          } else {
            this.board.handleMove('capture');
          }
        } else if (!enemy) {
          if (this.board.isKingInCheck(white)) {
            this.board.handleMove('check');
            this.board.highlightKing(white);
            this.board.isCheckmate(white);
          } else if (this.board.isKingInCheck(black)) {
            this.board.handleMove('check');
            this.board.highlightKing(black);
            this.board.isCheckmate(black);
          } else {
            this.board.handleMove('move');
          }
        }

        this.board.isStalemate(enemyColor);
        rook.firstMove = true;

        return;
      }

      // Other figures
      this.figure.moveFigure(target);
      if (target.figure) {
        this.addLostFigure(target.figure);
      }

      // Just a move and check except for the King and the Rook
      if (target.figure === null && this.figure.name !== 'King' && this.figure.name !== 'Rook') {
        const pawn = this.figure;
        target.setFigure(this.figure);
        this.figure = null;
        if (this.board.isKingInCheck(white)) {
          this.board.handleMove('check');
          this.board.highlightKing(white);
          this.board.isCheckmate(white);
        } else if (this.board.isKingInCheck(black)) {
          this.board.handleMove('check');
          this.board.highlightKing(black);
          this.board.isCheckmate(black);
        } else if (pawn instanceof Pawn && (target.y === 0 || target.y === 7)) {
          // 'Silence', because if the pawn gets promotion cell sounds will after transformation
        } else {
          this.board.handleMove('move');
        }

        this.board.isStalemate(enemyColor);
        return;
      }

      // Capture and check except for the King and the Rook
      if (this.isEnemy(target) && this.figure.name !== 'King' && this.figure.name !== 'Rook') {
        const pawn = this.figure;
        target.setFigure(this.figure);
        this.figure = null;
        if (this.board.isKingInCheck(white)) {
          this.board.handleMove('check');
          this.board.highlightKing(white);
          this.board.isCheckmate(white);
        } else if (this.board.isKingInCheck(black)) {
          this.board.handleMove('check');
          this.board.highlightKing(black);
          this.board.isCheckmate(black);
        } else if (pawn instanceof Pawn && (target.y === 0 || target.y === 7)) {
          // 'Silence', because if the pawn gets promotion cell sounds will after transformation
          pawn.isItCapture = true;
        } else {
          this.board.handleMove('capture');
        }

        this.board.isStalemate(enemyColor);
        return;
      }

      return;
    }
  }

  getCopy(): Cell {
    const copy = new Cell(this.board, this.x, this.y, this.color, this.figure ? this.figure.getCopy() : null);
    copy.isKingInCheck = this.isKingInCheck;
    copy.isCheckmate = this.isCheckmate;
    copy.isVictory = this.isVictory;
    copy.resign = this.resign;
    copy.losingByTime = this.losingByTime;
    copy.isStalemate = this.isStalemate;
    copy.isDraw = this.isDraw;

    return copy;
  }
}