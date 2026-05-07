interface RoomSceneMockupProps {
  mode?: 'before' | 'after' | 'scan'
  className?: string
  labels?: string[]
  showScan?: boolean
  compact?: boolean
}

export function RoomSceneMockup({
  mode = 'after',
  className = '',
  labels = [],
  showScan = false,
  compact = false,
}: RoomSceneMockupProps) {
  return (
    <div
      className={`nr-roomScene nr-roomScene--${mode} ${compact ? 'is-compact' : ''} ${className}`}
      aria-hidden="true"
    >
      <div className="nr-roomSceneWindow">
        <span />
        <span />
      </div>
      <div className="nr-roomSceneLight" />
      <div className="nr-roomSceneFloor" />
      <div className="nr-roomSceneRug" />
      <div className="nr-roomSceneSofa" />
      <div className="nr-roomSceneTable" />
      <div className="nr-roomScenePlant" />
      <div className="nr-roomSceneShelf" />
      <div className="nr-roomSceneLamp" />
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
