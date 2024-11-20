import { FC } from 'react';

interface ButtonsProps {
  handleRestart: () => void;
}

const Buttons: FC<ButtonsProps> = ({ handleRestart }) => {
  return (
    <div className="buttons">
      <div>
        <button onClick={handleRestart}>Restart game</button>
      </div>
      <div>
        <button>Start game</button>
      </div>
      <div>
        <button>Draw</button>
      </div>
      <div>
        <button>Surrender</button>
      </div>
    </div>
  );
};

export default Buttons;