import { ButtonStartProps } from './types';

const ButtonStartComponent= ({ handleStartGame, gameIsOn, gameWasStarted }: ButtonStartProps) => {
  return (
    <button onClick={handleStartGame}
      disabled={gameIsOn ? true : false || gameWasStarted ? true : false}
      className='btn play-btn'
      title='Play'
    />
  );
};

export default ButtonStartComponent;