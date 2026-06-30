import { FC } from 'react';
import { Colors } from '../../modules/Colors';
import { Square } from '../../modules/board/Square';
import blackQueen from '../../assets/black_queen.png';
import whiteQueen from '../../assets/white_queen.png';
import blackKnight from '../../assets/black_knight.png';
import whiteKnight from '../../assets/white_knight.png';
import blackRook from '../../assets/black_rook.png';
import whiteRook from '../../assets/white_rook.png';
import blackBishop from '../../assets/black_bishop.png';
import whiteBishop from '../../assets/white_bishop.png';

interface PromotionModalProps {
  onSelect: (piece: string) => void;
  x: number;
  color: Colors | undefined;
  square: Square;
}

const PromotionModal: FC<PromotionModalProps> = ({ onSelect, x, color, square }) => {

  const pieces = ['Queen', 'Knight', 'Rook', 'Bishop'];
  const squareSize = 64;

  return (
    <div className='modal'
      style={{
        left: `${x * squareSize}px`,
        top: color === 'black' ? `${4 * squareSize}px` : 0,
        flexDirection: color === 'black' ? 'column-reverse' : 'column',
      }}>
      {pieces.map((piece, i) => (
        <button className='square' key={i} onClick={() => onSelect(piece)}>
          {square.piece?.logo && piece === 'Queen'
            && <img src={color === Colors.BLACK ? blackQueen : whiteQueen} alt="" />}
          {square.piece?.logo && piece === 'Knight'
            && <img src={color === Colors.BLACK ? blackKnight : whiteKnight} alt="" />}
          {square.piece?.logo && piece === 'Rook'
            && <img src={color === Colors.BLACK ? blackRook : whiteRook} alt="" />}
          {square.piece?.logo && piece === 'Bishop'
            && <img src={color === Colors.BLACK ? blackBishop : whiteBishop} alt="" />}
        </button>
      ))}
    </div>
  );
};

export default PromotionModal;