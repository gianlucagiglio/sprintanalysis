import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle } from 'lucide-react';

export default function PdfUpload({ onFilesSelected, isLoading, error }) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onFilesSelected(acceptedFiles);
      }
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    disabled: isLoading,
    multiple: true,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all
          ${isDragActive
            ? 'border-accent bg-accent/5'
            : 'border-border hover:border-accent/50 hover:bg-surface-hover'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          {isDragActive ? (
            <>
              <FileText className="w-12 h-12 text-accent" />
              <p className="text-accent font-medium">Rilascia i PDF qui</p>
            </>
          ) : (
            <>
              <Upload className="w-12 h-12 text-text-muted" />
              <p className="text-text font-medium">
                Trascina qui le tue buste paga (PDF)
              </p>
              <p className="text-text-muted text-sm">
                Puoi selezionare uno o pi&ugrave; file
              </p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-danger text-sm bg-danger/10 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
