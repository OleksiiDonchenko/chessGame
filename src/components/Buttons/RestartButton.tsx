import { RestartButtonProps } from './types';

const RestartButton = ({ handleRestart, gameIsOn, gameWasStarted }: RestartButtonProps) => {
  
  return (
    <button onClick={handleRestart}
      disabled={gameIsOn || !gameWasStarted}
      className='btn restart-game-btn'
      title='Restart game' />
  );
};

export default RestartButton;