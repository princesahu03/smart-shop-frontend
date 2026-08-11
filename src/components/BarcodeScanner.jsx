import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/library'

export default function BarcodeScanner({ 
  onScan, 
  onClose 
}) {
  const videoRef = useRef(null)
  const readerRef = useRef(null)
  const [error, setError] = useState(null)
  const [scanning, setScanning] = useState(true)

  useEffect(() => {
    startScanner()
    return () => stopScanner()
  }, [])

  const startScanner = async () => {
    try {
      readerRef.current = 
        new BrowserMultiFormatReader()

      const devices = await 
        readerRef.current
          .listVideoInputDevices()

      if (devices.length === 0) {
        setError('No camera found!')
        return
      }

      // Prefer back camera:
      const backCamera = devices.find(d =>
        d.label.toLowerCase()
          .includes('back') ||
        d.label.toLowerCase()
          .includes('rear') ||
        d.label.toLowerCase()
          .includes('environment')
      ) || devices[devices.length - 1]

      await readerRef.current
        .decodeFromVideoDevice(
          backCamera.deviceId,
          videoRef.current,
          (result, err) => {
            if (result && scanning) {
              setScanning(false)
              onScan(result.getText())
              stopScanner()
            }
          }
        )
    } catch (err) {
      setError(
        'Camera access denied! ' +
        'Please allow camera permission.'
      )
    }
  }

  const stopScanner = () => {
    if (readerRef.current) {
      readerRef.current.reset()
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal" style={{
        maxWidth: '400px',
        padding: '24px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '700',
            color: 'var(--text)',
            fontFamily: 'Space Grotesk'
          }}>
            📷 Scan Barcode
          </h2>
          <button onClick={() => {
            stopScanner()
            onClose()
          }}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: 'var(--text-muted)'
            }}>
            ✕
          </button>
        </div>

        {error ? (
          <div style={{
            textAlign: 'center',
            padding: '32px 0'
          }}>
            <div style={{ fontSize: '48px' }}>
              📷
            </div>
            <p style={{
              color: '#EF4444',
              fontSize: '14px',
              marginTop: '12px',
              lineHeight: 1.5
            }}>
              {error}
            </p>
            <button
              onClick={onClose}
              className="btn-primary"
              style={{ marginTop: '16px' }}
            >
              Close
            </button>
          </div>
        ) : (
          <div>
            {/* Scanner View */}
            <div style={{
              position: 'relative',
              borderRadius: '16px',
              overflow: 'hidden',
              background: '#000'
            }}>
              <video
                ref={videoRef}
                style={{
                  width: '100%',
                  height: '240px',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />

              {/* Scan Frame */}
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '200px',
                  height: '120px',
                  border: '2px solid #F59E0B',
                  borderRadius: '8px',
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)'
                }}>
                  {/* Corner markers */}
                  {['top-left', 'top-right',
                    'bottom-left', 'bottom-right']
                    .map(pos => (
                    <div key={pos} style={{
                      position: 'absolute',
                      width: '16px',
                      height: '16px',
                      borderColor: '#F59E0B',
                      borderStyle: 'solid',
                      ...(pos === 'top-left' ? {
                        top: -2, left: -2,
                        borderWidth: '3px 0 0 3px',
                        borderRadius: '4px 0 0 0'
                      } : pos === 'top-right' ? {
                        top: -2, right: -2,
                        borderWidth: '3px 3px 0 0',
                        borderRadius: '0 4px 0 0'
                      } : pos === 'bottom-left' ? {
                        bottom: -2, left: -2,
                        borderWidth: '0 0 3px 3px',
                        borderRadius: '0 0 0 4px'
                      } : {
                        bottom: -2, right: -2,
                        borderWidth: '0 3px 3px 0',
                        borderRadius: '0 0 4px 0'
                      })
                    }} />
                  ))}

                  {/* Scan line animation */}
                  <div style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'linear-gradient(90deg, transparent, #F59E0B, transparent)',
                    animation: 'scan 2s linear infinite',
                    top: '50%'
                  }} />
                </div>
              </div>
            </div>

            <style>{`
              @keyframes scan {
                0% { top: 10%; }
                50% { top: 80%; }
                100% { top: 10%; }
              }
            `}</style>

            <p style={{
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '13px',
              marginTop: '16px'
            }}>
              Position barcode inside the frame
            </p>

            {/* Manual Entry */}
            <div style={{
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border)'
            }}>
              <p style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
                marginBottom: '8px',
                textAlign: 'center'
              }}>
                Or enter barcode manually:
              </p>
              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                <input
                  type="text"
                  placeholder="Type barcode..."
                  className="input"
                  id="manual-barcode"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const val = e.target.value
                      if (val) {
                        stopScanner()
                        onScan(val)
                      }
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const val = document
                      .getElementById(
                        'manual-barcode'
                      ).value
                    if (val) {
                      stopScanner()
                      onScan(val)
                    }
                  }}
                  className="btn-primary"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}