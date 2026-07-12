import { useEffect, useRef, useState } from "react";
import { Square } from "../modules/board/Square";
import { Player } from "../modules/Player";
import { Colors } from "../modules/Colors";
import { Pawn } from "../modules/pieces/Pawn";
import { useChessContext } from "../context/ChessContext";
import { Board } from "../modules/board/Board";

interface UseChessGameParams {
  setWhitePoints: (n: number) => void;
  setBlackPoints: (n: number) => void;
  setWholeads: (n: number) => void;
}

export function useChessGame({ setWhitePoints, setBlackPoints, setWholeads }: UseChessGameParams) {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [clickOnBoard, setClickOnBoard] = useState<boolean>(false);
  const [promotionSquare, setPromotionSquare] = useState<Square | null>(null);
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [whitePlayer] = useState(new Player(Colors.WHITE));
  const [blackPlayer] = useState(new Player(Colors.BLACK));
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  const { board, setBoard, makeMove, setCurrentMove, setHistory } = useChessContext();

  function mouseDown(square: Square) {
    if (selectedSquare && selectedSquare !== square && selectedSquare.piece?.canMove(square)) {
      if (selectedSquare.piece instanceof Pawn && (square.y === 0 || square.y === 7)) {
        setPromotionSquare(square);
        selectedSquare.movePiece(square);
      } else {
        selectedSquare.movePiece(square);
        const newBoard = board.getDeepCopyBoard();
        makeMove(newBoard);
        swapPlayer();
      }
      setSelectedSquare(null);
    } else {
      if (square.piece?.color === currentPlayer?.color) {
        setSelectedSquare(square);
      }
    }
    if (square.piece === null || square.piece.color !== currentPlayer?.color) {
      setSelectedSquare(null);
    }
  }

  function handlePromotion(piece: string) {
    if (promotionSquare && promotionSquare.piece instanceof Pawn) {
      const pawn = promotionSquare.piece;
      promotionSquare.addLostPiece(pawn);
      promotionSquare.piece = board.createNewPiece(piece, promotionSquare.piece.color, promotionSquare);
      let enemyColor = Colors.WHITE;
      if (promotionSquare.piece) {
        enemyColor = promotionSquare.piece.color === Colors.BLACK ? Colors.WHITE : Colors.BLACK;
        promotionSquare.piece.isItPromotionPiece = true;
      }
      if (board.isKingInCheck(enemyColor)) {
        board.handleMove('check');
        board.highlightKing(enemyColor);
        board.isCheckmate(enemyColor);
      } else if (pawn.isItCapture) {
        board.handleMove('capture');
      } else {
        board.handleMove('move');
      }
      board.isStalemate(enemyColor);
      board.promotionPieceValues(pawn.color);
      const newBoard = board.getDeepCopyBoard();
      makeMove(newBoard);
      swapPlayer();
    }
    setPromotionSquare(null);
  }

  function swapPlayer() {
    setCurrentPlayer(currentPlayer?.color === Colors.WHITE ? blackPlayer : whitePlayer);
  }

  function highlightSquares() {
    board.highlightSquares(selectedSquare);
    updateBoard();
  }

  useEffect(() => {
    highlightSquares();
  }, [selectedSquare]);

  function updateBoard() {
    const newBoard = board.getCopyBoard();
    setBoard(newBoard);
    return newBoard;
  }

  function restart() {
    const newBoard = new Board();
    newBoard.initSquares();
    newBoard.addPieces();
    setBoard(newBoard);
    setWhitePoints(0);
    setBlackPoints(0);
    setWholeads(0);
    setHistory([newBoard.getDeepCopyBoard()]);
    setCurrentMove(0);
  }

  useEffect(() => {
    restart();
  }, []);

  function clickOnTheBoard() {
    setClickOnBoard(true);
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (boardRef.current && !boardRef.current.contains(event.target as Node)) {
        setClickOnBoard(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return {
    boardRef,
    clickOnBoard,
    setClickOnBoard,
    promotionSquare,
    setPromotionSquare,
    mouseDown,
    handlePromotion,
    swapPlayer,
    currentPlayer,
    setCurrentPlayer,
    selectedSquare,
    setSelectedSquare,
    restart,
    clickOnTheBoard,
    whitePlayer,
    blackPlayer,
  };
}