interface ImagePlaceholderProps {
  type:
    | 'minimal'
    | 'modern'
    | 'cozy'
    | 'hero'
    | 'scandinavian'
    | 'japandi'
    | 'luxury'
    | 'bedroom'
    | 'livingroom'
    | 'office'

  className?: string
  showIcon?: boolean
  alt?: string
}

const roomPreviewAssets = {
  minimal: '/assets/room-preview-minimal.webp',
  modern: '/assets/room-preview-modern.webp',
  cozy: '/assets/room-preview-cozy.webp',
  scandinavian: '/assets/room-preview-minimal.webp',
  japandi: '/assets/room-preview-bedroom.webp',
  luxury: '/assets/room-preview-living.webp',
  bedroom: '/assets/room-preview-bedroom.webp',
  livingroom: '/assets/room-preview-living.webp',
  office: '/assets/room-preview-workspace.webp',
} as const

const roomPreviewTypes = new Set(Object.keys(roomPreviewAssets))

const roomPreviewScanPoints = [
  'nr-roomPreviewScanPoint--one',
  'nr-roomPreviewScanPoint--two',
  'nr-roomPreviewScanPoint--three',
]

const hasRoomPreviewAsset = (value: ImagePlaceholderProps['type']): value is keyof typeof roomPreviewAssets =>
  roomPreviewTypes.has(value)

export function ImagePlaceholder({
  type,
  className = '',
  showIcon = true,
  alt,
}: ImagePlaceholderProps) {
  if (hasRoomPreviewAsset(type)) {
    const accessibilityProps = alt ? {} : { 'aria-hidden': true }

    return (
      <div
        className={`nr-imagePlaceholder nr-roomPreview nr-roomPreview--${type} ${className}`}
        {...accessibilityProps}
      >
        <img
          className="nr-roomPreviewImage"
          src={roomPreviewAssets[type]}
          alt={alt ?? ''}
          loading="lazy"
          draggable={false}
        />
        <div className="nr-roomPreviewScan" aria-hidden="true">
          <span className="nr-roomPreviewScanLine" />
          {roomPreviewScanPoints.map((point) => (
            <span key={point} className={`nr-roomPreviewScanPoint ${point}`} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`nr-imagePlaceholder nr-imagePlaceholder--soft ${className}`} aria-hidden="true">
      {showIcon && <span className="nr-imagePlaceholderMark" />}
    </div>
  )
}
