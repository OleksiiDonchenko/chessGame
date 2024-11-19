import { FC, useEffect, useRef, useState } from 'react';
import { Player } from '../modules/Player';
import { Colors } from '../modules/Colors';

interface TimerProps {
  currentPlayer: Player | null;
  restart: () => void;
  setCurrentPlayer: (player: Player) => void;
  whitePlayer: Player;
}

const Timer: FC<TimerProps> = ({ currentPlayer, restart, setCurrentPlayer, whitePlayer }) => {
  const [blackTime, setBlackTime] = useState(300);
  const [whiteTime, setWhiteTime] = useState(300);
  const timer = useRef<null | ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    startTimer();
  }, [currentPlayer])

  function startTimer() {
    if (timer.current) {
      clearInterval(timer.current);
    }
    const callback = currentPlayer?.color === Colors.BLACK ? decrementBlackTimer : decrementWhiteTimer;
    timer.current = setInterval(callback, 1000);
  }

  function decrementBlackTimer() {
    setBlackTime(prev => prev - 1);
  }

  function decrementWhiteTimer() {
    setWhiteTime(prev => prev - 1);
  }

  function handleRestart() {
    setBlackTime(300);
    setWhiteTime(300);
    setCurrentPlayer(whitePlayer);
    restart();
  }

  return (
    <div>
      <div>
        <button onClick={handleRestart}>Restart game</button>
      </div>
      <h2>Black time - {blackTime}</h2>
      <h2>White time - {whiteTime}</h2>
    </div>
  );
};

export default Timer;