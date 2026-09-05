import { ParkingSquare } from 'lucide-react'
import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/Badge'

interface ParkingLotButtonProps {
  onClick: () => void
  count: number
}

export function ParkingLotButton({ onClick, count }: ParkingLotButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-float hover:shadow-card-hover transition-shadow duration-200 flex items-center justify-center group"
    >
      <ParkingSquare size={24} className="group-hover:scale-110 transition-transform duration-200" />
      {count > 0 && (
        <Badge
          variant="mad"
          className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 flex items-center justify-center text-[10px] font-bold rounded-full shadow-md"
        >
          {count}
        </Badge>
      )}
    </motion.button>
  )
}
