import { useCallback, useState } from "react"
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { TransactionSource } from "@/types/Transaction"
import { parseFile } from "@/services/fileParser"
import { useFinanceStore } from "@/store/financeStore"

interface FileUploaderProps {
  source: TransactionSource
  label: string
}

export function FileUploader({ source, label }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  const addBank = useFinanceStore((s) => s.addBankTransactions)
  const addCard = useFinanceStore((s) => s.addCreditCardTransactions)

  const handleFile = useCallback(
    async (file: File) => {
      setIsLoading(true)
      setFileName(file.name)
      try {
        const transactions = await parseFile(file, source)
        if (source === "bank") {
          addBank(transactions)
        } else {
          addCard(transactions)
        }
      } catch (err) {
        console.error("Errore nel parsing del file:", err)
      } finally {
        setIsLoading(false)
      }
    },
    [source, addBank, addCard],
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const onFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  return (
    <Card
      className={`border-2 border-dashed transition-colors cursor-pointer ${
        isDragging
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-primary/50"
      }`}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
    >
      <CardContent className="flex flex-col items-center justify-center py-8 gap-3">
        {isLoading ? (
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        ) : fileName ? (
          <FileSpreadsheet className="h-10 w-10 text-green-500" />
        ) : (
          <Upload className="h-10 w-10 text-muted-foreground" />
        )}

        <div className="text-center">
          <p className="text-sm font-medium">
            {isLoading
              ? "Elaborazione in corso..."
              : fileName
                ? fileName
                : `Trascina qui il file ${label}`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Supporta .xlsx, .xls, .csv
          </p>
        </div>

        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium cursor-pointer hover:bg-primary/90 transition-colors">
          Scegli file
          <input
            type="file"
            className="hidden"
            accept=".xlsx,.xls,.csv,.txt"
            onChange={onFileSelect}
          />
        </label>
      </CardContent>
    </Card>
  )
}
