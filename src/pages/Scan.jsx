import { useRef } from 'react'
import './Scan.css'

function Scan({ onImageSelected, onImageSelectedForAI, onCancel }) {
  const inputOcrRef = useRef(null)
  const inputAiRef = useRef(null)

  const handleOcrFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      onImageSelected(file)
    }
    e.target.value = ''
  }

  const handleAiFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      onImageSelectedForAI?.(file)
    }
    e.target.value = ''
  }

  return (
    <div className="scan-screen">
      <div className="scan-options">
        <button
          className="scan-btn primary"
          onClick={() => inputOcrRef.current?.click()}
        >
          Choose photo (OCR)
        </button>
        <input
          ref={inputOcrRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleOcrFileChange}
          className="scan-input-hidden"
        />
        {onImageSelectedForAI && (
          <>
            <button
              className="scan-btn ai"
              onClick={() => inputAiRef.current?.click()}
            >
              Choose photo (AI)
            </button>
            <input
              ref={inputAiRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleAiFileChange}
              className="scan-input-hidden"
            />
          </>
        )}
        <button className="scan-btn secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  )
}

export default Scan
