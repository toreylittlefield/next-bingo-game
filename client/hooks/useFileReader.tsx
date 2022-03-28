import { useCallback, useEffect, useMemo, useState } from 'react';

type ReadAsType = keyof Pick<FileReader, 'readAsArrayBuffer' | 'readAsBinaryString' | 'readAsText' | 'readAsDataURL'>;

type ReaderResultType = FileReader['result'] | undefined;

type ErrorType = ProgressEvent<FileReader> | null | unknown;

type SetFileType = (value: React.SetStateAction<FileType>) => void;

type ResetFileReaderType = (image?: string, file?: File) => void;

type FileType = File | null;

type UseFileReaderOptions = {
  readType: ReadAsType;
};

type InputChangeFile = (event: React.ChangeEvent<HTMLInputElement>) => void;

type ReturnType = [
  handleInputChangeFile: InputChangeFile,
  readerResult: ReaderResultType,
  file: FileType,
  error: ErrorType,
  loading: boolean,
  resetFileReader: ResetFileReaderType,
  setFile: SetFileType,
];

const useFileReader = (options: Partial<UseFileReaderOptions>): ReturnType => {
  const { readType = 'readAsDataURL' } = options;
  const [file, setFile] = useState<FileType>(null);
  const [error, setError] = useState<ErrorType>(null);
  const [readerResult, setReaderResult] = useState<ReaderResultType>(undefined);
  const [loading, setLoading] = useState(false);

  const memoReadType = useMemo(() => readType, [readType]);

  const handleInputChangeFile = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      event.preventDefault();

      if (!event.target.files?.length) return;
      const fileFromReader = event.target.files[0];

      if (fileFromReader) {
        setFile(fileFromReader);
      }
      let fileReader: FileReader | null = new FileReader();
      try {
        fileReader[memoReadType](fileFromReader);

        fileReader.onloadstart = () => {
          setLoading(true);
        };

        fileReader.onload = (event) => {
          const result = event.target?.result;
          setReaderResult(result);
        };

        fileReader.onloadend = () => {
          setLoading(false);
        };

        fileReader.onerror = (event) => {
          setError(event);
        };

        fileReader.onabort = () => {
          setError(false);
          setLoading(false);
        };
      } catch (error) {
        setError(error);
      }
    },
    [memoReadType],
  );

  function resetFileReader(image?: string, file?: File) {
    setFile(file ?? null);
    setReaderResult(image);
  }

  return [handleInputChangeFile, readerResult, file, error, loading, resetFileReader, setFile];
};

export { useFileReader };
