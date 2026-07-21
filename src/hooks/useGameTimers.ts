import { useCallback, useEffect, useMemo, useState } from "react";
import { Player } from "../modules/Player";
import { Square } from "../modules/board/Square";
import { Colors } from "../modules/Colors";
import { Board } from "../modules/board/Board";

const INITIAL_TIME_SECONDS = 5 * 60;

interface UseGameTimersParams {
  board: Board;
  snapshotBoard: (b: Board) => void;
  setGameIsOn: (b: boolean) => void;
  gameIsOn: boolean;
  isAnalysis: boolean;
  currentPlayer: Player | null;
  setCurrentPlayer: (p: Player | null) => void;
  setSelectedSquare: (s: Square | null) => void;
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return {
    minutes,
    seconds,
    formatted: `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`,
  }
}

export function useGameTimers({ board, snapshotBoard, gameIsOn, setGameIsOn, isAnalysis, currentPlayer, setCurrentPlayer, setSelectedSquare }: UseGameTimersParams) {

  const [blackTime, setBlackTime] = useState(INITIAL_TIME_SECONDS);
  const [whiteTime, setWhiteTime] = useState(INITIAL_TIME_SECONDS);

  const blackFormattedTime = useMemo(() => {
    return formatTime(blackTime);
  }, [blackTime]);

  const whiteFormattedTime = useMemo(() => {
    return formatTime(whiteTime);
  }, [whiteTime]);

  const resetTimers = useCallback(() => {
    setBlackTime(INITIAL_TIME_SECONDS);
    setWhiteTime(INITIAL_TIME_SECONDS);
  }, []);

  const handleTimeExpired = useCallback((color: Colors) => {
    const enemyColor = color === Colors.WHITE ? Colors.BLACK : Colors.WHITE;

    if (!board.doAlliedPiecesExist(enemyColor)) {
      board.handleDraw(enemyColor);
    } else {
      board.losingByTime(color);
    }

    setGameIsOn(false);
    setCurrentPlayer(null);
    setSelectedSquare(null);
    snapshotBoard(board);
  }, [
    board,
    setGameIsOn,
    setCurrentPlayer,
    setSelectedSquare,
    snapshotBoard,
  ]);

  useEffect(() => {
    if (!gameIsOn || isAnalysis || !currentPlayer) {
      return;
    }

    const timerId = setInterval(() => {
      if (currentPlayer.color === Colors.BLACK) {
        setBlackTime((prevTime: number) => {
          if (prevTime <= 1) {
            handleTimeExpired(Colors.BLACK);
            return 0;
          }

          return prevTime - 1;
        });
      }

      if (currentPlayer.color === Colors.WHITE) {
        setWhiteTime((prevTime: number) => {
          if (prevTime <= 1) {
            handleTimeExpired(Colors.WHITE);
            return 0;
          }

          return prevTime - 1;
        });
      }

    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [gameIsOn, isAnalysis, currentPlayer]);

  return {
    blackTime,
    whiteTime,
    blackTimeMinutes: blackFormattedTime.minutes,
    blackTimeSeconds: blackFormattedTime.seconds,
    blackFormattedTime: blackFormattedTime.formatted,
    whiteTimeMinutes: whiteFormattedTime.minutes,
    whiteTimeSeconds: whiteFormattedTime.seconds,
    whiteFormattedTime: whiteFormattedTime.formatted,
    resetTimers,
  };
}