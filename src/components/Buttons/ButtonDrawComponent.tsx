import { Colors } from '../../modules/Colors';
import { ButtonDrawProps } from './types';

const ButtonDrawComponent = ({ handleDraw, snapshotBoard, gameIsOn, currentPlayer, board }: ButtonDrawProps) => {

  function draw(color: Colors) {
    handleDraw(color);
    snapshotBoard(board);
  }

  return (
    <button onClick={currentPlayer ? () => draw(currentPlayer.color) : () => { }}
      disabled={!gameIsOn ? true : false}
      className='btn draw-btn'
      title='Draw' />
  );
};

export default ButtonDrawComponent;