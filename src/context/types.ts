import { RefObject } from "react";
import { Square } from "../modules/board/Square";
import { Player } from "../modules/Player";
import { Board } from "../modules/board/Board";
import { Colors } from "../modules/Colors";
import { DragCancelEvent, DragEndEvent, DragStartEvent } from "@dnd-kit/core";

export interface ChessContextType {
  gameIsOn: boolean;
  setGameIsOn: (b: boolean) => void;
  gameWasStarted: boolean;
  setGameWasStarted: (b: boolean) => void;
  isAnalysis: boolean;
  setIsAnalysis: (b: boolean) => void;

  whitePoints: number;
  setWhitePoints: (n: number) => void;
  blackPoints: number;
  setBlackPoints: (n: number) => void;
  whoLeads: number;
  setWholeads: (n: number) => void;

  boardRef: RefObject<HTMLDivElement>;
  clickOnBoard: boolean;
  setClickOnBoard: (b: boolean) => void;
  promotionSquare: Square | null;
  selectedSquare: Square | null;
  setSelectedSquare: (s: Square | null) => void;
  whitePlayer: Player;
  blackPlayer: Player;
  currentPlayer: Player | null;
  setCurrentPlayer: (p: Player | null) => void;

  board: Board;
  history: Board[];
  currentMove: number;
  goToPreviousMove: () => void;
  goToNextMove: () => void;
  snapshotBoard: (newBoard: Board) => void;

  mouseDown: (s: Square) => void;
  handlePromotion: (piece: string) => void;
  swapPlayer: () => void;
  restart: () => void;
  clickOnTheBoard: () => void;

  blackFormattedTime: string;
  whiteFormattedTime: string;
  resetTimers: () => void;

  handleRestart: () => void;
  handleStartGame: () => void;
  handleAnalysis: () => void;
  handleStopGame: (c?: Colors) => void;
  handleDraw: (c: Colors) => void;

  handleDragStart: (e: DragStartEvent) => void;
  handleDragEnd: (e: DragEndEvent) => void;
  handleDragCancel: (e: DragCancelEvent) => void;

  nextMove: () => void;
  previousMove: () => void;
}