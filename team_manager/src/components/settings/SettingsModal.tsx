import { useState, useEffect } from 'react'
import { useSettings } from '@/hooks/useSettings'
import { Modal } from '@/components/ui/Modal'
import { ColorPicker } from '@/components/ui/ColorPicker'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

const SECTION_LABELS = {
  nrt_color: 'NRT (Non-Regression Testing)',
  ktlo_color: 'KTLO (Keep The Lights On)',
  timeoff_color: 'Time Off & Absences',
  capacity_color: 'Capacity Summary',
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { settings, updateSettings } = useSettings()

  const [nrtColor, setNrtColor] = useState(settings.nrt_color)
  const [ktloColor, setKtloColor] = useState(settings.ktlo_color)
  const [timeoffColor, setTimeoffColor] = useState(settings.timeoff_color)
  const [capacityColor, setCapacityColor] = useState(settings.capacity_color)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setNrtColor(settings.nrt_color)
    setKtloColor(settings.ktlo_color)
    setTimeoffColor(settings.timeoff_color)
    setCapacityColor(settings.capacity_color)
  }, [settings])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateSettings({
        nrt_color: nrtColor,
        ktlo_color: ktloColor,
        timeoff_color: timeoffColor,
        capacity_color: capacityColor,
      })
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setNrtColor('#9333ea')
    setKtloColor('#3b82f6')
    setTimeoffColor('#f59e0b')
    setCapacityColor('#3b82f6')
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Color Settings">
      <div className="space-y-6">
        <p className="text-sm text-[var(--text-secondary)]">
          Customize timeline section colors
        </p>

        {/* NRT Color */}
        <div>
          <label className="label">{SECTION_LABELS.nrt_color}</label>
          <ColorPicker value={nrtColor} onChange={setNrtColor} />
        </div>

        {/* KTLO Color */}
        <div>
          <label className="label">{SECTION_LABELS.ktlo_color}</label>
          <ColorPicker value={ktloColor} onChange={setKtloColor} />
        </div>

        {/* TimeOff Color */}
        <div>
          <label className="label">{SECTION_LABELS.timeoff_color}</label>
          <ColorPicker value={timeoffColor} onChange={setTimeoffColor} />
        </div>

        {/* Capacity Color */}
        <div>
          <label className="label">{SECTION_LABELS.capacity_color}</label>
          <ColorPicker value={capacityColor} onChange={setCapacityColor} />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-[var(--border-primary)]">
          <button
            onClick={handleReset}
            className="btn btn-secondary"
          >
            Reset Default
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn btn-primary flex-1"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
