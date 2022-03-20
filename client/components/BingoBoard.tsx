import { nanoid, random } from 'nanoid';
import { useState, useRef, useEffect, Fragment, useCallback } from 'react';
import { BingoTile } from './BingoTile';
// import '../styles/'

const DRAGGING_CLASS = 'dragging';

const BG_COLOR = 'backgroundColor';
const OPACITY = 'opacity';
const POINTER_EVENTS = 'pointerEvents';
const TOUCH_ACTIONS = 'touchAction';

type RowOne = {
  rowOne: number;
  colOne: number;
};

type RowTwo = {
  rowTwo: number;
  colTwo: number;
};

type TileType = {
  id: string;
  text: string;
  isChecked: boolean;
  srcImg: string;
};

const addStyleToDropRef = (dropRef: HTMLElement) => {
  const style = dropRef.style;
  style[OPACITY] = '0.5';
  style[BG_COLOR] = 'hsla(250, 80%, 90%, 0.8)';
};
const removeStyleFromDropRef = (dropRef: HTMLElement) => {
  const style = dropRef.style;
  style[OPACITY] = '';
  style[BG_COLOR] = '';
};
const addPointerStyles = (dropRef: HTMLElement) => {
  const style = dropRef.style;
  style[POINTER_EVENTS] = 'none';
  style[TOUCH_ACTIONS] = 'none';
};
const defaultPointerStyles = (dropRef: HTMLElement) => {
  const style = dropRef.style;
  style[POINTER_EVENTS] = '';
  style[TOUCH_ACTIONS] = '';
};

const addStylesToClone = (clone: HTMLElement, height: number, width: number, x?: number, y?: number) => {
  clone.style.top = `0px`;
  clone.style.left = `0px`;
  clone.style.position = 'absolute';
  clone.style.height = `${height}px`;
  clone.style.width = `${width}px`;
  clone.style.transform = `translate(${x}px, ${y}px)`;
};

const getDragDropTarget = (target: HTMLElement): HTMLElement | null => target.closest('[draggable]');

const checkIfSame = ({ rowOne, colOne }: RowOne, { rowTwo, colTwo }: RowTwo) => rowOne === rowTwo && colOne === colTwo;

const splitIntoRowCol = (id: string) => id.split(',').map((el) => Number(el));

const swap = ({ rowOne, colOne }: RowOne, { rowTwo, colTwo }: RowTwo, array: TileType[][]) => {
  const copyOne = { ...array[rowOne][colOne] };
  const copyTwo = { ...array[rowTwo][colTwo] };
  array[rowOne][colOne] = {
    ...copyTwo,
  };
  array[rowTwo][colTwo] = {
    ...copyOne,
  };
  return array;
};

const matrix2D = (): TileType[][] =>
  Array.from({ length: 5 }, (_, row) =>
    Array.from({ length: 5 }, (_, col) => ({
      text: random(1).toString(),
      isChecked: row === 2 && col === 2 ? true : false,
      srcImg: '',
      id: nanoid(),
    })),
  );

function checkWin(gameBoard: TileType[][]) {
  const len = gameBoard.length;
  const { rightToBottom, leftToTop, rowMap, colMap } = gameBoard.reduce(
    (rowAcc, row, rowIdx) => {
      row.forEach((col, colIdx) => {
        if (!col.isChecked) return;
        if (rowIdx === colIdx) {
          rowAcc.rightToBottom += 1;
        }
        if (colIdx + rowIdx === gameBoard.length - 1) {
          rowAcc.leftToTop += 1;
        }
        rowAcc.rowMap[rowIdx] = rowAcc.rowMap[rowIdx] + 1 || 1;
        rowAcc.colMap[colIdx] = rowAcc.colMap[colIdx] + 1 || 1;
      });
      return rowAcc;
    },
    { rightToBottom: 0, leftToTop: 0, rowMap: [0], colMap: [0] },
  );
  if (rightToBottom === len || leftToTop === len) {
    return true;
  }
  const checkAny = (num: number) => len === num;
  return colMap.some(checkAny) || rowMap.some(checkAny);
}

