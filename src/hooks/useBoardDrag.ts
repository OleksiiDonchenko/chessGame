import { useCallback } from "react";
import { DragEndEvent, DragStartEvent, DragCancelEvent } from "@dnd-kit/core";
import { useChessContext } from "../context/ChessContext";
import { Square } from "../modules/board/Square";
import { Pawn } from "../modules/pieces/Pawn";
import { Player } from "../modules/Player";

interface UseBoardDragParams {
  setClickOnBoard: (p: boolean) => void;
  currentPlayer: Player | null;
  setPromotionSquare: (p: Square | null) => void;
  swapPlayer: () => void;
  setSelectedSquare: (p: Square | null) => void;
}

function getPieceElement(event: Event): HTMLElement | null {
  const target = event.target;

  if (!(target instanceof HTMLElement)) {
    return null;
  }

  return target;
}

function resetPiecePosition(piece: HTMLElement | null) {
  if (!piece) return;

  piece.style.left = '2px';
  piece.style.top = '2px';
}

export function useBoardDrag({ setClickOnBoard, currentPlayer, setPromotionSquare, swapPlayer, setSelectedSquare }: UseBoardDragParams) {

  const { board, makeMove } = useChessContext();

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const piece = getPieceElement(event.activatorEvent);

    if (!piece || !piece.parentElement) {
      return;
    }

    const square = piece.parentElement;
    if (!(square instanceof HTMLElement)) return;

    const squareRect = square.getBoundingClientRect();

    // Size the piece
    const pieceSize = 60;

    // The cursor position in the square
    const cursorX = event.activatorEvent instanceof MouseEvent
      ? event.activatorEvent.clientX - squareRect.left
      : 0;

    const cursorY = event.activatorEvent instanceof MouseEvent
      ? event.activatorEvent.clientY - squareRect.top
      : 0;

    // Offset for centering the piece under the cursor
    const offsetX = cursorX - pieceSize / 2;
    const offsetY = cursorY - pieceSize / 2;

    piece.style.left = `${offsetX}px`;
    piece.style.top = `${offsetY}px`;

    setClickOnBoard(true);
  }, [setClickOnBoard]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    const piece = getPieceElement(event.activatorEvent);

    try {
      if (!over) return;

      const fromSquare = board.getSquareById(`${active.id}`);
      const toSquare = board.getSquareById(`${over.id}`);

      if (!fromSquare || !toSquare) {
        return;
      }

      const movingPiece = fromSquare.piece;

      if (!movingPiece) {
        return;
      }

      if (currentPlayer?.color !== movingPiece.color) {
        return;
      }

      if (movingPiece.canMove(toSquare)) {
        if (movingPiece instanceof Pawn && (toSquare.y === 0 || toSquare.y === 7)) {
          setPromotionSquare(toSquare);
          fromSquare.movePiece(toSquare);
        } else {
          fromSquare.movePiece(toSquare);

          const newBoard = board.getDeepCopyBoard();

          makeMove(newBoard);
          swapPlayer();
        }

        setSelectedSquare(null);
        return;
      }

      setSelectedSquare(fromSquare);
    } finally {
      resetPiecePosition(piece);
    }
  }, [board, currentPlayer, makeMove, setPromotionSquare, setSelectedSquare, swapPlayer]);

  const handleDragCancel = useCallback((event: DragCancelEvent) => {
    const piece = getPieceElement(event.activatorEvent);

    resetPiecePosition(piece);
  }, []);

  return { handleDragStart, handleDragEnd, handleDragCancel };
}