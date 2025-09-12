import { useState, useRef, useCallback } from 'react';
import { Camera } from 'react-camera-pro';
import Tesseract from 'tesseract.js';

export default function ImageRecognition({ type, onResult, onClose }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [progress, setProgress] = useState(0);
  const [useCamera, setUseCamera] = useState(true);
  const camera = useRef(null);
  const fileInputRef = useRef(null);

  const getTitle = () => {
    switch (type) {
      case 'pill': return '💊 Pill Recognition';
      case 'bill': return '🧾 Medical Bill Scanner';
      case 'prescription': return '📝 Prescription Reader';
      case 'verification': return '📸 Verification Photo';
      default: return '📷 Image Recognition';
    }
  };

  const getInstructions = () => {
    switch (type) {
      case 'pill':
        return 'Take a clear photo of your medication pill or bottle. Make sure the text is visible and well-lit.';
      case 'bill':
        return 'Capture your medical bill or receipt. Ensure all text is clearly visible and the image is not blurry.';
      case 'prescription':
        return 'Photograph your prescription. Even handwritten prescriptions can be processed, though printed ones work better.';
      case 'verification':
        return 'Take a photo to verify you have taken your medication. This helps with medication compliance tracking.';
      default:
        return 'Take a clear photo with good lighting for best results.';
    }
  };

  const capturePhoto = useCallback(() => {
    if (camera.current) {
      const imageSrc = camera.current.takePhoto();
      setCapturedImage(imageSrc);
      processImage(imageSrc);
    }
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageSrc = e.target.result;
        setCapturedImage(imageSrc);
        processImage(imageSrc);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (imageSrc) => {
    setIsProcessing(true);
    setProgress(0);

    try {
      // For verification photos, skip OCR processing
      if (type === 'verification') {
        setProgress(100);
        onResult({
          originalText: '',
          processedData: {},
          image: imageSrc
        });
        return;
      }

      const result = await Tesseract.recognize(
        imageSrc,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round(m.progress * 100));
            }
          }
        }
      );

      const text = result.data.text.trim();
      setExtractedText(text);

      // Process based on type
      let processedData = {};

      if (type === 'pill') {
        processedData = processPillText(text);
      } else if (type === 'bill') {
        processedData = processBillText(text);
      } else if (type === 'prescription') {
        processedData = processPrescriptionText(text);
      }

      onResult({
        originalText: text,
        processedData,
        image: imageSrc
      });

    } catch (error) {
      console.error('OCR Error:', error);
      alert('Failed to process image. Please try again with a clearer photo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const processPillText = (text) => {
    // Extract medication information from pill/bottle text
    const lines = text.split('\n').filter(line => line.trim());
    
    // Common patterns for medication information
    const medicationName = lines.find(line => 
      /^[A-Z][a-z]+/.test(line) && 
      !line.includes('mg') && 
      !line.includes('ml') && 
      line.length > 3
    ) || '';

    const dosage = lines.find(line => 
      /\d+\s*(mg|ml|mcg|g|units?)/i.test(line)
    ) || '';

    const instructions = lines.find(line => 
      /(take|tablet|capsule|daily|twice|morning|evening)/i.test(line)
    ) || '';

    return {
      name: medicationName.trim(),
      dosage: dosage.trim(),
      instructions: instructions.trim(),
      allText: text
    };
  };

  const processBillText = (text) => {
    // Extract bill information
    const lines = text.split('\n').filter(line => line.trim());
    
    const totalAmount = lines.find(line => 
      /total|amount|due/i.test(line) && /\$?\d+\.?\d*/i.test(line)
    ) || '';

    const date = lines.find(line => 
      /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(line)
    ) || '';

    const provider = lines.find(line => 
      /(hospital|clinic|medical|pharmacy|dr\.|doctor)/i.test(line) && 
      line.length > 5
    ) || '';

    return {
      provider: provider.trim(),
      amount: totalAmount.trim(),
      date: date.trim(),
      allText: text
    };
  };

  const processPrescriptionText = (text) => {
    // Extract prescription information
    const lines = text.split('\n').filter(line => line.trim());
    
    const medications = [];
    let currentMed = {};

    lines.forEach(line => {
      if (/^[A-Z][a-z]+/.test(line) && !line.includes('Dr.') && !line.includes('MD')) {
        if (currentMed.name) {
          medications.push(currentMed);
        }
        currentMed = { name: line.trim() };
      } else if (/\d+\s*(mg|ml|mcg|g|units?)/i.test(line)) {
        currentMed.dosage = line.trim();
      } else if (/(take|tablet|capsule|daily|twice|morning|evening|sig)/i.test(line)) {
        currentMed.instructions = line.trim();
      }
    });

    if (currentMed.name) {
      medications.push(currentMed);
    }

    const doctor = lines.find(line => 
      /(dr\.|doctor|md|physician)/i.test(line)
    ) || '';

    return {
      doctor: doctor.trim(),
      medications,
      allText: text
    };
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '90vw',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#1f2937',
            margin: 0
          }}>
            {getTitle()}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ✕
          </button>
        </div>

        {/* Instructions */}
        <p style={{
          color: '#6b7280',
          marginBottom: '1.5rem',
          lineHeight: '1.5'
        }}>
          {getInstructions()}
        </p>

        {/* Camera/Upload Toggle */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}>
          <button
            onClick={() => setUseCamera(true)}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              background: useCamera ? '#059669' : '#f3f4f6',
              color: useCamera ? 'white' : '#6b7280',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            📷 Use Camera
          </button>
          <button
            onClick={() => setUseCamera(false)}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              background: !useCamera ? '#059669' : '#f3f4f6',
              color: !useCamera ? 'white' : '#6b7280',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            📁 Upload Image
          </button>
        </div>

        {/* Camera or File Upload */}
        {!capturedImage && (
          <div style={{
            width: '100%',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            {useCamera ? (
              <div>
                <div style={{
                  width: '100%',
                  height: '300px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  marginBottom: '1rem'
                }}>
                  <Camera
                    ref={camera}
                    aspectRatio={4/3}
                    numberOfCamerasCallback={() => {}}
                    errorMessages={{
                      noCameraAccessible: 'No camera accessible. Please allow camera access.',
                      permissionDenied: 'Camera permission denied. Please allow camera access.',
                      switchCamera: 'Switch camera not supported.',
                      canvas: 'Canvas not supported.'
                    }}
                  />
                </div>
                <button
                  onClick={capturePhoto}
                  disabled={isProcessing}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '1.1rem',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    opacity: isProcessing ? 0.6 : 1
                  }}
                >
                  📸 Capture Photo
                </button>
              </div>
            ) : (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  style={{
                    width: '100%',
                    padding: '3rem',
                    borderRadius: '8px',
                    border: '2px dashed #d1d5db',
                    background: '#f9fafb',
                    color: '#6b7280',
                    fontWeight: '600',
                    fontSize: '1.1rem',
                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                    opacity: isProcessing ? 0.6 : 1,
                    textAlign: 'center'
                  }}
                >
                  📁 Click to Upload Image<br />
                  <span style={{ fontSize: '0.875rem' }}>
                    Supports JPG, PNG, WebP
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Processing Status */}
        {isProcessing && (
          <div style={{
            textAlign: 'center',
            padding: '2rem'
          }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              border: '3px solid #f3f4f6',
              borderTop: '3px solid #059669',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }}></div>
            <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
              Processing image...
            </p>
            <div style={{
              width: '100%',
              height: '8px',
              background: '#f3f4f6',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #059669, #34d399)',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              {progress}% complete
            </p>
          </div>
        )}

        {/* Results */}
        {capturedImage && extractedText && !isProcessing && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: '#f0fdf4',
            borderRadius: '8px',
            border: '1px solid #bbf7d0'
          }}>
            <h3 style={{
              color: '#16a34a',
              marginBottom: '1rem',
              fontSize: '1.125rem'
            }}>
              ✅ Text Extracted Successfully!
            </h3>
            <div style={{
              background: 'white',
              padding: '1rem',
              borderRadius: '6px',
              border: '1px solid #e5e7eb',
              maxHeight: '200px',
              overflow: 'auto'
            }}>
              <pre style={{
                whiteSpace: 'pre-wrap',
                fontSize: '0.875rem',
                color: '#1f2937',
                margin: 0
              }}>
                {extractedText}
              </pre>
            </div>
            
            <div style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '1rem'
            }}>
              <button
                onClick={() => {
                  setCapturedImage(null);
                  setExtractedText('');
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  background: 'white',
                  color: '#6b7280',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                📷 Take Another
              </button>
              <button
                onClick={onClose}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                ✅ Use This Result
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
