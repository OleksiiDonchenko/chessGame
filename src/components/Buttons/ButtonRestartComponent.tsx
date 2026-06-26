import { ButtonRestartProps } from './types';

const ButtonRestartComponent = ({ handleRestart, gameIsOn, gameWasStarted }: ButtonRestartProps) => {
  return (
    <button onClick={handleRestart}
      disabled={!gameIsOn && gameWasStarted ? false : true}
      className='btn restart-game-btn'
      title='Restart game' />
  );
};

export default ButtonRestartComponent;