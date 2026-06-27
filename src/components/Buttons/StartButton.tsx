import { StartButtonProps } from './types';

const StartButton = ({ handleStartGame, gameIsOn, gameWasStarted }: StartButtonProps) => {
  
  return (
    <button onClick={handleStartGame}
      disabled={gameIsOn || gameWasStarted}
      className='btn play-btn'
      title='Play'
    />
  );
};

export default StartButton;