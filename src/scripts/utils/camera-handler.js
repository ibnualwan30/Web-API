// src/scripts/utils/camera-handler.js

const CameraHandler = {
    /**
     * Inisialisasi kamera
     * @param {HTMLVideoElement} videoElement - Element video untuk preview kamera
     * @returns {Promise<MediaStream|null>} - Stream kamera atau null jika gagal
     */
    async initCamera(videoElement) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment', // Gunakan kamera belakang jika tersedia
          },
          audio: false
        });
        
        videoElement.srcObject = stream;
        
        return stream;
      } catch (error) {
        console.error('Error accessing camera:', error);
        return null;
      }
    },
    
    /**
     * Mengambil foto dari stream kamera
     * @param {HTMLVideoElement} videoElement - Element video untuk preview kamera
     * @param {HTMLCanvasElement} canvasElement - Element canvas untuk mengambil foto
     * @returns {Promise<Blob|null>} - Blob foto atau null jika gagal
     */
    takePhoto(videoElement, canvasElement) {
      if (!videoElement || !canvasElement) return Promise.resolve(null);
      
      return new Promise((resolve) => {
        try {
          const context = canvasElement.getContext('2d');
          
          // Set ukuran canvas sesuai dengan video
          canvasElement.width = videoElement.videoWidth;
          canvasElement.height = videoElement.videoHeight;
          
          // Gambar frame dari video ke canvas
          context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
          
          // Konversi canvas ke blob
          canvasElement.toBlob((blob) => {
            resolve(blob);
          }, 'image/jpeg', 0.8);
        } catch (error) {
          console.error('Error taking photo:', error);
          resolve(null);
        }
      });
    },
    
    /**
     * Menghentikan stream kamera
     * @param {MediaStream} stream - Stream kamera yang akan dihentikan
     */
    stopCameraStream(stream) {
      if (!stream) return;
      
      try {
        stream.getTracks().forEach((track) => {
          track.stop();
        });
      } catch (error) {
        console.error('Error stopping camera stream:', error);
      }
    },
    
    /**
     * Setup event handler untuk menghentikan kamera ketika halaman berubah atau ditutup
     * @param {MediaStream} stream - Stream kamera yang akan dimonitor
     * @param {Function} stopCallback - Callback function untuk menghentikan kamera
     */
    setupCleanupHandlers(stream, stopCallback) {
      if (!stream || !stopCallback) return;
      
      // Menghentikan kamera ketika halaman berubah (misalnya navigasi ke halaman lain)
      window.addEventListener('hashchange', stopCallback);
      
      // Menghentikan kamera ketika halaman ditutup
      window.addEventListener('beforeunload', stopCallback);
      
      // Menghentikan kamera ketika tab disembunyikan
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          stopCallback();
        }
      });
    }
  };
  
  export default CameraHandler;