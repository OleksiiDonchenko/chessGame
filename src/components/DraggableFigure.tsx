import { useDraggable } from '@dnd-kit/react';
import { Feedback } from '@dnd-kit/dom';
import { FC } from 'react';

interface DraggableFigureProps {
  id: string;
  src: string;
}

const DraggableFigure: FC<DraggableFigureProps> = ({ id, src }) => {
  const { ref, isDragging } = useDraggable({
    id,
    plugins: [
      Feedback.configure({
        dropAnimation: null,
      })
    ],
    alignment: {
      x: 'center',
      y: 'center',
    },
  });

  return (
    <img
      ref={ref}
      className={`figure ${isDragging ? 'dragging' : ''}`}
      src={src}
      alt='figure'
      draggable={false}
    />
  );
};

export default DraggableFigure;