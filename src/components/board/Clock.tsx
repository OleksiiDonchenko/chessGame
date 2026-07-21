import { } from 'react';
import ClockSVG from '../../assets/icons/clock.svg?react';
import { useChessContext } from '../../context/ChessContext';
import { Player } from '../../modules/Player';

interface ClockProps {
  color: string;
  colorClockSVG: string;
  currentPlayer: Player | null;
  whitePlayer: Player;
  blackPlayer: Player;
  blackFormattedTime: string;
  whiteFormattedTime: string;
}

const Clock = ({ color, colorClockSVG, currentPlayer, whitePlayer, blackPlayer, blackFormattedTime, whiteFormattedTime }: ClockProps) => {

  // useChessContext
  const { isAnalysis } = useChessContext();

  const time = color === 'blackTime' ? blackFormattedTime : whiteFormattedTime;
  const conditionOpacity = currentPlayer === blackPlayer && color === 'blackTime' && !isAnalysis
    ? 'goes'
    : currentPlayer === whitePlayer && color === 'whiteTime' && !isAnalysis
      ? 'goes'
      : '';

  return (
    <div className={['time', color, conditionOpacity].join(' ')}>
      <ClockSVG fill={colorClockSVG} />
      <span>
        {time}
      </span>
    </div>
  );
};

export default Clock;