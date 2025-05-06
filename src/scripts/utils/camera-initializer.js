const CameraInitializer = {
    async init({ videoElement, errorCallback }) {
      let stream = null;
      
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
          },
        });
        
        videoElement.srcObject = stream;
        videoElement.onloadedmetadata = () => {
          videoElement.play();
        };
        
        return stream;
      } catch (error) {
        console.error('Error accessing camera:', error);
        if (errorCallback) errorCallback(error);
        return null;
      }
    },
    
    takePhoto(videoElement, canvasElement) {
      const context = canvasElement.getContext('2d');
      
      // Set canvas dimensions to match video
      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;
      
      // Draw current video frame to canvas
      context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
      
      // Convert canvas to blob for form upload
      return new Promise((resolve) => {
        canvasElement.toBlob((blob) => {
          resolve(blob);
        }, 'image/jpeg', 0.8);
      });
    },
    
    stopStream(stream) {
      if (!stream) return;
      
      stream.getTracks().forEach((track) => {
        track.stop();
      });
    }
  };
  
  export default CameraInitializer;