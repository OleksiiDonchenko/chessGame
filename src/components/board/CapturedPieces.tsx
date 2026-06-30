import { FC, useEffect } from 'react';
import { Piece } from '../../modules/pieces/Piece';
import { useChessContext } from '../../context/ChessContext';

interface CapturedPiecesProps {
  color: string;
  pieces: Piece[];
  whoLeads: number;
  setWholeads: (value: number) => void;
  whitePoints: number;
  setWhitePoints: (value: number) => void;
  blackPoints: number;
  setBlackPoints: (value: number) => void;
}

const CapturedPieces: FC<CapturedPiecesProps> = ({ color, pieces, whoLeads, setWholeads, whitePoints, setWhitePoints, blackPoints, setBlackPoints }) => {

  const { board } = useChessContext();

  let sortedPieces: Piece[] = [];
  if (pieces.length > 0) {
    sortedPieces = pieces.sort((a, b) => {
      if (a.value && b.value) {
        return a.value - b.value;
      }
      return 0;
    });
  }

  const arrWhitePoints: number[] = [];
  const arrBlackPoints: number[] = [];

  const arrPromotionWhitePiecesValue: number[] = board.whitePromotionPieceValues;
  const arrPromotionBlackPiecesValue: number[] = board.blackPromotionPieceValues;

  useEffect(() => {
    if (color === 'white') {
      sortedPieces.forEach(piece => {
        arrWhitePoints.push(piece.value);
      })
      setWhitePoints(Math.floor(arrWhitePoints.reduce((acc, curVal) => acc + curVal, 0) + arrPromotionBlackPiecesValue.reduce((acc, curVal) => acc + curVal, 0)));
      setWholeads(whitePoints - blackPoints);
    } else {
      sortedPieces.forEach(piece => {
        arrBlackPoints.push(piece.value);
      })
      setBlackPoints(Math.floor(arrBlackPoints.reduce((acc, curVal) => acc + curVal, 0) + arrPromotionWhitePiecesValue.reduce((acc, curVal) => acc + curVal, 0)));
      setWholeads(whitePoints - blackPoints);
    }
  }, [sortedPieces, arrWhitePoints, arrBlackPoints, arrPromotionWhitePiecesValue, arrPromotionBlackPiecesValue])

  return (
    <div className='captured'>
      {sortedPieces.map(piece =>
        <div key={piece.id}>
          {piece.logo && <img width={20} height={20} src={piece.logo} />}
        </div>
      )}
      {whoLeads !== 0 ?
        (sortedPieces.length > 0 && sortedPieces[0].color === 'white' && whoLeads > 0 ? `+${whoLeads}` : '')
        || (sortedPieces.length > 0 && sortedPieces[0].color === 'black' && whoLeads < 0 ? `+${Math.abs(whoLeads)}` : '') : ''}
    </div>
  );
};

export default CapturedPieces;