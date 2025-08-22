import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface SingleFileUploaderProps {
  file: string | null;
  setFile: (base64: string) => void;
  children: React.ReactNode;
  disabled: boolean;
}

const SingleFileUploader: React.FC<SingleFileUploaderProps> = ({
  file,
  setFile,
  children,
  disabled
}) => {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);

      if (acceptedFiles.length === 0) {
        return;
      }

      const selectedFile = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setFile(reader.result as string);
        }
      };
      reader.readAsDataURL(selectedFile);
    },
    [setFile]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.gif']
    },
    maxSize: 1 * 1024 * 1024,
    multiple: false
  });

  return (
    <>
      {disabled ? (
        <>{children}</>
      ) : (
        <div
          {...getRootProps({
            className: 'dropzone',
            disabled: disabled
          })}
        >
          <input {...getInputProps()} />
          {children}
        </div>
      )}
    </>
  );
};

export default SingleFileUploader;
