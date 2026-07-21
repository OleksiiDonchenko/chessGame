import { Board } from "../../modules/board/Board";
import { Colors } from "../../modules/Colors";
import { Player } from "../../modules/Player";

export interface RestartButtonProps {
  handleRestart: () => void;
  gameIsOn: boolean;
  gameWasStarted: boolean;
}

export interface StartButtonProps {
  handleStartGame: () => void;
  gameIsOn: boolean;
  gameWasStarted: boolean;
}

export interface AnalysisButtonProps {
  handleAnalysis: () => void;
  gameIsOn: boolean;
  gameWasStarted: boolean;
}

export interface DrawButtonProps {
  handleDraw: (color: Colors) => void;
  snapshotBoard: (newBoard: Board) => void;
  gameIsOn: boolean;
  currentPlayer: Player | null;
  board: Board;
}

export interface ResignButtonProps {
  handleStopGame: (color?: Colors) => void;
  snapshotBoard: (newBoard: Board) => void;
  gameIsOn: boolean;
  currentPlayer: Player | null;
  board: Board;
}