import { FC } from 'react';
import { Colors } from '../modules/Colors';
import { Cell } from '../modules/Cell';
import blackQueen from '../assets/black_queen.png';
import whiteQueen from '../assets/white_queen.png';
import blackKnight from '../assets/black_knight.png';
import whiteKnight from '../assets/white_knight.png';
import blackRook from '../assets/black_rook.png';
import whiteRook from '../assets/white_rook.png';
import blackBishop from '../assets/black_bishop.png';
import whiteBishop from '../assets/white_bishop.png';

interface PromotionModalProps {
  onSelect: (figure: string) => void;
  x: number;
  color: Colors | undefined;
  cell: Cell;
}

const PromotionModal: FC<PromotionModalProps> = ({ onSelect, x, color, cell }) => {

  const figures = ['Queen', 'Knight', 'Rook', 'Bishop'];
  const cellSize = 64;

  return (
    <div className='modal'
      style={{
        left: `${x * cellSize}px`,
        top: color === 'black' ? `${4 * cellSize}px` : 0,
        flexDirection: color === 'black' ? 'column-reverse' : 'column',
      }}>
      {figures.map((figure, i) => (
        <button className='cell' key={i} onClick={() => onSelect(figure)}>
          {cell.figure?.logo && figure === 'Queen'
            && <img src={color === Colors.BLACK ? blackQueen : whiteQueen} alt="" />}
          {cell.figure?.logo && figure === 'Knight'
            && <img src={color === Colors.BLACK ? blackKnight : whiteKnight} alt="" />}
          {cell.figure?.logo && figure === 'Rook'
            && <img src={color === Colors.BLACK ? blackRook : whiteRook} alt="" />}
          {cell.figure?.logo && figure === 'Bishop'
            && <img src={color === Colors.BLACK ? blackBishop : whiteBishop} alt="" />}
        </button>
      ))}
    </div>
  );
};

export default PromotionModal;