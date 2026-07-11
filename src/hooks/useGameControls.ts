import { Colors } from "../modules/Colors";
import { useChessContext } from "../context/ChessContext";
import { Player } from "../modules/Player.ts";
import { Square } from "../modules/board/Square.ts";

interface UseGameControlsParams {
  setCurrentPlayer: (p: Player | null) => void;
  setSelectedSquare: (s: Square | null) => void;
  restart: () => void;
  resetTimers: () => void;
  whitePlayer: Player;
}

export function useGameControls({ setCurrentPlayer, setSelectedSquare, restart, resetTimers, whitePlayer }: UseGameControlsParams) {
  const { board, setGameIsOn, setGameWasStarted, setIsAnalysis } = useChessContext();

  function handleRestart() {
    setGameIsOn(false);
    setGameWasStarted(false);
    setCurrentPlayer(null);
    setSelectedSquare(null);
    resetTimers();
    restart();
  }

  function handleStartGame() {
    setIsAnalysis(false);
    setGameIsOn(true);
    setGameWasStarted(true);
    setCurrentPlayer(whitePlayer);
  }

  function handleAnalysis() {
    setIsAnalysis(true);
    setGameIsOn(false);
    setGameWasStarted(true);
    setCurrentPlayer(whitePlayer);
  }

  function handleStopGame(color?: Colors) {
    if (color)
      board.handleResign(color);
    setGameIsOn(false);
    setCurrentPlayer(null);
    setSelectedSquare(null);
  }

  function handleDraw(color: Colors) {
    board.handleDraw(color);
    handleStopGame();
  }

  return {
    handleRestart, handleStartGame, handleAnalysis, handleStopGame, handleDraw
  }
}