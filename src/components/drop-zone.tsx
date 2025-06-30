"use client";

import { forwardRef, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

interface FileWithPreview extends File {
  preview: string;
}

interface DropZoneInputProps extends React.ComponentPropsWithoutRef<"input"> {
  onFileDrop?: (file: File[]) => void;
  defaultFile?: File;
  maxFiles?: number;
}

const DropZoneInput = forwardRef<HTMLInputElement, DropZoneInputProps>(
  ({ onFileDrop, defaultFile, multiple, maxFiles, ...props }, ref) => {
    const [files, setFiles] = useState<FileWithPreview[] | undefined>(() => {
      if (defaultFile) {
        return [
          Object.assign(defaultFile, {
            preview: URL.createObjectURL(defaultFile),
          }),
        ];
      }
      return undefined;
    });

    const { getRootProps, getInputProps } = useDropzone({
      accept: {
        "image/jpeg": [],
        "image/png": [],
      },
      multiple: multiple,
      maxSize: 5 * 1024 * 1024,
      maxFiles: maxFiles,
      onDrop: (acceptedFiles, fileRejections) => {
        const files = acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        );
        onFileDrop?.(files);
        setFiles(files);
      },
    });

    const thumbs = files && (
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {files.map(
          (file) =>
            file.type.includes("image") && (
              <div className="mt-2 relative h-40 basis-[30%]" key={file.name}>
                <img
                  src={file.preview}
                  onLoad={() => {
                    URL.revokeObjectURL(file.preview);
                  }}
                  fill
                  className="object-contain"
                  alt={file.name}
                />
              </div>
            )
        )}
      </div>
    );

    useEffect(() => {
      // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
      return () => files?.forEach((file) => URL.revokeObjectURL(file.preview));
    }, [files]);

    return (
      <section>
        <div
          {...getRootProps({
            className:
              "dropzone border border-dashed border-2 rounded-md grid place-items-center py-10",
          })}
        >
          <input {...getInputProps(props)} ref={ref} />
          <p>
            Drag &apos;n&apos; drop some files here, or click to select files
          </p>
        </div>
        {thumbs}
      </section>
    );
  }
);

DropZoneInput.displayName = "DropZoneInput";
export default DropZoneInput;
