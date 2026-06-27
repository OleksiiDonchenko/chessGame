import { Colors } from '../../modules/Colors';
import { ButtonDrawProps } from './types';

const ButtonDrawComponent = ({ handleDraw, snapshotBoard, gameIsOn, currentPlayer, board }: ButtonDrawProps) => {

  function draw(color: Colors) {
    handleDraw(color);
    snapshotBoard(board);
  }

  function callbackDraw() {
    if (!currentPlayer) return;
    return draw(currentPlayer.color);
  }

  return (
    <button onClick={callbackDraw}
      disabled={!gameIsOn || !currentPlayer}
      className='btn draw-btn'
      title='Draw' />
  );
};

export default ButtonDrawComponent;