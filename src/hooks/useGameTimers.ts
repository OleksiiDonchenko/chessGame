import { useRef, useState } from "react";
import { Player } from "../modules/Player";
import { Colors } from "../modules/Colors";
import { useChessContext } from "../context/ChessContext";

interface UseGameTimersParams {
  gameIsOn: boolean;
  currentPlayer: Player | null;
  handleDraw: (color: Colors) => void;
  handleStopGame: (color?: Colors) => void;

}

export function useGameTimers({ gameIsOn, currentPlayer, handleDraw, handleStopGame }: UseGameTimersParams) {
  const [blackTimeMinutes, setBlackTimeMinutes] = useState(5);
  const [whiteTimeMinutes, setWhiteTimeMinutes] = useState(5);
  const [blackTimeSeconds, setBlackTimeSeconds] = useState(60);
  const [whiteTimeSeconds, setWhiteTimeSeconds] = useState(60);
  const timer = useRef<null | ReturnType<typeof setInterval>>(null);

  const { board, snapshotBoard } = useChessContext();

  function decrementBlackTimer() {
    if (gameIsOn) {
      if (blackTimeMinutes > 0 && blackTimeSeconds === 0 || blackTimeSeconds === 60) {
        setBlackTimeMinutes(prev => prev - 1);
      }
      if (blackTimeMinutes > 0 && blackTimeSeconds === 0) {
        setBlackTimeSeconds(59);
      }
      if (blackTimeSeconds > 0) {
        setBlackTimeSeconds(prev => prev - 1);
      }
      if (blackTimeMinutes === 0 && blackTimeSeconds === 0 && currentPlayer) {
        !board.doAlliedPiecesExist(Colors.WHITE) ? handleDraw(Colors.WHITE) : board.losingByTime(currentPlayer.color);
        handleStopGame();
        snapshotBoard(board);
      }
    }
  }

  function decrementWhiteTimer() {
    if (gameIsOn) {
      if (whiteTimeMinutes > 0 && whiteTimeSeconds === 0 || whiteTimeSeconds === 60) {
        setWhiteTimeMinutes(prev => prev - 1);
      }
      if (whiteTimeMinutes > 0 && whiteTimeSeconds === 0) {
        setWhiteTimeSeconds(59);
      }
      if (whiteTimeSeconds > 0) {
        setWhiteTimeSeconds(prev => prev - 1);
      }
      if (whiteTimeMinutes === 0 && whiteTimeSeconds === 0 && currentPlayer) {
        !board.doAlliedPiecesExist(Colors.BLACK) ? handleDraw(Colors.BLACK) : board.losingByTime(currentPlayer.color);
        handleStopGame();
        snapshotBoard(board);
      }
    }
  }

  return { blackTimeMinutes, setBlackTimeMinutes, whiteTimeMinutes, setWhiteTimeMinutes, blackTimeSeconds, setBlackTimeSeconds, whiteTimeSeconds, setWhiteTimeSeconds, timer, decrementBlackTimer, decrementWhiteTimer };
}