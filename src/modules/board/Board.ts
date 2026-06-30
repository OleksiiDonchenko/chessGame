import { Square } from "./Square";
import { Colors } from "../Colors";
import { Bishop } from "../pieces/Bishop";
import { Piece } from "../pieces/Piece";
import { King } from "../pieces/King";
import { Knight } from "../pieces/Knight";
import { Pawn } from "../pieces/Pawn";
import { Queen } from "../pieces/Queen";
import { Rook } from "../pieces/Rook";
import moveSound from "../../assets/sounds/move.mp3";
import checkSound from "../../assets/sounds/check.mp3";
import captureSound from "../../assets/sounds/capture.mp3";
import castleSound from "../../assets/sounds/castle.mp3";

export class Board {
  squares: Square[][] = [];
  lostBlackPieces: Piece[] = [];
  lostWhitePieces: Piece[] = [];
  whitePromotionPieceValues: number[] = [];
  blackPromotionPieceValues: number[] = [];
  enPassantTarget: Square | null = null;

  public initSquares() {
    for (let i = 0; i < 8; i++) {
      const row: Square[] = [];
      for (let j = 0; j < 8; j++) {
        if ((i + j) % 2 !== 0) {
          row.push(new Square(this, j, i, Colors.BLACK, null)); // Black squares
        } else {
          row.push(new Square(this, j, i, Colors.WHITE, null)); // White squares
        }
      }
      this.squares.push(row);
    }
  }

  public getCopyBoard(): Board {
    const newBoard = new Board();
    newBoard.squares = this.squares;
    newBoard.lostBlackPieces = this.lostBlackPieces;
    newBoard.lostWhitePieces = this.lostWhitePieces;
    newBoard.whitePromotionPieceValues = this.whitePromotionPieceValues;
    newBoard.blackPromotionPieceValues = this.blackPromotionPieceValues;
    return newBoard;
  }

