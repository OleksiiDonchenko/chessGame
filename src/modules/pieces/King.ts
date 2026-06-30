import { Square } from "../board/Square";
import { Colors } from "../Colors";
import { Piece, PieceNames } from "./Piece";
import blackLogo from '../../assets/black_king.png';
import whiteLogo from '../../assets/white_king.png';

export class King extends Piece {
  hasMoved: boolean;
  castleMove: boolean;

  constructor(color: Colors, square: Square) {
    super(color, square);
    this.logo = color === Colors.BLACK ? blackLogo : whiteLogo;
    this.name = PieceNames.KING;
    this.hasMoved = false;
    this.castleMove = false;
  }

  canMove(target: Square): boolean {
    if (!super.canMove(target))
      return false;

    const dx = Math.abs(target.x - this.square.x);
    const dy = Math.abs(target.y - this.square.y);
    const x = target.x - this.square.x;

    const standardMoves = target.isEmpty(true, this.color) && !this.square.board.isUnderAttack(target, this.color);

    const whiteRookShortCastle = this.square.board.findRook(this.color, 7, 7);
    const whiteRookLongCastle = this.square.board.findRook(this.color, 0, 7);
    const blackRookShortCastle = this.square.board.findRook(this.color, 7, 0);
    const blackRookLongCastle = this.square.board.findRook(this.color, 0, 0);

    const whiteShortCastleMove = (x === 2 && dy === 0) && !this.hasMoved
      && whiteRookShortCastle ? this.square.isPathClear(whiteRookShortCastle?.square, this.color) : false;
    const blackShortCastleMove = (x === 2 && dy === 0) && !this.hasMoved
      && blackRookShortCastle ? this.square.isPathClear(blackRookShortCastle?.square, this.color) : false;
    const whiteLongCastleMove = (x === -2 && dy === 0) && !this.hasMoved
      && whiteRookLongCastle ? this.square.isPathClear(whiteRookLongCastle?.square, this.color) : false;
    const blackLongCastleMove = (x === -2 && dy === 0) && !this.hasMoved
      && blackRookLongCastle ? this.square.isPathClear(blackRookLongCastle?.square, this.color) : false;

    if (this.color === Colors.WHITE) {
      const isWhiteShortCastlePossibleSquare = this.square.board.findSquareForKingCastle(5, 7);
      const isWhiteLongCastlePossibleSquareOne = this.square.board.findSquareForKingCastle(2, 7);
      const isWhiteLongCastlePossibleSquareTwo = this.square.board.findSquareForKingCastle(3, 7);

      if (isWhiteShortCastlePossibleSquare && isWhiteLongCastlePossibleSquareOne && isWhiteLongCastlePossibleSquareTwo) {
        if ((dx === 1 && dy <= 1) || (dy === 1 && dx <= 1)
          || whiteShortCastleMove && whiteRookShortCastle?.shortCastle && !this.square.isKingInCheck
          && !this.square.board.isUnderAttack(isWhiteShortCastlePossibleSquare, this.color)
          || whiteLongCastleMove && whiteRookLongCastle?.longCastle && !this.square.isKingInCheck
          && !this.square.board.isUnderAttack(isWhiteLongCastlePossibleSquareOne, this.color)
          && !this.square.board.isUnderAttack(isWhiteLongCastlePossibleSquareTwo, this.color)) {
          if (standardMoves || this.square.isEnemy(target)) {
            const isKingUnderAttackAfterMove = !this.square.board.canMoveWithoutCheck(this.square, target, this.color);
            if (isKingUnderAttackAfterMove) {
              return false; // If the King is under check, the move is not possible
            }
            return true;
          }
        }
      }
    } else {
      const isBlackShortCastlePossibleSquare = this.square.board.findSquareForKingCastle(5, 0);
      const isBlackLongCastlePossibleSquareOne = this.square.board.findSquareForKingCastle(2, 0);
      const isBlackLongCastlePossibleSquareTwo = this.square.board.findSquareForKingCastle(3, 0);

      if (isBlackShortCastlePossibleSquare && isBlackLongCastlePossibleSquareOne && isBlackLongCastlePossibleSquareTwo) {
        if ((dx === 1 && dy <= 1) || (dy === 1 && dx <= 1)
          || blackShortCastleMove && blackRookShortCastle?.shortCastle && !this.square.isKingInCheck
          && !this.square.board.isUnderAttack(isBlackShortCastlePossibleSquare, this.color)
          || blackLongCastleMove && blackRookLongCastle?.longCastle && !this.square.isKingInCheck
          && !this.square.board.isUnderAttack(isBlackLongCastlePossibleSquareOne, this.color)
          && !this.square.board.isUnderAttack(isBlackLongCastlePossibleSquareTwo, this.color)) {
          if (standardMoves || this.square.isEnemy(target)) {
            const isKingUnderAttackAfterMove = !this.square.board.canMoveWithoutCheck(this.square, target, this.color);
            if (isKingUnderAttackAfterMove) {
              return false; // If the King is under check, the move is not possible
            }
            return true;
          }
        }
      }
    }

    return false;
  }

  movePiece(target: Square): void {
    // Do the basic piece movement
    super.movePiece(target);

    const whiteRookShortCastle = this.square.board.findRook(this.color, 7, 7);
    const whiteRookLongCastle = this.square.board.findRook(this.color, 0, 7);
    const blackRookShortCastle = this.square.board.findRook(this.color, 7, 0);
    const blackRookLongCastle = this.square.board.findRook(this.color, 0, 0);

    let squareForRookCastle;

    if (this.color === Colors.WHITE) {
      if (target.x === 6 && target.y === 7 && !this.hasMoved && whiteRookShortCastle?.shortCastle) {
        squareForRookCastle = this.square.board.findSquareForRookCastle(5, 7);
        if (squareForRookCastle) {
          this.castleMove = true;
          whiteRookShortCastle.castleMove = true;
          whiteRookShortCastle.square.movePiece(squareForRookCastle);
        }
      } else if (target.x === 2 && target.y === 7 && !this.hasMoved && whiteRookLongCastle?.longCastle) {
        squareForRookCastle = this.square.board.findSquareForRookCastle(3, 7);
        if (squareForRookCastle) {
          this.castleMove = true;
          whiteRookLongCastle.castleMove = true;
          whiteRookLongCastle.square.movePiece(squareForRookCastle);
        }
      }
    } else {
      if (target.x === 6 && target.y === 0 && !this.hasMoved && blackRookShortCastle?.shortCastle) {
        squareForRookCastle = this.square.board.findSquareForRookCastle(5, 0);
        if (squareForRookCastle) {
          this.castleMove = true;
          blackRookShortCastle.castleMove = true;
          blackRookShortCastle.square.movePiece(squareForRookCastle);
        }
      } else if (target.x === 2 && target.y === 0 && !this.hasMoved && blackRookLongCastle?.longCastle) {
        squareForRookCastle = this.square.board.findSquareForRookCastle(3, 0);
        if (squareForRookCastle) {
          this.castleMove = true;
          blackRookLongCastle.castleMove = true;
          blackRookLongCastle.square.movePiece(squareForRookCastle);
        }
      }
    }
  }

  canAttack(target: Square): boolean {
    const dx = Math.abs(target.x - this.square.x);
    const dy = Math.abs(target.y - this.square.y);

    return dx <= 1 && dy <= 1;
  }

  getCopy(): King {
    const copy = new King(this.color, this.square);
    copy.hasMoved = this.hasMoved;
    copy.castleMove = this.castleMove;
    return copy;
  }
}