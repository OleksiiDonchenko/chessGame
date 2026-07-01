import { useChessContext } from "../context/ChessContext";
import { Square } from "../modules/board/Square";
import { Pawn } from "../modules/pieces/Pawn";
import { Player } from "../modules/Player";

interface UseBoardDrag {
  setClickOnBoard: (p: boolean) => void;
  currentPlayer: Player | null;
  setPromotionSquare: (p: Square | null) => void;
  swapPlayer: () => void;
  setSelectedSquare: (p: Square | null) => void;
}

export function useBoardDrag({ setClickOnBoard, currentPlayer, setPromotionSquare, swapPlayer, setSelectedSquare }: UseBoardDrag) {

  const { board, makeMove } = useChessContext();

  const handleDragStart = (event: any) => {
    const { over } = event;
    const piece = event.activatorEvent.srcElement;
    const square = piece.parentElement;

    const squareRect = square.getBoundingClientRect();

    // Size the piece
    const pieceSize = 60;

    // The cursor position in the square
    const cursorX = event.activatorEvent.clientX - squareRect.left;
    const cursorY = event.activatorEvent.clientY - squareRect.top;

    // Offset for centering the piece under the cursor
    const offsetX = cursorX - pieceSize / 2;
    const offsetY = cursorY - pieceSize / 2;

    piece.style.left = `${offsetX}px`;
    piece.style.top = `${offsetY}px`;

    piece.addEventListener('mouseup', () => {
      piece.style.left = '2px';
      piece.style.top = '2px';
    });

    setClickOnBoard(true);

    if (!over) return;
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over) return;

    const piece = event.activatorEvent.srcElement;
    const fromSquare = board.getSquareById(`${active.id}`);
    const toSquare = board.getSquareById(`${over.id}`);

    if (currentPlayer?.color === fromSquare?.piece?.color) {
      if (fromSquare && toSquare && fromSquare.piece?.canMove(toSquare)) {
        if (fromSquare.piece instanceof Pawn && (toSquare.y === 0 || toSquare.y === 7)) {
          setPromotionSquare(toSquare);
          fromSquare.movePiece(toSquare);
        } else {
          fromSquare.movePiece(toSquare);
          const newBoard = board.getDeepCopyBoard();
          makeMove(newBoard);
          swapPlayer();
        }
        setSelectedSquare(null);
      } else if (fromSquare?.piece?.color === currentPlayer?.color) {
        setSelectedSquare(fromSquare);
      }
    }

    piece.style.left = '2px';
    piece.style.top = '2px';
  };

  return { handleDragStart, handleDragEnd };
}