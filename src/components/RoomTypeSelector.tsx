import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Bed, Sofa, Gamepad2, Monitor, Home } from 'lucide-react'

interface RoomTypeOption {
  key: string
  name: string
  icon: React.ReactNode
  description: string
}

interface RoomTypeSelectorProps {
  selectedRoom: string
  onRoomChange: (room: string) => void
}

export function RoomTypeSelector({ selectedRoom, onRoomChange }: RoomTypeSelectorProps) {
  const { t } = useTranslation()

  const roomTypes: RoomTypeOption[] = [
    {
      key: 'bedroom',
      name: t('demo.steps.1.roomTypes.bedroom'),
      icon: <Bed size={24} />,
      description: 'Sleep & personal space'
    },
    {
      key: 'livingroom',
      name: t('demo.steps.1.roomTypes.livingroom'),
      icon: <Sofa size={24} />,
      description: 'Relaxation & entertainment'
    },
    {
      key: 'gaming',
      name: t('demo.steps.1.roomTypes.gaming'),
      icon: <Gamepad2 size={24} />,
      description: 'Gaming & entertainment setup'
    },
    {
      key: 'office',
      name: t('demo.steps.1.roomTypes.office'),
      icon: <Monitor size={24} />,
      description: 'Work & productivity space'
    },
    {
      key: 'studio',
      name: t('demo.steps.1.roomTypes.studio'),
      icon: <Home size={24} />,
      description: 'Multi-purpose living space'
    }
  ]

  return (
    <div className="nr-roomGrid">
      {roomTypes.map((room) => (
        <motion.button
          key={room.key}
          type="button"
          className={`nr-roomCard ${selectedRoom === room.key ? 'is-selected' : ''}`}
          onClick={() => onRoomChange(room.key)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="nr-roomIcon">
            {room.icon}
          </div>
          <div className="nr-roomContent">
            <div className="nr-roomName">{room.name}</div>
            <div className="nr-roomDesc">{room.description}</div>
          </div>
        </motion.button>
      ))}
    </div>
  )
}