const BingoBoard = () => {
  const [matrix, setMatrix] = useState(matrix2D());
  const [isEdit, setIsEdit] = useState(true);
  const dragRef = useRef<HTMLElement | null>(null);
  const dropTargetRef = useRef<HTMLElement | null>(null);
  const [gameWin, setGameWin] = useState(false);

  const updateMatrixWithSwap = ({ rowOne, colOne }: RowOne, { rowTwo, colTwo }: RowTwo) =>
    setMatrix((prev) => {
      return [...swap({ rowOne, colOne }, { rowTwo, colTwo }, prev)];
    });

  const handleDragStart = (event: React.DragEvent) => {
    const target = event.target as HTMLElement;
    const { id } = target;

    target.classList.add(DRAGGING_CLASS);

    event.dataTransfer.setData('id', id);

    dragRef.current = target;
    dropTargetRef.current = target;

    event.dataTransfer.effectAllowed = 'copyMove';
    event.dataTransfer.dropEffect = 'move';

    console.log({ id }, 'drag start');
  };

  const handleDragEnter = (event: React.DragEvent<HTMLElement>) => {
    dropTargetRef.current && removeStyleFromDropRef(dropTargetRef.current);
    event.dataTransfer.dropEffect = 'move';
    const target = event.target as HTMLElement;
    const dropTarget = getDragDropTarget(target);
    if (dropTarget && dragRef.current?.id !== dropTarget.id) {
      console.log({ dropTarget: dropTarget.id }, target.id, 'enter');
      dropTargetRef.current = dropTarget;
      addStyleToDropRef(dropTargetRef.current);
    }
  };

  const handleDragLeave = (event: React.DragEvent) => {
    const target = event.target as HTMLElement;
    removeStyleFromDropRef(target);
  };

  const handleDragEnd = (event: React.DragEvent) => {
    const target = event.target as HTMLElement;
    const dragTarget = document.getElementById(target.id);
    if (!dragTarget) return;
    console.log(dragTarget.id, 'drag end');
    dragTarget.classList.remove(DRAGGING_CLASS);
    dropTargetRef.current && removeStyleFromDropRef(dropTargetRef.current);
  };

  const getRowColsAndSwap = (idOne: string, idTwo: string) => {
    const [rowOne, colOne] = splitIntoRowCol(idOne);
    const [rowTwo, colTwo] = splitIntoRowCol(idTwo);
    !checkIfSame({ rowOne, colOne }, { rowTwo, colTwo }) &&
      updateMatrixWithSwap({ rowOne, colOne }, { rowTwo, colTwo });
  };

  const handleDrop = (event: React.DragEvent<HTMLElement>) => {
    const id = event.dataTransfer.getData('id');
    console.log({ id }, 'drop');
    const target = event.target as HTMLElement;
    const dropTarget = getDragDropTarget(target);
    if (!dropTarget) return;
    getRowColsAndSwap(id, dropTarget.id);
    // const [rowOne, colOne] = splitIntoRowCol(id);
    // const [rowTwo, colTwo] = splitIntoRowCol(dropTarget.id);
    // !checkIfSame({ rowOne, colOne }, { rowTwo, colTwo }) &&
    //   updateMatrixWithSwap({ rowOne, colOne }, { rowTwo, colTwo });
  };

  const releasePointer = (event: React.PointerEvent) => (dragTarget: HTMLElement) =>
    dragTarget.releasePointerCapture(event.pointerId);

  const removePointerListeners = (dragTarget: HTMLElement, release: (dragTarget: HTMLElement) => void) => {
    dragTarget.onpointerup = null;
    dragTarget.onpointercancel = null;
    dragTarget.onpointermove = null;
    defaultPointerStyles(dragTarget);
    release(dragTarget);
  };

  const isPointerAtDrop = (clientX: number, clientY: number, prevClosetDrop: HTMLElement) => {
    const elementAtPoint = document.elementFromPoint(clientX, clientY) as HTMLElement;
    if (!elementAtPoint) return false;
    const closetdrop = getDragDropTarget(elementAtPoint);
    if (!closetdrop) return false;
    if (prevClosetDrop.id === closetdrop.id) {
      return true;
    }
  };

  const revertStylesAndSwap = (
    event: PointerEvent,
    prevClosetDrop: HTMLElement,
    dragTarget: HTMLElement,
    clone: HTMLElement,
    release: (dragTarget: HTMLElement) => void,
  ) => {
    const { clientX, clientY } = event;
    removePointerListeners(dragTarget, release);
    removeStyleFromDropRef(dragTarget);
    removeStyleFromDropRef(prevClosetDrop);
    dragTarget.classList.remove(DRAGGING_CLASS);
    if (isPointerAtDrop(clientX, clientY, prevClosetDrop)) {
      getRowColsAndSwap(prevClosetDrop.id, dragTarget.id);
    }

    clone.remove();
  };

  const handlePointerDown = (event: React.PointerEvent) => {
    if (!isEdit) return;
    if (event.pointerType === 'mouse') return;
    event.preventDefault();
    const target = event.target as HTMLElement;
    const dragTarget = getDragDropTarget(target);
    if (!dragTarget) return;

    addPointerStyles(dragTarget);

    dragTarget.setPointerCapture(event.pointerId);

    const release = releasePointer(event);

    const clone = dragTarget.cloneNode(true) as HTMLElement;
    clone.id = '';
    clone.draggable = false;

    addStylesToClone(clone, dragTarget.clientHeight, dragTarget.clientWidth, event.clientX, event.clientY);

    dragTarget.classList.add(DRAGGING_CLASS);
    document.body.append(clone);

    let prevClosetDrop: HTMLElement = dragTarget;

    dragTarget.onpointermove = (event) => {
      const { clientX, clientY } = event;
      clone.style.transform = `translate(${clientX}px, ${clientY}px)`;
      const elementAtPoint = document.elementFromPoint(clientX, clientY) as HTMLElement;
      if (!elementAtPoint) return;
      const closetdrop = getDragDropTarget(elementAtPoint);
      if (!closetdrop) return;
      if (prevClosetDrop.id === closetdrop.id) {
        return;
      }

      removeStyleFromDropRef(prevClosetDrop);
      addStyleToDropRef(closetdrop);
      prevClosetDrop = closetdrop;
    };

    dragTarget.onpointercancel = (event) => revertStylesAndSwap(event, prevClosetDrop, dragTarget, clone, release);

    dragTarget.onpointerup = (event) => revertStylesAndSwap(event, prevClosetDrop, dragTarget, clone, release);
  };

  const handleClick = (event: React.MouseEvent, bool: boolean, row: number, col: number) => {
    if (isEdit) return;
    event.preventDefault();
    setMatrix((prev) => {
      const copy = prev.map((el) => el.map((el) => el));
      copy[row][col].isChecked = bool;
      return copy;
    });
  };

  useEffect(() => {
    const win = checkWin(matrix);
    if (win) {
      return setGameWin(true);
    } else if (!win && gameWin) {
      setGameWin(false);
    }
  }, [matrix, gameWin]);

  const updateTextBoardPiece = useCallback((text: string, row: number, col: number) => {
    setMatrix((prev) => {
      const copy = prev.map((el) => el.map((el) => el));
      copy[row][col].text = text;
      return copy;
    });
  }, []);

  return (
    <Fragment>
      <div>
        Edit Board
        <button onClick={() => setIsEdit((prev) => !prev)}>{isEdit ? 'On' : 'Off'}</button>
      </div>
      <section className="bingo-board">
        {matrix.map((rowArr, rowIndex) =>
          rowArr.map(({ text, id, srcImg, isChecked }, colIndex) => (
            <div
              key={id}
              id={`${rowIndex},${colIndex}`}
              className={isChecked ? `bingo-piece checked` : `bingo-piece`}
              draggable={isEdit}
              onDragStart={handleDragStart}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              onClick={(event) => handleClick(event, !isChecked, rowIndex, colIndex)}
              onPointerDown={handlePointerDown}
            >
              <BingoTile
                rowIndex={rowIndex}
                colIndex={colIndex}
                text={text}
                updateTextBoardPiece={updateTextBoardPiece}
              />
            </div>
          )),
        )}
        {gameWin && <h2>BINGO!!!!</h2>}
      </section>
    </Fragment>
  );
};

export { BingoBoard };
