import { FC } from 'react';

interface ButtonsProps {
  handleRestart: () => void;
  handleStartGame: () => void;
  handleStopGame: () => void;
}

const Buttons: FC<ButtonsProps> = ({ handleRestart, handleStartGame, handleStopGame }) => {
  return (
    <div className="buttons">
      <div>
        <button onClick={handleRestart}>Restart game</button>
      </div>
      <div>
        <button onClick={handleStartGame}>Start game</button>
      </div>
      <div>
        <button>Draw</button>
      </div>
      <div>
        <button onClick={handleStopGame}>Surrender</button>
      </div>
    </div>
  );
};

export default Buttons;