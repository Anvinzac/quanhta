import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Camera, Check, RotateCcw, SwitchCamera, X } from 'lucide-react'
import { photoFromVideo } from '../lib/photo'

type CameraCaptureProps = {
  onCapture: (dataUrl: string) => void
  onClose: () => void
  /** Offered when the camera can't be used, e.g. permission denied. */
  onFallback: () => void
}

type Facing = 'environment' | 'user'

export function CameraCapture({ onCapture, onClose, onFallback }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [facing, setFacing] = useState<Facing>('environment')
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const [shot, setShot] = useState<string | null>(null)
  const [cameraCount, setCameraCount] = useState(0)

  useEffect(() => {
    let stream: MediaStream | null = null
    let cancelled = false
    setReady(false)
    setError('')
    navigator.mediaDevices.getUserMedia({ video: { facingMode: facing, width: { ideal: 1600 }, height: { ideal: 1600 } }, audio: false })
      .then(async media => {
        if (cancelled) return media.getTracks().forEach(track => track.stop())
        stream = media
        const video = videoRef.current!
        video.srcObject = media
        await video.play()
        setReady(true)
        const devices = await navigator.mediaDevices.enumerateDevices()
        setCameraCount(devices.filter(device => device.kind === 'videoinput').length)
      })
      .catch((reason: DOMException) => {
        if (cancelled) return
        setError(reason.name === 'NotAllowedError'
          ? 'Trình duyệt chưa được cấp quyền dùng camera. Hãy cho phép trong cài đặt trang, hoặc tải ảnh có sẵn lên.'
          : 'Không mở được camera trên thiết bị này. Bạn có thể tải ảnh có sẵn lên.')
      })
    return () => {
      cancelled = true
      stream?.getTracks().forEach(track => track.stop())
    }
  }, [facing])

  useEffect(() => {
    // Capture phase on document runs before the editor sheet's window listener, so Escape only closes the camera.
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      onClose()
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [onClose])

  const takePhoto = () => {
    const video = videoRef.current
    if (video && video.videoWidth >= 16) setShot(photoFromVideo(video))
  }

  return createPortal(<div className="camera-overlay" role="dialog" aria-modal="true" aria-label="Chụp ảnh sản phẩm">
    <div className="camera-frame">
      <video ref={videoRef} playsInline muted className={`${facing === 'user' ? 'mirrored' : ''}${shot ? ' behind' : ''}`} />
      {shot && <img src={shot} alt="Ảnh vừa chụp" />}
      {!ready && !error && <p className="camera-status">Đang mở camera…</p>}
      {error && <div className="camera-status error">
        <p>{error}</p>
        <button className="secondary-btn" onClick={onFallback}>Tải ảnh lên</button>
      </div>}
      <button className="icon-btn camera-close" onClick={onClose} aria-label="Đóng camera"><X size={22} /></button>
    </div>

    <div className="camera-controls">
      {shot
        ? <>
            <button className="camera-secondary" onClick={() => setShot(null)}><RotateCcw size={20} /><span>Chụp lại</span></button>
            <button className="primary-btn" onClick={() => onCapture(shot)}><Check size={18} /> Dùng ảnh này</button>
          </>
        : <>
            <span className="camera-spacer" />
            <button className="shutter" onClick={takePhoto} disabled={!ready} aria-label="Chụp"><Camera size={26} /></button>
            {cameraCount > 1
              ? <button className="camera-secondary" onClick={() => setFacing(value => value === 'environment' ? 'user' : 'environment')} aria-label="Đổi camera"><SwitchCamera size={22} /></button>
              : <span className="camera-spacer" />}
          </>}
    </div>
  </div>, document.body)
}
