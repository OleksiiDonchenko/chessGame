import { Piece, PieceNames } from "./Piece";
import { Square } from "../board/Square";
import { Colors } from "../Colors";
import blackLogo from '../../assets/black_pawn.png';
import whiteLogo from '../../assets/white_pawn.png';

export class Pawn extends Piece {

  isFirstStep: boolean;
  isItCapture: boolean;

  constructor(color: Colors, square: Square) {
    super(color, square);
    this.logo = color === Colors.BLACK ? blackLogo : whiteLogo;
    this.name = PieceNames.PAWN;
    this.value = 1;
    this.isFirstStep = true;
    this.isItCapture = false;
  }

  canMove(target: Square): boolean {
    if (!super.canMove(target))
      return false;
    const direction = this.square.piece?.color === Colors.BLACK ? 1 : -1;
    const firstStepDirection = this.square.piece?.color === Colors.BLACK ? 2 : -2;
    const canMoveWithoutCheck: boolean = this.square.board.canMoveWithoutCheck(this.square, target, this.color);
    const moveForward: boolean = target.y === this.square.y + direction
      && target.x === this.square.x
      && this.square.board.getSquare(target.x, target.y).isEmpty(true, this.color)
      && target.piece?.name !== 'King';
    const moveForward2Squares: boolean = this.isFirstStep
      && target.y === this.square.y + firstStepDirection
      && target.x === this.square.x
      && this.square.board.getSquare(target.x, target.y).isEmpty(true, this.color)
      && this.square.board.getSquare(target.x, this.square.y + direction).isEmpty(true, this.color)
      && target.piece?.name !== 'King';
    const attack: boolean = target.y === this.square.y + direction
      && (target.x === this.square.x + 1 || target.x === this.square.x - 1)
      && this.square.isEnemy(target);
    const canBlockCheck: boolean = this.square.board.canBlockCheck(target, this.color);
    const attackerSquareOnKing: boolean = this.square.board.attackerSquareOnKing(target, this.color);

    if (!this.square.board.findKing(this.color)?.isKingInCheck) {
      if (moveForward && canMoveWithoutCheck) {
        return true;
      }
      if (moveForward2Squares && canMoveWithoutCheck) {
        return true;
      }
      if (attack && canMoveWithoutCheck) {
        return true;
      }
    } else {
      if (moveForward && canBlockCheck) {
        return true;
      }
      if (moveForward2Squares && canBlockCheck) {
        return true;
      }
      if (attack && attackerSquareOnKing && canMoveWithoutCheck) {
        return true;
      }
    }

    // The hit in passing
    if (this.square.y === 3 && this.square.piece?.color === 'white'
      || this.square.y === 4 && this.square.piece?.color === 'black') {
      if (this.square.piece?.color === 'white') {
        if (this.square.board.enPassantTarget
          && target.x === this.square.board.enPassantTarget?.x && this.square.board.enPassantTarget?.x === this.square.x + 1
          && target.y === this.square.board.enPassantTarget?.y && this.square.board.enPassantTarget?.y === 2 ||
          this.square.board.enPassantTarget
          && target.x === this.square.board.enPassantTarget?.x && this.square.board.enPassantTarget?.x === this.square.x - 1
          && target.y === this.square.board.enPassantTarget?.y && this.square.board.enPassantTarget?.y === 2) {
          return true;
        }
      } else if (this.square.piece?.color === 'black') {
        if (this.square.board.enPassantTarget
          && target.x === this.square.board.enPassantTarget?.x && this.square.board.enPassantTarget?.x === this.square.x + 1
          && target.y === this.square.board.enPassantTarget?.y && this.square.board.enPassantTarget?.y === 5 ||
          this.square.board.enPassantTarget
          && target.x === this.square.board.enPassantTarget?.x && this.square.board.enPassantTarget?.x === this.square.x - 1
          && target.y === this.square.board.enPassantTarget?.y && this.square.board.enPassantTarget?.y === 5) {
          return true;
        }
      }
    }

    return false;
  }

  movePiece(target: Square): void {
    // Do the basic piece movement
    super.movePiece(target);
    // Pawn did first step
    this.isFirstStep = false;

    const direction = this.color === Colors.BLACK ? 1 : -1;

    // Checking whether a move of 2 squares
    if (Math.abs(target.y - this.square.y) === 2) {
      this.square.board.enPassantTarget = this.square.board.getSquare(this.square.x, this.square.y + direction);
    } else {
      this.square.board.enPassantTarget = null;
    }

    // Checking whether hit was in passing
    if (this.square.board.enPassantTarget && target.x === this.square.board.enPassantTarget?.x && target.y === this.square.board.enPassantTarget?.y) {
      const enemySquare = this.square.board.getSquare(target.x, target.y - direction);
      if (enemySquare.piece instanceof Pawn && enemySquare.piece.color !== this.color) {
        enemySquare.piece = null;
      }
    }
  }

  canAttack(target: Square): boolean {
    const direction = this.color === Colors.BLACK ? 1 : -1;

    return (target.y === this.square.y + direction && (target.x === this.square.x + 1 || target.x === this.square.x - 1));
  }

  getCopy(): Pawn {
    const copy = new Pawn(this.color, this.square);
    copy.isFirstStep = this.isFirstStep;
    copy.isItCapture = this.isItCapture;
    return copy;
  }
}