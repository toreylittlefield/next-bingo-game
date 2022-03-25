import { useEffect, useState } from 'react';

type ReadAsType = keyof Pick<FileReader, 'readAsArrayBuffer' | 'readAsBinaryString' | 'readAsText' | 'readAsDataURL'>;

type ReaderResultType = FileReader['result'] | undefined;

type ErrorType = ProgressEvent<FileReader> | null | unknown;

type SetFileType = (value: React.SetStateAction<FileType>) => void;

type FileType = File | null;

type UseFileReaderOptions = {
  readType: ReadAsType;
  onloadCB: (result: ReaderResultType, ...args: any[]) => void;
};

type ReturnType = [
  readerResult: ReaderResultType,
  error: ErrorType,
  file: FileType,
  loading: boolean,
  setFile: SetFileType,
];

const useFileReader = (options: Partial<UseFileReaderOptions>): ReturnType => {
  const { readType = 'readAsDataURL', onloadCB = () => {} } = options;
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
      onloadCB(result, file);
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
  }, [file, onloadCB, readType]);

  return [readerResult, error, file, loading, setFile];
};

export { useFileReader };
