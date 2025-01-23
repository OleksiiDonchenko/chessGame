import { FC } from 'react';

interface ButtonsProps {
  handleRestart: () => void;
  handleStartGame: () => void;
  handleStopGame: () => void;
  gameIsOn: boolean;
  gameWasStarted: boolean;
}

const Buttons: FC<ButtonsProps> = ({ handleRestart, handleStartGame, handleStopGame, gameIsOn, gameWasStarted }) => {
  return (
    <div className="buttons">
      <div>
        <button onClick={handleRestart}
          disabled={!gameIsOn && gameWasStarted ? false : true}
        >
          Restart game
        </button>
      </div>
      <div>
        <button onClick={handleStartGame}
          disabled={gameIsOn ? true : false || gameWasStarted ? true : false}
        >
          Start game
        </button>
      </div>
      <div>
        <button disabled={!gameIsOn ? true : false}>
          Draw
        </button>
      </div>
      <div>
        <button onClick={handleStopGame}
          disabled={!gameIsOn ? true : false}
        >
          Resign
        </button>
      </div>
    </div>
  );
};

export default Buttons;