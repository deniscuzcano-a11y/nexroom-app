interface RoomSceneMockupProps {
  mode?: 'before' | 'after' | 'scan'
  className?: string
  labels?: string[]
  showScan?: boolean
  compact?: boolean
  ariaLabel?: string
}

const roomSceneImages = {
  before: '/assets/room-preview-bedroom.webp',
  after: '/assets/room-preview-living.webp',
  scan: '/assets/room-preview-modern.webp',
} as const

export function RoomSceneMockup({
  mode = 'after',
  className = '',
  labels = [],
  showScan = false,
  compact = false,
  ariaLabel,
}: RoomSceneMockupProps) {
  const accessibilityProps = ariaLabel
    ? { role: 'img', 'aria-label': ariaLabel }
    : { 'aria-hidden': true }

  return (
    <div
      className={`nr-roomScene nr-roomScene--${mode} ${compact ? 'is-compact' : ''} ${className}`}
      {...accessibilityProps}
    >
      <img
        className="nr-roomSceneImage"
        src={roomSceneImages[mode]}
        alt=""
        loading="lazy"
        draggable={false}
      />
      <div className="nr-roomSceneShade" aria-hidden="true" />
      <div className="nr-roomSceneOutline nr-roomSceneOutline--desk" />
      <div className="nr-roomSceneOutline nr-roomSceneOutline--storage" />
      {(showScan || mode === 'scan') && (
        <>
          <div className="nr-roomSceneGrid" />
          <div className="nr-roomScanBeam" />
          <div className="nr-roomScanPoint nr-roomScanPoint--one" />
          <div className="nr-roomScanPoint nr-roomScanPoint--two" />
          <div className="nr-roomScanPoint nr-roomScanPoint--three" />
        </>
      )}
      {labels.length > 0 && (
        <div className="nr-roomSceneLabels">
          {labels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      )}
    </div>
  )
}
