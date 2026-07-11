import { useCallback, useEffect, useMemo, useState } from "react";
import { Player } from "../modules/Player";
import { Colors } from "../modules/Colors";
import { useChessContext } from "../context/ChessContext";

const INITIAL_TIME_SECONDS = 5 * 60;

interface UseGameTimersParams {
  gameIsOn: boolean;
  isAnalysis: boolean;
  currentPlayer: Player | null;
  handleDraw: (color: Colors) => void;
  handleStopGame: (color?: Colors) => void;
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

export function useGameTimers({ gameIsOn, isAnalysis, currentPlayer, handleDraw, handleStopGame }: UseGameTimersParams) {
  const [blackTime, setBlackTime] = useState(INITIAL_TIME_SECONDS);
  const [whiteTime, setWhiteTime] = useState(INITIAL_TIME_SECONDS);

  const { board, snapshotBoard } = useChessContext();

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
    if (color === Colors.BLACK) {
      !board.doAlliedPiecesExist(Colors.WHITE)
        ? handleDraw(Colors.WHITE)
        : board.losingByTime(color);
    }

    if (color === Colors.WHITE) {
      !board.doAlliedPiecesExist(Colors.BLACK)
        ? handleDraw(Colors.BLACK)
        : board.losingByTime(color);
    }

    handleStopGame();
    snapshotBoard(board);
  }, [board, handleDraw, handleStopGame, snapshotBoard]);

  useEffect(() => {
    if (!gameIsOn || isAnalysis || !currentPlayer) {
      return;
    }

    const timerId = setInterval(() => {
      if (currentPlayer.color === Colors.BLACK) {
        setBlackTime((prevTime) => {
          if (prevTime <= 1) {
            handleTimeExpired(Colors.BLACK);
            return 0;
          }

          return prevTime - 1;
        });
      }

      if (currentPlayer.color === Colors.WHITE) {
        setWhiteTime((prevTime) => {
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
  }, [gameIsOn, isAnalysis, currentPlayer, handleTimeExpired]);

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