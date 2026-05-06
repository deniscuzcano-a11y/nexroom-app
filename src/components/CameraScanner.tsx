import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Camera, Scan, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface CameraScannerProps {
  onScanComplete?: (dimensions: { width: number; height: number; area: number }) => void
  className?: string
}

export function CameraScanner({ onScanComplete, className = '' }: CameraScannerProps) {
  const { t } = useTranslation()
  const [isActive, setIsActive] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsActive(true)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
    }
  }

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setIsActive(false)
    setIsScanning(false)
    setScanProgress(0)
  }

  const startScan = () => {
    setIsScanning(true)
    setScanProgress(0)

    // Simulate scanning progress
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          // Simulate scan completion with mock dimensions
          const mockDimensions = {
            width: Math.round(300 + Math.random() * 200), // 300-500 cm
            height: Math.round(250 + Math.random() * 150), // 250-400 cm
            area: Math.round(75000 + Math.random() * 50000) // 75000-125000 cm²
          }
          onScanComplete?.(mockDimensions)
          setIsScanning(false)
          stopCamera()
          return 100
        }
        return prev + 2
      })
    }, 50)
  }

  return (
    <div className={`nr-cameraScanner ${className}`}>
      <motion.div
        className="nr-cameraCard"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="nr-cameraHeader">
          <div className="nr-cameraIcon">
            <Camera size={20} />
          </div>
          <h3 className="nr-cameraTitle">{t('generator.camera.title')}</h3>
        </div>

        <div className="nr-cameraContent">
          {!isActive ? (
            <div className="nr-cameraPlaceholder">
              <div className="nr-cameraPlaceholderIcon">
                <Scan size={48} />
              </div>
              <p className="nr-cameraHint">{t('generator.camera.hint')}</p>
              <motion.button
                type="button"
                className="nr-cameraBtn"
                onClick={startCamera}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {t('generator.camera.button')}
              </motion.button>
            </div>
          ) : (
            <div className="nr-cameraActive">
              <div className="nr-cameraView">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="nr-cameraVideo"
                />
                <canvas ref={canvasRef} className="nr-cameraCanvas" />

                {isScanning && (
                  <div className="nr-scanOverlay">
                    <div className="nr-scanLines">
                      <div className="nr-scanLine nr-scanLine1" />
                      <div className="nr-scanLine nr-scanLine2" />
                      <div className="nr-scanLine nr-scanLine3" />
                    </div>
                    <div className="nr-scanProgress">
                      <div
                        className="nr-scanProgressFill"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                    <div className="nr-scanText">
                      {t('generator.camera.scanning')}
                    </div>
                  </div>
                )}

                <div className="nr-cameraCorners">
                  <div className="nr-corner nr-corner-tl" />
                  <div className="nr-corner nr-corner-tr" />
                  <div className="nr-corner nr-corner-bl" />
                  <div className="nr-corner nr-corner-br" />
                </div>
              </div>

              <div className="nr-cameraControls">
                {!isScanning ? (
                  <>
                    <motion.button
                      type="button"
                      className="nr-scanBtn"
                      onClick={startScan}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Scan size={16} />
                      Iniciar escaneo
                    </motion.button>
                    <motion.button
                      type="button"
                      className="nr-closeBtn"
                      onClick={stopCamera}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <X size={16} />
                    </motion.button>
                  </>
                ) : (
                  <div className="nr-scanningStatus">
                    <div className="nr-spinner" />
                    Analizando...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}