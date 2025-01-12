import { useDraggable } from '@dnd-kit/core';
import { FC } from 'react';

interface DraggableFigureProps {
  id: string;
  src: string;
}

const DraggableFigure: FC<DraggableFigureProps> = ({ id, src }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id, });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
  }

  return (
    <img
      className='figure'
      ref={setNodeRef}
      src={src}
      alt='figure'
      style={{
        ...style,
      }}
      {...listeners}
      {...attributes}
    />
  );
};

export default DraggableFigure;