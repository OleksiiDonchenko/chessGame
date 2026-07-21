import { Board } from "../modules/board/Board";
import { Colors } from "../modules/Colors";
import { useCallback } from "react";
import { Player } from "../modules/Player";
import { Square } from "../modules/board/Square";

interface UseGameControlsParams {
  board: Board;
  setGameIsOn: (b: boolean) => void;
  setGameWasStarted: (b: boolean) => void;
  setIsAnalysis: (b: boolean) => void;
  setCurrentPlayer: (p: Player | null) => void;
  setSelectedSquare: (s: Square | null) => void;
  whitePlayer: Player;
  resetTimers: any;
  restart: () => void;
}

export function useGameControls({ board, setGameIsOn, setGameWasStarted, setIsAnalysis, setCurrentPlayer, setSelectedSquare, whitePlayer, resetTimers, restart }: UseGameControlsParams) {

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