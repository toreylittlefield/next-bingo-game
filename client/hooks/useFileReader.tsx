import { useEffect, useState } from 'react';

type ReadAsType = keyof Pick<FileReader, 'readAsArrayBuffer' | 'readAsBinaryString' | 'readAsText' | 'readAsDataURL'>;

type ReaderResultType = FileReader['result'] | undefined;

type ErrorType = ProgressEvent<FileReader> | null | unknown;

type SetFileType = (value: React.SetStateAction<FileType>) => void;

type ResetFileReaderType = (image?: string, file?: File) => void;

type FileType = File | null;

type UseFileReaderOptions = {
  readType: ReadAsType;
};

type ReturnType = [
  readerResult: ReaderResultType,
  error: ErrorType,
  file: FileType,
  loading: boolean,
  setFile: SetFileType,
  reset: ResetFileReaderType,
];

const useFileReader = (options: Partial<UseFileReaderOptions>): ReturnType => {
  const { readType = 'readAsDataURL' } = options;
  const [file, setFile] = useState<FileType>(null);
  const [error, setError] = useState<ErrorType>(null);
  const [readerResult, setReaderResult] = useState<ReaderResultType>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!file) return;

    let fileReader: FileReader | null = new FileReader();

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

    try {
      fileReader[readType](file);
    } catch (error) {
      setError(error);
    }

    return () => {
      fileReader = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file?.name, readType]);

  function resetFileReader(image?: string, file?: File) {
    setFile(file ?? null);
    setReaderResult(image);
  }

  return [readerResult, error, file, loading, setFile, resetFileReader];
};

export { useFileReader };
