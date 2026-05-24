function generateVideoThumbnail(videoFile) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    video.preload = 'metadata';
    video.crossOrigin = 'anonymous';

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(1, video.duration / 2);
    };

    video.onseeked = () => {
      canvas.width = 256;
      canvas.height = 256 * video.videoHeight / video.videoWidth;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const thumbnail = canvas.toDataURL('image/png');
      resolve(thumbnail);
    };

    video.onerror = reject;

    video.src = typeof videoFile === 'string' ? videoFile : URL.createObjectURL(videoFile);
  });
}

export default class TemporaryVideoThumbnailManager {
  keyOf(roomId, fileName, size) {
    return `${roomId}/${fileName}/${size || 'default'}`
  }

  async addThumbnailOfVideoUrl(roomId, url) {
    try {
      const thumbnail = await generateVideoThumbnail(url);
      if (!thumbnail || thumbnail === null) return;
      localStorage.setItem(this.keyOf(roomId, url, 'default'), thumbnail);
    } catch (error) {
      console.error(error);
    }
  }

  async addThumbnailOfVideoFile(roomId, file) {
    try {
      const thumbnail = await generateVideoThumbnail(file);
      if (!thumbnail || thumbnail === null) return;
      localStorage.setItem(this.keyOf(roomId, file.name, file.size), thumbnail);
    } catch (error) {
      console.error(error);
    }
  }

  getThumbnail(roomId, name, size = 'default') {
    return localStorage.getItem(this.keyOf(roomId, name, size)) || ''
  }

  removeThumbnail(roomId, name, size = 'default') {
    localStorage.removeItem(this.keyOf(roomId, name, size))
  }
}