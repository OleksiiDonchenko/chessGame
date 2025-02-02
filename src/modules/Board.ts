import { Cell } from "./Cell";
import { Colors } from "./Colors";
import { Bishop } from "./figures/Bishop";
import { Figure } from "./figures/Figure";
import { King } from "./figures/King";
import { Knight } from "./figures/Knight";
import { Pawn } from "./figures/Pawn";
import { Queen } from "./figures/Queen";
import { Rook } from "./figures/Rook";
import moveSound from "../assets/sounds/move.mp3";
import checkSound from "../assets/sounds/check.mp3";
import captureSound from "../assets/sounds/capture.mp3";
import castleSound from "../assets/sounds/castle.mp3";

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

  public getCellById(id: string): Cell | null {
    const [x, y] = id.split('-').map(Number);
    if (!isNaN(x) && !isNaN(y)) {
      return this.cells[y]?.[x] || null;
    }
    return null;
  }

  public canKingEscape(color: Colors): boolean {
    const kingCell = this.findKing(color);
    const cellsForEscape: Cell[] = [];

    if (kingCell && kingCell.isKingInCheck) {
      for (let i = 0; i < this.cells.length; i++) {
        const row = this.cells[i];
        for (let j = 0; j < row.length; j++) {
          const target = row[j];
          if (kingCell.figure?.canMove(target)) {
            cellsForEscape.push(target);
          }
        }
      }
    }

    if (cellsForEscape.length === 0) {
      return false;
    }
    return true;
  }

  public canBlockOrCapture(color: Colors): boolean {
    const cellsForBlockOrCapture: Cell[] = [];
    const allies: Figure[] = [];

    for (let i = 0; i < this.cells.length; i++) {
      const row = this.cells[i];
      for (let j = 0; j < row.length; j++) {
        const target = row[j];
        if (target.figure?.color === color && target.figure.name !== 'King') {
          allies.push(target.figure);
        }
      }
    }

    allies.forEach(figure => {
      this.cells.forEach(row => {
        row.forEach(target => {
          if (figure.canMove(target)) {
            cellsForBlockOrCapture.push(target);
          }
        })
      })
    })

    if (cellsForBlockOrCapture.length === 0) {
      return false;
    }
    return true;
  }

  public isCheckmate(color: Colors) {
    const victoryColor = color === Colors.WHITE ? Colors.BLACK : Colors.WHITE;
    if (!this.canKingEscape(color) && !this.canBlockOrCapture(color)) {
      const kingCell = this.findKing(color);
      const victoryKing = this.findKing(victoryColor);
      if (kingCell && victoryKing) {
        kingCell.isCheckmate = true;
        victoryKing.isVictory = true;
        return;
      }
    }
    return;
  }

  public canKingMove(color: Colors): boolean {
    const kingCell = this.findKing(color);
    const cellsForMove: Cell[] = [];

    if (kingCell) {
      for (let i = 0; i < this.cells.length; i++) {
        const row = this.cells[i];
        for (let j = 0; j < row.length; j++) {
          const target = row[j];
          if (kingCell.figure?.canMove(target)) {
            cellsForMove.push(target);
          }
        }
      }
    }

    if (cellsForMove.length === 0) {
      return false;
    }
    return true;
  }

  public canAlliesMakeMoves(color: Colors): boolean {
    const cellsForMoves: Cell[] = [];
    const allies: Figure[] = [];

    for (let i = 0; i < this.cells.length; i++) {
      const row = this.cells[i];
      for (let j = 0; j < row.length; j++) {
        const target = row[j];
        if (target.figure?.color === color && target.figure.name !== 'King') {
          allies.push(target.figure);
        }
      }
    }

    allies.forEach(figure => {
      this.cells.forEach(row => {
        row.forEach(target => {
          if (figure.canMove(target)) {
            cellsForMoves.push(target);
          }
        })
      })
    })

    if (cellsForMoves.length === 0) {
      return false;
    }
    return true;
  }

  public doAlliedFiguresExist(color: Colors): boolean {
    const allies: Figure[] = [];

    for (let i = 0; i < this.cells.length; i++) {
      const row = this.cells[i];
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

    for (let i = 0; i < this.cells.length; i++) {
      const row = this.cells[i];
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

    for (let i = 0; i < this.cells.length; i++) {
      const row = this.cells[i];
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
      // || (countKnights === 2 && countBishops === 0 && countOtherFigures === 0)
      // && (enemyAllies.length === 0)
      || (countKnights === 1 && countBishops === 0 && countOtherFigures === 0)
      && (countEnemyKnights === 0 && countEnemyBishops === 1 && countEnemyOtherFigures === 0)
      || (countKnights === 0 && countBishops === 1 && countOtherFigures === 0)
      && (countEnemyKnights === 1 && countEnemyBishops === 0 && countEnemyOtherFigures === 0)
      || (countKnights === 1 && countBishops === 0 && countOtherFigures === 0)
      && (countEnemyKnights === 1 && countEnemyBishops === 0 && countEnemyOtherFigures === 0)
      || (countKnights === 0 && countBishops === 1 && countOtherFigures === 0)
      && (countEnemyKnights === 0 && countEnemyBishops === 1 && countEnemyOtherFigures === 0)) {
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
    const kingCell = this.findKing(loserColor);
    const victoryKing = this.findKing(victoryColor);
    if (kingCell && victoryKing) {
      kingCell.losingByTime = true;
      victoryKing.isVictory = true;
      return;
    }
    return;
  }

  public isKingInCheck(color: Colors): boolean {
    const kingCell = this.findKing(color);
    if (!kingCell) {
      return false;
    }
    return this.isUnderAttack(kingCell, color);
  }

  public isUnderAttack(cell: Cell, color: Colors): boolean {
    for (let row of this.cells) {
      for (let currentCell of row) {
        const figure = currentCell.figure;
        if (figure && figure.color !== color && figure.canAttack(cell)) {
          return true;
        }
      }
    }
    return false;
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

  public createNewFigure(type: string, color: Colors, cell: Cell) {
    switch (type) {
      case 'Queen':
        return new Queen(color, cell);
      case 'Knight':
        return new Knight(color, cell);
      case 'Rook':
        return new Rook(color, cell);
      case 'Bishop':
        return new Bishop(color, cell);
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

  private playSound(src: string) {
    const audio = new Audio(src);
    audio.play();
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