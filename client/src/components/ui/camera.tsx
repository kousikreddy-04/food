import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, X, Check, Image } from "lucide-react";

interface CameraComponentProps {
  onImageCapture: (image: string) => void;
  onCancel: () => void;
}

export function CameraComponent({ onImageCapture, onCancel }: CameraComponentProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "environment"
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        setError(null);
      }
    } catch (err) {
      setError("Camera access denied or not available. You can upload an image instead.");
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  };

  const confirmImage = () => {
    if (capturedImage) {
      onImageCapture(capturedImage);
    }
  };

  const retakeImage = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCapturedImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    startCamera();
    
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <div className="text-center mb-4">
        <h3 className="text-lg font-medium">Take a Photo</h3>
        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}
      </div>
      
      <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-4">
        {!capturedImage ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
            style={{ display: isCameraActive ? 'block' : 'none' }}
          />
        ) : (
          <img 
            src={capturedImage} 
            alt="Captured" 
            className="w-full h-full object-contain"
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
      
      <div className="flex justify-between">
        {!capturedImage ? (
          <>
            <Button variant="outline" onClick={onCancel}>
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            
            {isCameraActive ? (
              <Button onClick={captureImage}>
                <Camera className="mr-2 h-4 w-4" /> Capture
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <label className="cursor-pointer">
                    <Image className="mr-2 h-4 w-4" /> Upload
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </Button>
                
                <Button onClick={startCamera}>
                  <Camera className="mr-2 h-4 w-4" /> Start Camera
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            <Button variant="outline" onClick={retakeImage}>
              <X className="mr-2 h-4 w-4" /> Retake
            </Button>
            <Button onClick={confirmImage}>
              <Check className="mr-2 h-4 w-4" /> Use Photo
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
