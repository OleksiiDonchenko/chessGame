import { Board } from "./Board";
import { Colors } from "../Colors";
import { Piece } from "../pieces/Piece";
import { King } from "../pieces/King";
import { Pawn } from "../pieces/Pawn";
import { Rook } from "../pieces/Rook";

export class Square {
  x: number;
  y: number;
  readonly color: Colors;
  piece: Piece | null;
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

  constructor(board: Board, x: number, y: number, color: Colors, piece: Piece | null) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.piece = piece;
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
    if (ignoreOpponentKing && this.piece instanceof King && this.piece.color !== color) {
      return true;
    }
    return this.piece === null;
  }

  isEnemy(target: Square): boolean {
    if (target.piece) {
      return this.piece?.color !== target.piece.color;
    }
    return false;
  }

  isEmptyVertical(target: Square, color: Colors): boolean {
    if (this.x !== target.x)
      return false;

    const min = Math.min(this.y, target.y);
    const max = Math.max(this.y, target.y);
    for (let y = min + 1; y < max; y++) {
      const square = this.board.getSquare(this.x, y);
      if (!square.isEmpty(true, color)) {
        return false;
      }
    }
    return true;
  }

  isEmptyHorizontal(target: Square, color: Colors): boolean {
    if (this.y !== target.y)
      return false;

    const min = Math.min(this.x, target.x);
    const max = Math.max(this.x, target.x);
    for (let x = min + 1; x < max; x++) {
      if (!this.board.getSquare(x, this.y).isEmpty(true, color)) {
        return false;
      }
    }
    return true;
  }

  isEmptyDiagonal(target: Square, color: Colors): boolean {
    const absX = Math.abs(target.x - this.x);
    const absY = Math.abs(target.y - this.y);
    if (absY !== absX)
      return false;

    const dx = this.x < target.x ? 1 : -1;
    const dy = this.y < target.y ? 1 : -1;

    for (let i = 1; i < absY; i++) {
      if (!this.board.getSquare(this.x + dx * i, this.y + dy * i).isEmpty(true, color))
        return false;
    }

    return true;
  }

  isPathClear(target: Square, color: Colors): boolean {
    const dx = target.x - this.x;
    const dy = target.y - this.y;

    const stepX = dx === 0 ? 0 : dx / Math.abs(dx);
    const stepY = dy === 0 ? 0 : dy / Math.abs(dy);

    let x = this.x + stepX;
    let y = this.y + stepY;

    while (x !== target.x || y !== target.y) {
      const square = this.board.getSquare(x, y);
      if (!square.isEmpty(true, color) && square.piece?.color !== this.piece?.color) {
        return false;
      }
      if (!square.isEmpty(true, color) && square.piece?.color === this.piece?.color) {
        return false;
      }
      x += stepX;
      y += stepY;
    }

    return true;
  }

  setPiece(piece: Piece) {
    this.piece = piece;
    this.piece.square = this;
  }

  addLostPiece(piece: Piece) {
    if (!piece.isItPromotionPiece) {
      piece.color === Colors.BLACK
        ? this.board.lostBlackPieces.push(piece)
        : this.board.lostWhitePieces.push(piece);
    } else if (piece.isItPromotionPiece) {
      if (piece.color === Colors.BLACK) {
        let found = false;
        this.board.blackPromotionPieceValues.forEach((value, i) => {
          if (piece.value === value && !found) {
            this.board.blackPromotionPieceValues.splice(i, 1);
            found = true;
          }
        })
      } else if (piece.color === Colors.WHITE) {
        let found = false;
        this.board.whitePromotionPieceValues.forEach((value, i) => {
          if (piece.value === value && !found) {
            this.board.whitePromotionPieceValues.splice(i, 1);
            found = true;
          }
        })
      }
    }
  }

  movePiece(target: Square) {
    if (this.piece && this.piece.canMove(target)) {
      const white = Colors.WHITE;
      const black = Colors.BLACK;
      const enemyColor = this.piece.color === Colors.WHITE ? Colors.BLACK : Colors.WHITE;

      if (this.piece instanceof Pawn && this.board.enPassantTarget && target.x === this.board.enPassantTarget.x && target.y === this.board.enPassantTarget.y) {
        const enPassantPawnSquare = this.board.getSquare(this.board.enPassantTarget.x, this.piece.square.y);

        if (enPassantPawnSquare.piece) {
          this.addLostPiece(enPassantPawnSquare.piece);
          enPassantPawnSquare.piece = null;
        }
        this.piece.movePiece(target);
        target.setPiece(this.piece);
        this.piece = null;

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
      if (this.piece instanceof King) {
        const king = this.piece;
        const enemy = this.isEnemy(target);

        this.piece.movePiece(target);
        if (target.piece) {
          this.addLostPiece(target.piece);
        }
        target.setPiece(this.piece);
        this.piece = null;

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
      if (this.piece instanceof Rook) {
        const rook = this.piece;
        const enemy = this.isEnemy(target);

        this.piece.movePiece(target);
        if (target.piece) {
          this.addLostPiece(target.piece);
        }
        target.setPiece(this.piece);
        this.piece = null;

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

      // Other pieces
      this.piece.movePiece(target);
      if (target.piece) {
        this.addLostPiece(target.piece);
      }

      // Just a move and check except for the King and the Rook
      if (target.piece === null && this.piece.name !== 'King' && this.piece.name !== 'Rook') {
        const pawn = this.piece;
        target.setPiece(this.piece);
        this.piece = null;
        if (this.board.isKingInCheck(white)) {
          this.board.handleMove('check');
          this.board.highlightKing(white);
          this.board.isCheckmate(white);
        } else if (this.board.isKingInCheck(black)) {
          this.board.handleMove('check');
          this.board.highlightKing(black);
          this.board.isCheckmate(black);
        } else if (pawn instanceof Pawn && (target.y === 0 || target.y === 7)) {
          // 'Silence', because if the pawn gets promotion square sounds will after transformation
        } else {
          this.board.handleMove('move');
        }

        this.board.isStalemate(enemyColor);
        return;
      }

      // Capture and check except for the King and the Rook
      if (this.isEnemy(target) && this.piece.name !== 'King' && this.piece.name !== 'Rook') {
        const pawn = this.piece;
        target.setPiece(this.piece);
        this.piece = null;
        if (this.board.isKingInCheck(white)) {
          this.board.handleMove('check');
          this.board.highlightKing(white);
          this.board.isCheckmate(white);
        } else if (this.board.isKingInCheck(black)) {
          this.board.handleMove('check');
          this.board.highlightKing(black);
          this.board.isCheckmate(black);
        } else if (pawn instanceof Pawn && (target.y === 0 || target.y === 7)) {
          // 'Silence', because if the pawn gets promotion square sounds will after transformation
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

  getCopy(): Square {
    const copy = new Square(this.board, this.x, this.y, this.color, this.piece ? this.piece.getCopy() : null);
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