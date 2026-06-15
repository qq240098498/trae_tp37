import { useRef, useState } from 'react';
import { Upload, X, Image, Loader2 } from 'lucide-react';
import { CertificatePhoto } from '@/types';
import { generateId, todayISO } from '@/utils/dateUtils';
import { processImageFile, formatFileSize } from '@/utils/imageUtils';

interface PhotoUploaderProps {
  photos: CertificatePhoto[];
  onChange: (photos: CertificatePhoto[]) => void;
  maxCount?: number;
}

export function PhotoUploader({ photos, onChange, maxCount = 5 }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const processed = await Promise.all(
        files.slice(0, maxCount - photos.length).map(async (file) => {
          const result = await processImageFile(file);
          if (!result) return null;
          return {
            id: generateId(),
            name: result.name,
            data: result.data,
            size: result.size,
            type: result.type,
            uploadedAt: todayISO(),
          } as CertificatePhoto;
        })
      );
      const valid = processed.filter(Boolean) as CertificatePhoto[];
      onChange([...photos, ...valid]);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removePhoto = (id: string) => {
    onChange(photos.filter((p) => p.id !== id));
  };

  const canAddMore = photos.length < maxCount;

  return (
    <div className="space-y-4">
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {photos.map((photo, idx) => (
            <div
              key={photo.id}
              className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 shadow-sm"
            >
              <img
                src={photo.data}
                alt={photo.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-end p-2">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity w-full">
                  <p className="text-white text-xs truncate">{photo.name}</p>
                  <p className="text-white/70 text-[10px]">{formatFileSize(photo.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removePhoto(photo.id)}
                className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110 shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/50 text-white text-[10px] font-medium">
                #{idx + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {canAddMore && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-gray-500 dark:text-gray-400 hover:border-cyan-400 hover:text-cyan-500 hover:bg-cyan-50/50 dark:hover:bg-cyan-500/5 transition-all group"
        >
          {uploading ? (
            <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-cyan-100 dark:group-hover:bg-cyan-500/20 transition-colors">
              <Upload className="w-7 h-7 group-hover:scale-110 transition-transform" />
            </div>
          )}
          <div className="text-center">
            <p className="font-medium">{uploading ? '正在处理图片...' : '点击上传证件照片/扫描件'}</p>
            <p className="text-xs mt-1 text-gray-400">
              支持 JPG/PNG 格式，可上传 {maxCount} 张，已上传 {photos.length}/{maxCount}
            </p>
          </div>
          <Image className="w-5 h-5 opacity-50" />
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
