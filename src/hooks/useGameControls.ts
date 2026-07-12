import { Colors } from "../modules/Colors";
import { useChessContext } from "../context/ChessContext";
import { Player } from "../modules/Player.ts";
import { Square } from "../modules/board/Square.ts";
import { useCallback } from "react";

interface UseGameControlsParams {
  setCurrentPlayer: (p: Player | null) => void;
  setSelectedSquare: (s: Square | null) => void;
  restart: () => void;
  resetTimers: () => void;
  whitePlayer: Player;
}

export function useGameControls({ setCurrentPlayer, setSelectedSquare, restart, resetTimers, whitePlayer }: UseGameControlsParams) {
  const { board, setGameIsOn, setGameWasStarted, setIsAnalysis } = useChessContext();

  const handleRestart = useCallback(() => {
    setGameIsOn(false);
    setGameWasStarted(false);
    setIsAnalysis(false);
    setCurrentPlayer(null);
    setSelectedSquare(null);

    resetTimers();
    restart();
  }, [setGameIsOn,
    setGameWasStarted,
    setIsAnalysis,
    setCurrentPlayer,
    setSelectedSquare,
    resetTimers,
    restart]);

  const handleStartGame = useCallback(() => {
    setIsAnalysis(false);
    setGameIsOn(true);
    setGameWasStarted(true);
    setCurrentPlayer(whitePlayer);
  }, [setIsAnalysis,
    setGameIsOn,
    setGameWasStarted,
    setCurrentPlayer,
    whitePlayer]);

  const handleAnalysis = useCallback(() => {
    setIsAnalysis(true);
    setGameIsOn(false);
    setGameWasStarted(true);
    setCurrentPlayer(whitePlayer);
  }, [setIsAnalysis,
    setGameIsOn,
    setGameWasStarted,
    setCurrentPlayer,
    whitePlayer]);

  const handleStopGame = useCallback((color?: Colors) => {
    if (color)
      board.handleResign(color);
    setGameIsOn(false);
    setCurrentPlayer(null);
    setSelectedSquare(null);
  }, [board,
    setGameIsOn,
    setCurrentPlayer,
    setSelectedSquare]);

  const handleDraw = useCallback((color: Colors) => {
    board.handleDraw(color);
    handleStopGame();
  }, [board,
    handleStopGame]);

  return {
    handleRestart, handleStartGame, handleAnalysis, handleStopGame, handleDraw
  }
}