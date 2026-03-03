import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, FolderOpen, Check } from 'lucide-react';
import { getSampleList, analyzeSample } from '../../lib/api';

export default function PdfUpload({ onFilesSelected, onSamplesLoaded, isLoading, error }) {
  const [samples, setSamples] = useState([]);
  const [showSamples, setShowSamples] = useState(false);
  const [selectedSamples, setSelectedSamples] = useState(new Set());
  const [loadingSamples, setLoadingSamples] = useState(false);

  useEffect(() => {
    getSampleList()
      .then(setSamples)
      .catch(() => setSamples([]));
  }, []);

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

  const toggleSample = (filename) => {
    setSelectedSamples(prev => {
      const next = new Set(prev);
      if (next.has(filename)) next.delete(filename);
      else next.add(filename);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedSamples.size === samples.length) {
      setSelectedSamples(new Set());
    } else {
      setSelectedSamples(new Set(samples));
    }
  };

  const loadSelectedSamples = async () => {
    if (selectedSamples.size === 0) return;
    setLoadingSamples(true);
    try {
      const results = [];
      for (const filename of [...selectedSamples].sort()) {
        const response = await analyzeSample(filename);
        results.push({ fileName: filename, data: response.data, error: null, loading: false });
      }
      onSamplesLoaded?.(results);
      setShowSamples(false);
      setSelectedSamples(new Set());
    } catch {
      // handled by parent
    } finally {
      setLoadingSamples(false);
    }
  };

  // Formato mese dal nome file: "busta_gennaio_2024.pdf" → "Gennaio 2024"
  const formatLabel = (filename) => {
    const m = filename.match(/busta_(\w+)_(\d{4})\.pdf/);
    if (!m) return filename;
    return m[1].charAt(0).toUpperCase() + m[1].slice(1) + ' ' + m[2];
  };

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

      {/* Bottone sample */}
      {samples.length > 0 && (
        <div>
          <button
            onClick={() => setShowSamples(!showSamples)}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border text-text-muted hover:text-text hover:border-accent/50 hover:bg-surface-hover transition-colors text-sm cursor-pointer disabled:opacity-50"
          >
            <FolderOpen className="w-4 h-4" />
            Carica buste paga di esempio ({samples.length} disponibili)
          </button>

          {showSamples && (
            <div className="mt-3 border border-border rounded-xl bg-surface p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-text-muted">Seleziona le buste da caricare:</p>
                <button
                  onClick={selectAll}
                  className="text-xs text-accent hover:text-accent-hover transition-colors cursor-pointer"
                >
                  {selectedSamples.size === samples.length ? 'Deseleziona tutto' : 'Seleziona tutto'}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {samples.map((filename) => {
                  const selected = selectedSamples.has(filename);
                  return (
                    <button
                      key={filename}
                      onClick={() => toggleSample(filename)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left cursor-pointer
                        ${selected
                          ? 'bg-accent/15 border border-accent/40 text-accent'
                          : 'bg-bg border border-border/50 text-text-muted hover:border-accent/30'
                        }
                      `}
                    >
                      <div className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center
                        ${selected ? 'bg-accent border-accent' : 'border-border'}
                      `}>
                        {selected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      {formatLabel(filename)}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={loadSelectedSamples}
                disabled={selectedSamples.size === 0 || loadingSamples}
                className="w-full px-4 py-2.5 rounded-lg font-medium transition-colors bg-accent hover:bg-accent-hover text-white text-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loadingSamples
                  ? 'Caricamento...'
                  : `Analizza ${selectedSamples.size} ${selectedSamples.size === 1 ? 'busta' : 'buste'} paga`
                }
              </button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-danger text-sm bg-danger/10 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
