import { Square } from "./Square";
import { Colors } from "../Colors";
import { Bishop } from "../pieces/Bishop";
import { Figure } from "../pieces/Piece";
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
  lostBlackFigures: Figure[] = [];
  lostWhiteFigures: Figure[] = [];
  whitePromotionFigureValues: number[] = [];
  blackPromotionFigureValues: number[] = [];
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
    newBoard.lostBlackFigures = this.lostBlackFigures;
    newBoard.lostWhiteFigures = this.lostWhiteFigures;
    newBoard.whitePromotionFigureValues = this.whitePromotionFigureValues;
    newBoard.blackPromotionFigureValues = this.blackPromotionFigureValues;
    return newBoard;
  }

  public getDeepCopyBoard(): Board {
    const newBoard = new Board();
    newBoard.squares = this.squares.map(row => row.map(square => square.getCopy()));
    newBoard.squares.forEach(row => row.forEach(square => {
      square.board = newBoard;
      if (square.figure) {
        square.figure = square.figure.getCopy();
        square.figure.square = square;
      }
    }));
    newBoard.lostBlackFigures = [...this.lostBlackFigures];
    newBoard.lostWhiteFigures = [...this.lostWhiteFigures];
    newBoard.whitePromotionFigureValues = [...this.whitePromotionFigureValues];
    newBoard.blackPromotionFigureValues = [...this.blackPromotionFigureValues];

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
        target.available = !!selectedSquare?.figure?.canMove(target);
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
          if (kingSquare.figure?.canMove(target)) {
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
    const allies: Figure[] = [];

    for (let i = 0; i < this.squares.length; i++) {
      const row = this.squares[i];
      for (let j = 0; j < row.length; j++) {
        const target = row[j];
        if (target.figure?.color === color && target.figure.name !== 'King') {
          allies.push(target.figure);
        }
      }
    }

    allies.forEach(figure => {
      this.squares.forEach(row => {
        row.forEach(target => {
          if (figure.canMove(target)) {
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
          if (kingSquare.figure?.canMove(target)) {
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
    const allies: Figure[] = [];

    for (let i = 0; i < this.squares.length; i++) {
      const row = this.squares[i];
      for (let j = 0; j < row.length; j++) {
        const target = row[j];
        if (target.figure?.color === color && target.figure.name !== 'King') {
          allies.push(target.figure);
        }
      }
    }

    allies.forEach(figure => {
      this.squares.forEach(row => {
        row.forEach(target => {
          if (figure.canMove(target)) {
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

  public doAlliedFiguresExist(color: Colors): boolean {
    const allies: Figure[] = [];

    for (let i = 0; i < this.squares.length; i++) {
      const row = this.squares[i];
      for (let j = 0; j < row.length; j++) {
        const target = row[j];
        if (target.figure?.color === color && target.figure.name !== 'King') {
          allies.push(target.figure);
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

    const allies: Figure[] = [];
    let countBishops = 0;
    let countKnights = 0;
    let countOtherFigures = 0;

    for (let i = 0; i < this.squares.length; i++) {
      const row = this.squares[i];
      for (let j = 0; j < row.length; j++) {
        const target = row[j];
        if (target.figure?.color === color && target.figure.name !== 'King') {
          allies.push(target.figure);
        }
      }
    }

    allies.forEach(figure => {
      if (figure instanceof Bishop) {
        countBishops += 1;
      } else if (figure instanceof Knight) {
        countKnights += 1;
      } else if (figure.name !== 'Bishop' && figure.name !== 'Knight') {
        countOtherFigures += 1;
      }
    })

    const enemyAllies: Figure[] = [];
    let countEnemyBishops = 0;
    let countEnemyKnights = 0;
    let countEnemyOtherFigures = 0;

    for (let i = 0; i < this.squares.length; i++) {
      const row = this.squares[i];
      for (let j = 0; j < row.length; j++) {
        const target = row[j];
        if (target.figure?.color === enemyColor && target.figure.name !== 'King') {
          enemyAllies.push(target.figure);
        }
      }
    }

    enemyAllies.forEach(figure => {
      if (figure instanceof Bishop) {
        countEnemyBishops += 1;
      } else if (figure instanceof Knight) {
        countEnemyKnights += 1;
      } else if (figure.name !== 'Bishop' && figure.name !== 'Knight') {
        countEnemyOtherFigures += 1;
      }
    })

    if (allies.length === 0 && enemyAllies.length === 0
      || (countKnights === 1 && countBishops === 0 && countOtherFigures === 0)
      && (countEnemyKnights === 1 && countEnemyBishops === 0 && countEnemyOtherFigures === 0)
      || (countKnights === 0 && countBishops === 1 && countOtherFigures === 0)
      && (countEnemyKnights === 0 && countEnemyBishops === 1 && countEnemyOtherFigures === 0)
      || (countKnights === 0 && countBishops === 1 && countOtherFigures === 0)
      && (countEnemyKnights === 0 && countEnemyBishops === 0 && countEnemyOtherFigures === 0)
      || (countKnights === 1 && countBishops === 0 && countOtherFigures === 0)
      && (countEnemyKnights === 0 && countEnemyBishops === 0 && countEnemyOtherFigures === 0)) {
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
        const figure = currentSquare.figure;
        if (figure && figure.color !== color && figure.canAttack(square)) {
          return true;
        }
      }
    }
    return false;
  }

  public findKing(color: Colors): Square | null {
    for (let row of this.squares) {
      for (let square of row) {
        if (square.figure instanceof King && square.figure.color === color) {
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
        const figure = currentSquare.figure;
        if (figure && figure.color !== color && figure.canAttack(kingSquare)) {
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
        const figure = currentSquare.figure;
        if (figure && figure.color !== color && figure.canAttack(kingSquare)) {
          attackerSquares.push(currentSquare);
        }
      }
    }

    // If check is declared by more than one piece, blocking is not possible
    if (attackerSquares.length !== 1) {
      return false;
    }

    const attackerSquare = attackerSquares[0];
    const attackingFigure = attackerSquare.figure!;

    // If it's check from the knight, the only way to block it is to take the knight
    if (attackingFigure instanceof Knight) {
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
    const originalFigure = fromSquare.figure; // Save the figure, which was on the square
    const originalEnemyFigure = toSquare.figure;

    if (toSquare.figure && toSquare.figure.color !== color) {
      // Moving our figure
      fromSquare.figure = null;
      toSquare.figure = originalFigure;

      // Checking, is King safe?
      const isKingSafe = !this.isKingInCheck(color);

      // And put everything back in place
      toSquare.figure = originalEnemyFigure;
      fromSquare.figure = originalFigure;

      return isKingSafe;
    } else {
      // Moving our figure
      fromSquare.figure = null;
      toSquare.figure = originalFigure;

      // Checking, is King safe?
      const isKingSafe = !this.isKingInCheck(color);

      // And put everything back in place
      toSquare.figure = null;
      fromSquare.figure = originalFigure;

      return isKingSafe;
    }
  }

  public findRook(color: Colors, x: number, y: number): Rook | null {
    for (let row of this.squares) {
      for (let square of row) {
        const rook = square.figure;
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

  public createNewFigure(type: string, color: Colors, square: Square) {
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

  public promotionFigureValues(color: Colors) {
    const arr = [];
    for (let row of this.squares) {
      for (let square of row) {
        if (square.figure && square.figure.isItPromotionFigure) {
          arr.push(square.figure.value);
        }
      }
    }
    if (color === Colors.WHITE) {
      this.whitePromotionFigureValues = arr;
    } else {
      this.blackPromotionFigureValues = arr;
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

  public addFigures() {
    this.addKings();
    this.addQueens();
    this.addRooks();
    this.addBishops();
    this.addKnights();
    this.addPawns();
  }
}