  public getDeepCopyBoard(): Board {
    const newBoard = new Board();
    newBoard.squares = this.squares.map(row => row.map(square => square.getCopy()));
    newBoard.squares.forEach(row => row.forEach(square => {
      square.board = newBoard;
      if (square.piece) {
        square.piece = square.piece.getCopy();
        square.piece.square = square;
      }
    }));
    newBoard.lostBlackPieces = [...this.lostBlackPieces];
    newBoard.lostWhitePieces = [...this.lostWhitePieces];
    newBoard.whitePromotionPieceValues = [...this.whitePromotionPieceValues];
    newBoard.blackPromotionPieceValues = [...this.blackPromotionPieceValues];

    const rows = this.squares;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!this.enPassantTarget) {
        for (let j = 0; j < row.length; j++) {
          const square = row[j];
          if (square.board.enPassantTarget) {
            this.enPassantTarget = square.board.getSquare(square.board.enPassantTarget.x, square.board.enPassantTarget.y);
          }
          break;
        }
        break;
      }
    }

    newBoard.enPassantTarget = this.enPassantTarget;
    return newBoard;
  }

  public highlightSquares(selectedSquare: Square | null) {
    for (let i = 0; i < this.squares.length; i++) {
      const row = this.squares[i];
      for (let j = 0; j < row.length; j++) {
        const target = row[j];
        target.available = !!selectedSquare?.piece?.canMove(target);
      }
    }
  }

  public getSquare(x: number, y: number) {
    return this.squares[y][x];
  }

  public getSquareById(id: string): Square | null {
    const [x, y] = id.split('-').map(Number);
    if (!isNaN(x) && !isNaN(y)) {
      return this.squares[y]?.[x] || null;
    }
    return null;
  }

  public canKingEscape(color: Colors): boolean {
    const kingSquare = this.findKing(color);
    const squaresForEscape: Square[] = [];

    if (kingSquare && kingSquare.isKingInCheck) {
      for (let i = 0; i < this.squares.length; i++) {
        const row = this.squares[i];
        for (let j = 0; j < row.length; j++) {
          const target = row[j];
          if (kingSquare.piece?.canMove(target)) {
            squaresForEscape.push(target);
          }
        }
      }
    }

    if (squaresForEscape.length === 0) {
      return false;
    }
    return true;
  }

  public canBlockOrCapture(color: Colors): boolean {
    const squaresForBlockOrCapture: Square[] = [];
    const allies: Piece[] = [];

    for (let i = 0; i < this.squares.length; i++) {
      const row = this.squares[i];
      for (let j = 0; j < row.length; j++) {
        const target = row[j];
        if (target.piece?.color === color && target.piece.name !== 'King') {
          allies.push(target.piece);
        }
      }
    }

    allies.forEach(piece => {
      this.squares.forEach(row => {
        row.forEach(target => {
          if (piece.canMove(target)) {
            squaresForBlockOrCapture.push(target);
          }
        })
      })
    })

    if (squaresForBlockOrCapture.length === 0) {
      return false;
    }
    return true;
  }

  public isCheckmate(color: Colors) {
    const victoryColor = color === Colors.WHITE ? Colors.BLACK : Colors.WHITE;
    if (!this.canKingEscape(color) && !this.canBlockOrCapture(color)) {
      const kingSquare = this.findKing(color);
      const victoryKing = this.findKing(victoryColor);
      if (kingSquare && victoryKing) {
        kingSquare.isCheckmate = true;
        victoryKing.isVictory = true;
        return;
      }
    }
    return;
  }

  public canKingMove(color: Colors): boolean {
    const kingSquare = this.findKing(color);
    const squaresForMove: Square[] = [];

    if (kingSquare) {
      for (let i = 0; i < this.squares.length; i++) {
        const row = this.squares[i];
        for (let j = 0; j < row.length; j++) {
          const target = row[j];
          if (kingSquare.piece?.canMove(target)) {
            squaresForMove.push(target);
          }
        }
      }
    }

    if (squaresForMove.length === 0) {
      return false;
    }
    return true;
  }

  public canAlliesMakeMoves(color: Colors): boolean {
    const squaresForMoves: Square[] = [];
    const allies: Piece[] = [];

    for (let i = 0; i < this.squares.length; i++) {
      const row = this.squares[i];
      for (let j = 0; j < row.length; j++) {
        const target = row[j];
        if (target.piece?.color === color && target.piece.name !== 'King') {
          allies.push(target.piece);
        }
      }
    }

    allies.forEach(piece => {
      this.squares.forEach(row => {
        row.forEach(target => {
          if (piece.canMove(target)) {
            squaresForMoves.push(target);
          }
        })
      })
    })

    if (squaresForMoves.length === 0) {
      return false;
    }
    return true;
  }

  public doAlliedPiecesExist(color: Colors): boolean {
    const allies: Piece[] = [];

    for (let i = 0; i < this.squares.length; i++) {
      const row = this.squares[i];
      for (let j = 0; j < row.length; j++) {
        const target = row[j];
        if (target.piece?.color === color && target.piece.name !== 'King') {
          allies.push(target.piece);
        }
      }
    }

    if (allies.length === 0) {
      return false;
    }
    return true;
  }

  public isInsufficientMaterialForCheckmate(color: Colors) {
    const enemyColor = color === Colors.WHITE ? Colors.BLACK : Colors.WHITE;

    const allies: Piece[] = [];
    let countBishops = 0;
    let countKnights = 0;
    let countOtherPieces = 0;

    for (let i = 0; i < this.squares.length; i++) {
      const row = this.squares[i];
      for (let j = 0; j < row.length; j++) {
        const target = row[j];
        if (target.piece?.color === color && target.piece.name !== 'King') {
          allies.push(target.piece);
        }
      }
    }

    allies.forEach(piece => {
      if (piece instanceof Bishop) {
        countBishops += 1;
      } else if (piece instanceof Knight) {
        countKnights += 1;
      } else if (piece.name !== 'Bishop' && piece.name !== 'Knight') {
        countOtherPieces += 1;
      }
    })

    const enemyAllies: Piece[] = [];
    let countEnemyBishops = 0;
    let countEnemyKnights = 0;
    let countEnemyOtherPieces = 0;

    for (let i = 0; i < this.squares.length; i++) {
      const row = this.squares[i];
      for (let j = 0; j < row.length; j++) {
        const target = row[j];
        if (target.piece?.color === enemyColor && target.piece.name !== 'King') {
          enemyAllies.push(target.piece);
        }
      }
    }

    enemyAllies.forEach(piece => {
      if (piece instanceof Bishop) {
        countEnemyBishops += 1;
      } else if (piece instanceof Knight) {
        countEnemyKnights += 1;
      } else if (piece.name !== 'Bishop' && piece.name !== 'Knight') {
        countEnemyOtherPieces += 1;
      }
    })

    if (allies.length === 0 && enemyAllies.length === 0
      || (countKnights === 1 && countBishops === 0 && countOtherPieces === 0)
      && (countEnemyKnights === 1 && countEnemyBishops === 0 && countEnemyOtherPieces === 0)
      || (countKnights === 0 && countBishops === 1 && countOtherPieces === 0)
      && (countEnemyKnights === 0 && countEnemyBishops === 1 && countEnemyOtherPieces === 0)
      || (countKnights === 0 && countBishops === 1 && countOtherPieces === 0)
      && (countEnemyKnights === 0 && countEnemyBishops === 0 && countEnemyOtherPieces === 0)
      || (countKnights === 1 && countBishops === 0 && countOtherPieces === 0)
      && (countEnemyKnights === 0 && countEnemyBishops === 0 && countEnemyOtherPieces === 0)) {
      return true;
    }
    return false;
  }

  public isStalemate(color: Colors) {
    const enemyColor = color === Colors.WHITE ? Colors.BLACK : Colors.WHITE;
    if (!this.canKingMove(color) && !this.canAlliesMakeMoves(color) && !this.isKingInCheck(color)
      || this.isInsufficientMaterialForCheckmate(enemyColor)) {
      const kingOne = this.findKing(color);
      const kingTwo = this.findKing(enemyColor);
      if (kingOne && kingTwo) {
        kingOne.isStalemate = true;
        kingTwo.isStalemate = true;
      }
      return;
    }
    return;
  }

  public handleDraw(color: Colors) {
    const enemyColor = color === Colors.WHITE ? Colors.BLACK : Colors.WHITE;
    const kingOne = this.findKing(color);
    const kingTwo = this.findKing(enemyColor);
    if (kingOne && kingTwo) {
      kingOne.isDraw = true;
      kingTwo.isDraw = true;
    }
    return;
  }

  public handleResign(color: Colors) {
    const enemyColor = color === Colors.WHITE ? Colors.BLACK : Colors.WHITE;
    const kingResign = this.findKing(color);
    const kingVictory = this.findKing(enemyColor);
    if (kingResign && kingVictory) {
      kingResign.resign = true;
      kingVictory.isVictory = true;
    }
    return;
  }

  public losingByTime(color: Colors) {
    const loserColor = color;
    const victoryColor = color === Colors.WHITE ? Colors.BLACK : Colors.WHITE;
    const kingSquare = this.findKing(loserColor);
    const victoryKing = this.findKing(victoryColor);
    if (kingSquare && victoryKing) {
      kingSquare.losingByTime = true;
      victoryKing.isVictory = true;
      return;
    }
    return;
  }

  public isKingInCheck(color: Colors): boolean {
    const kingSquare = this.findKing(color);
    if (!kingSquare) {
      return false;
    }
    return this.isUnderAttack(kingSquare, color);
  }

  public isUnderAttack(square: Square, color: Colors): boolean {
    for (let row of this.squares) {
      for (let currentSquare of row) {
        const piece = currentSquare.piece;
        if (piece && piece.color !== color && piece.canAttack(square)) {
          return true;
        }
      }
    }
    return false;
  }

  public findKing(color: Colors): Square | null {
    for (let row of this.squares) {
      for (let square of row) {
        if (square.piece instanceof King && square.piece.color === color) {
          return square;
        }
      }
    }
    return null;
  }

  public highlightKing(color: Colors) {
    const kingSquare = this.findKing(color);
    if (kingSquare) {
      kingSquare.isKingInCheck = true;
    }
  }

  public attackerSquareOnKing(square: Square, color: Colors): boolean {
    const kingSquare = this.findKing(color);
    if (!kingSquare || !this.isKingInCheck(color)) {
      return false; // If there is no check, blocking is not required
    }
    // Determine the piece that attacks the king
    const attackerSquares: Square[] = [];
    for (let row of this.squares) {
      for (let currentSquare of row) {
        const piece = currentSquare.piece;
        if (piece && piece.color !== color && piece.canAttack(kingSquare)) {
          attackerSquares.push(currentSquare);
        }
      }
    }
    // If check is declared by more than one piece, blocking is not possible
    if (attackerSquares.length !== 1) {
      return false;
    }
    const attackerSquare = attackerSquares[0];
    if (square === attackerSquare) {
      return true;
    }
    return false;
  }

  public canBlockCheck(square: Square, color: Colors): boolean {
    // Find the king's square
    const kingSquare = this.findKing(color);
    if (!kingSquare || !this.isKingInCheck(color)) {
      return false; // If there is no check, blocking is not required
    }

    // Determine the piece that attacks the king
    const attackerSquares: Square[] = [];
    for (let row of this.squares) {
      for (let currentSquare of row) {
        const piece = currentSquare.piece;
        if (piece && piece.color !== color && piece.canAttack(kingSquare)) {
          attackerSquares.push(currentSquare);
        }
      }
    }

    // If check is declared by more than one piece, blocking is not possible
    if (attackerSquares.length !== 1) {
      return false;
    }

    const attackerSquare = attackerSquares[0];
    const attackingPiece = attackerSquare.piece!;

    // If it's check from the knight, the only way to block it is to take the knight
    if (attackingPiece instanceof Knight) {
      return square === attackerSquare;
    }

    // Determine the squares in the path between the king and the attacking piece
    const blockingSquares: Square[] = [];
    let x = attackerSquare.x;
    let y = attackerSquare.y;

    const xStep = Math.sign(kingSquare.x - x);
    const yStep = Math.sign(kingSquare.y - y);

    while (x !== kingSquare.x || y !== kingSquare.y) {
      x += xStep;
      y += yStep;
      const pathSquare = this.getSquare(x, y);
      blockingSquares.push(pathSquare);
    }

    // Check if the current square coincides with one of the squares on the path
    return blockingSquares.includes(square);
  }

  public canMoveWithoutCheck(fromSquare: Square, toSquare: Square, color: Colors): boolean {
    const originalPiece = fromSquare.piece; // Save the piece, which was on the square
    const originalEnemyPiece = toSquare.piece;

    if (toSquare.piece && toSquare.piece.color !== color) {
      // Moving our piece
      fromSquare.piece = null;
      toSquare.piece = originalPiece;

      // Checking, is King safe?
      const isKingSafe = !this.isKingInCheck(color);

      // And put everything back in place
      toSquare.piece = originalEnemyPiece;
      fromSquare.piece = originalPiece;

      return isKingSafe;
    } else {
      // Moving our piece
      fromSquare.piece = null;
      toSquare.piece = originalPiece;

      // Checking, is King safe?
      const isKingSafe = !this.isKingInCheck(color);

      // And put everything back in place
      toSquare.piece = null;
      fromSquare.piece = originalPiece;

      return isKingSafe;
    }
  }

  public findRook(color: Colors, x: number, y: number): Rook | null {
    for (let row of this.squares) {
      for (let square of row) {
        const rook = square.piece;
        if (square.x === x && square.y === y && rook instanceof Rook && rook.color === color) {
          return rook;
        }
      }
    }
    return null;
  }

  public findSquareForRookCastle(x: number, y: number): Square | null {
    for (let row of this.squares) {
      for (let square of row) {
        if (square.x === x && square.y === y) {
          return square;
        }
      }
    }
    return null;
  }

  public findSquareForKingCastle(x: number, y: number): Square | null {
    for (let row of this.squares) {
      for (let square of row) {
        if (square.x === x && square.y === y) {
          return square;
        }
      }
    }
    return null;
  }

  public createNewPiece(type: string, color: Colors, square: Square) {
    switch (type) {
      case 'Queen':
        return new Queen(color, square);
      case 'Knight':
        return new Knight(color, square);
      case 'Rook':
        return new Rook(color, square);
      case 'Bishop':
        return new Bishop(color, square);
      default:
        return null;
    }
  }

  public handleMove(moveType: string) {
    switch (moveType) {
      case 'move':
        this.playSound(moveSound);
        break;
      case 'check':
        this.playSound(checkSound);
        break;
      case 'capture':
        this.playSound(captureSound);
        break;
      case 'castle':
        this.playSound(castleSound);
        break;
      default:
        break;
    }
  }

  public promotionPieceValues(color: Colors) {
    const arr = [];
    for (let row of this.squares) {
      for (let square of row) {
        if (square.piece && square.piece.isItPromotionPiece) {
          arr.push(square.piece.value);
        }
      }
    }
    if (color === Colors.WHITE) {
      this.whitePromotionPieceValues = arr;
    } else {
      this.blackPromotionPieceValues = arr;
    }
  }

  private playSound(src: string) {
    const audio = new Audio(src);
    audio.play();
  }

  private addKings() {
    new King(Colors.BLACK, this.getSquare(4, 0));
    new King(Colors.WHITE, this.getSquare(4, 7));
  }

  private addQueens() {
    new Queen(Colors.BLACK, this.getSquare(3, 0));
    new Queen(Colors.WHITE, this.getSquare(3, 7));
  }

  private addRooks() {
    new Rook(Colors.BLACK, this.getSquare(0, 0));
    new Rook(Colors.BLACK, this.getSquare(7, 0));
    new Rook(Colors.WHITE, this.getSquare(0, 7));
    new Rook(Colors.WHITE, this.getSquare(7, 7));
  }

  private addBishops() {
    new Bishop(Colors.BLACK, this.getSquare(2, 0));
    new Bishop(Colors.BLACK, this.getSquare(5, 0));
    new Bishop(Colors.WHITE, this.getSquare(2, 7));
    new Bishop(Colors.WHITE, this.getSquare(5, 7));
  }

  private addKnights() {
    new Knight(Colors.BLACK, this.getSquare(1, 0));
    new Knight(Colors.BLACK, this.getSquare(6, 0));
    new Knight(Colors.WHITE, this.getSquare(1, 7));
    new Knight(Colors.WHITE, this.getSquare(6, 7));
  }

  private addPawns() {
    for (let i = 0; i < 8; i++) {
      new Pawn(Colors.BLACK, this.getSquare(i, 1));
      new Pawn(Colors.WHITE, this.getSquare(i, 6));
    }
  }

  public addPieces() {
    this.addKings();
    this.addQueens();
    this.addRooks();
    this.addBishops();
    this.addKnights();
    this.addPawns();
  }
}