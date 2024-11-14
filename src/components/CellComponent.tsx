import { FC } from 'react';
import { Cell } from '../modules/Cell';

interface CellProps {
  cell: Cell
}

const CellComponent: FC<CellProps> = ({ cell }) => {
  return (
    <div className={['cell', cell.color].join(' ')}>

    </div>
  );
};

export default CellComponent;