import React from 'react';

type Props = {
  rowIndex: number;
  colIndex: number;
  text: string;
  updateTextBoardPiece: (text: string, row: number, col: number) => void;
};

const CustomBingoTile = ({ rowIndex, colIndex, text, updateTextBoardPiece }: Props) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateTextBoardPiece(event.target.value, rowIndex, colIndex);
  };
  console.count('board text render');
  if (rowIndex === 2 && colIndex === 2) {
    return (
      <p className="board-text">
        free bingo piece{' '}
        <sub>
          <input value={text} onChange={handleChange} />
        </sub>
      </p>
    );
  }
  return (
    <p className="board-text">
      <input value={text} onChange={handleChange} />
    </p>
  );
};

const BingoTile = React.memo(CustomBingoTile);

export { BingoTile };
