import { Board } from "../../modules/Board";
import { Colors } from "../../modules/Colors";
import { Player } from "../../modules/Player";

export interface ButtonsProps {
  handleRestart: () => void;
  handleStartGame: () => void;
  handleAnalysis: () => void;
  handleStopGame: (color?: Colors) => void;
  handleDraw: (color: Colors) => void;
  gameIsOn: boolean;
  gameWasStarted: boolean;
  currentPlayer: Player | null;
  board: Board;
  snapshotBoard: (newBoard: Board) => void;
}

export interface ButtonRestartProps {
  handleRestart: () => void;
  gameIsOn: boolean;
  gameWasStarted: boolean;
}

export interface ButtonStartProps {
  handleStartGame: () => void;
  gameIsOn: boolean;
  gameWasStarted: boolean;
}

export interface ButtonAnalysisProps {
  handleAnalysis: () => void;
  gameIsOn: boolean;
  gameWasStarted: boolean;
}

export interface ButtonDrawProps {
  handleDraw: (color: Colors) => void;
  snapshotBoard: (newBoard: Board) => void;
  gameIsOn: boolean;
  currentPlayer: Player | null;
  board: Board;
}

export interface ButtonResignProps {
  handleStopGame: (color?: Colors) => void;
  snapshotBoard: (newBoard: Board) => void;
  gameIsOn: boolean;
  currentPlayer: Player | null;
  board: Board;
}