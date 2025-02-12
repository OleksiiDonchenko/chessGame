import { FC, useEffect } from 'react';
import { Figure } from '../modules/figures/Figure';
import { Board } from '../modules/Board';
import { Colors } from '../modules/Colors';

interface LostFiguresProps {
  board: Board;
  color: string;
  figures: Figure[];
  whoLeads: number;
  setWholeads: (value: number) => void;
  whitePoints: number;
  setWhitePoints: (value: number) => void;
  blackPoints: number;
  setBlackPoints: (value: number) => void;
}

const LostFigures: FC<LostFiguresProps> = ({ board, color, figures, whoLeads, setWholeads, whitePoints, setWhitePoints, blackPoints, setBlackPoints}) => {
  let sortedFigures: Figure[] = [];
  if (figures.length > 0) {
    sortedFigures = figures.sort((a, b) => {
      if (a.value && b.value) {
        return a.value - b.value;
      }
      return 0;
    });
  }

  const arrWhitePoints: number[] = [];
  const arrBlackPoints: number[] = [];

  if (color === Colors.WHITE) {
    const promotionFigureValue = board.isItPromotionFigure(Colors.BLACK);
    arrWhitePoints.push(promotionFigureValue);
  } else if (color === Colors.BLACK) {
    const promotionFigureValue = board.isItPromotionFigure(Colors.WHITE);
    arrBlackPoints.push(promotionFigureValue);
  }

  useEffect(() => {
    if (sortedFigures.length > 0) {
      if (color === 'white') {
        sortedFigures.forEach(figure => {
          arrWhitePoints.push(figure.value);
        })
        setWhitePoints(Math.floor(arrWhitePoints.reduce((acc, curVal) => acc + curVal, 0)));
        setWholeads(whitePoints - blackPoints);
      } else {
        sortedFigures.forEach(figure => {
          arrBlackPoints.push(figure.value);
        })
        setBlackPoints(Math.floor(arrBlackPoints.reduce((acc, curVal) => acc + curVal, 0)));
        setWholeads(whitePoints - blackPoints);
      }
    }
  }, [sortedFigures, arrWhitePoints, arrBlackPoints])

  return (
    <div className='lost'>
      {sortedFigures.map(figure =>
        <div key={figure.id}>
          {figure.logo && <img width={20} height={20} src={figure.logo} />}
        </div>
      )}
      {whoLeads !== 0 ?
        (sortedFigures.length > 0 && sortedFigures[0].color === 'white' && whoLeads > 0 ? `+${whoLeads}` : '')
        || (sortedFigures.length > 0 && sortedFigures[0].color === 'black' && whoLeads < 0 ? `+${Math.abs(whoLeads)}` : '') : ''}
    </div>
  );
};

export default LostFigures;