import { useState } from 'react';
import { X, ZoomIn } from 'lucide-react';
import { CertificatePhoto } from '@/types';

interface PhotoViewerProps {
  photos: CertificatePhoto[];
  initialIndex?: number;
  onClose: () => void;
}

export function PhotoViewer({ photos, initialIndex = 0, onClose }: PhotoViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);

  const current = photos[currentIndex];

  const goPrev = () => {
    setCurrentIndex((i) => (i - 1 + photos.length) % photos.length);
    setZoom(1);
  };

  const goNext = () => {
    setCurrentIndex((i) => (i + 1) % photos.length);
    setZoom(1);
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          goPrev();
        }}
        className="absolute left-4 md:left-8 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
      >
        ‹
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          goNext();
        }}
        className="absolute right-4 md:right-8 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
      >
        ›
      </button>

      <div
        className="relative max-w-5xl max-h-[85vh] w-full flex flex-col items-center gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative overflow-auto rounded-xl"
          style={{ maxHeight: '70vh' }}
        >
          <img
            src={current.data}
            alt={current.name}
            className="transition-transform duration-200 rounded-xl shadow-2xl"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
          />
        </div>

        <div className="flex items-center gap-4 bg-white/10 backdrop-blur rounded-full px-4 py-2">
          <button
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg"
          >
            −
          </button>
          <div className="flex items-center gap-2 text-white text-sm">
            <ZoomIn className="w-4 h-4" />
            <span className="font-mono w-14 text-center">{Math.round(zoom * 100)}%</span>
          </div>
          <button
            onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg"
          >
            +
          </button>
          <span className="w-px h-5 bg-white/20 mx-1" />
          <span className="text-white/80 text-sm">
            {currentIndex + 1} / {photos.length}
          </span>
        </div>
      </div>
    </div>
  );
}
