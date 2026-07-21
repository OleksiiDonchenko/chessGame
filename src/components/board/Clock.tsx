import { } from 'react';
import ClockSVG from '../../assets/icons/clock.svg?react';
import { useChessContext } from '../../context/ChessContext';

interface ClockProps {
  color: string;
  colorClockSVG: string;
}

const Clock = ({ color, colorClockSVG }: ClockProps) => {

  // useChessContext
  const { isAnalysis, currentPlayer, whitePlayer, blackPlayer, blackFormattedTime, whiteFormattedTime } = useChessContext();

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