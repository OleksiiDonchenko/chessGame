import { useDraggable } from '@dnd-kit/core';
import { FC } from 'react';

interface DraggablePieceProps {
  id: string;
  src: string;
}

const DraggablePiece: FC<DraggablePieceProps> = ({ id, src }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id, });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
  }

  return (
    <img
      className='piece'
      ref={setNodeRef}
      src={src}
      alt='piece'
      style={{
        ...style,
      }}
      {...listeners}
      {...attributes}
    />
  );
};

export default DraggablePiece;