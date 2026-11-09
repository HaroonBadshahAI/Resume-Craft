import React, { useRef, useState } from 'react';
import { useResumeStore } from '../../lib/resume/store';
import { processUploadedPhoto } from '../../lib/resume/storage';
import {
  Camera,
  Trash2,
  Eye,
  EyeOff,
  ZoomIn,
  MoveHorizontal,
  MoveVertical,
  SlidersHorizontal,
} from 'lucide-react';

export const PhotoUploader: React.FC = () => {
  const personal = useResumeStore((s) => s.resume.personal);
  const photoSettings = useResumeStore((s) => s.resume.photoSettings);
  const updatePersonal = useResumeStore((s) => s.updatePersonal);
  const updatePhotoSettings = useResumeStore((s) => s.updatePhotoSettings);
  const removePhoto = useResumeStore((s) => s.removePhoto);
  const addToast = useResumeStore((s) => s.addToast);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPositionControls, setShowPositionControls] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      const dataUrl = await processUploadedPhoto(file);
      updatePersonal({ photo: dataUrl });
      updatePhotoSettings({ visible: true });
      addToast({
        type: 'success',
        title: 'Photo Uploaded',
        description: 'Your portrait is now active in the live resume preview and PDF.',
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not process the selected photo.';
      setErrorMessage(message);
      addToast({
        type: 'error',
        title: 'Upload Failed',
        description: message,
      });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Portrait Thumbnail Preview */}
          <div
            className="relative w-14 h-14 sm:w-16 sm:h-16 bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center text-slate-400"
            style={{
              borderRadius:
                photoSettings.shape === 'circle'
                  ? '9999px'
                  : photoSettings.shape === 'rounded'
                    ? '12px'
                    : '4px',
            }}
          >
            {personal.photo ? (
              <img
                src={personal.photo}
                alt="Uploaded profile preview"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                style={{
                  transform: `scale(${photoSettings.zoom || 1}) translate(${
                    photoSettings.offsetX || 0
                  }%, ${photoSettings.offsetY || 0}%)`,
                }}
              />
            ) : (
              <Camera className="w-6 h-6 text-slate-400" />
            )}
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
              <span className="text-sm font-semibold text-slate-900">Profile Portrait</span>
              <span className="text-xs text-slate-500">· JPG, PNG, WebP</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Automatically resized and compressed for fast local storage and crisp PDF output.
            </p>
          </div>
        </div>

        {/* Upload Button */}
        <div className="shrink-0">
          <input
            ref={fileInputRef}
            id="profile-photo-upload-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="sr-only"
            aria-label="Upload Profile Photo"
          />
          <button
            type="button"
            disabled={isProcessing}
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isProcessing ? 'Processing...' : personal.photo ? 'Change Photo' : 'Upload Photo'}
          </button>
        </div>
      </div>

      {errorMessage && (
        <p className="text-xs font-medium text-red-600" role="alert">
          {errorMessage}
        </p>
      )}

      {/* Photo Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80">
        <div className="flex flex-wrap items-center gap-2">
          {/* Show / Hide Toggle */}
          <button
            type="button"
            onClick={() => updatePhotoSettings({ visible: !photoSettings.visible })}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              photoSettings.visible
                ? 'bg-white text-slate-800 border border-slate-200'
                : 'bg-slate-200/70 text-slate-600'
            }`}
            aria-pressed={photoSettings.visible}
          >
            {photoSettings.visible ? (
              <>
                <Eye className="w-3.5 h-3.5 text-indigo-600" />
                <span>Photo Visible</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                <span>Photo Hidden</span>
              </>
            )}
          </button>

          {/* Shape Selector */}
          <div className="inline-flex items-center bg-slate-200/70 p-0.5 rounded-lg">
            {(['circle', 'rounded', 'square'] as const).map((shapeOption) => (
              <button
                key={shapeOption}
                type="button"
                onClick={() => updatePhotoSettings({ shape: shapeOption })}
                className={`px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  photoSettings.shape === shapeOption
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {shapeOption}
              </button>
            ))}
          </div>

          {personal.photo && (
            <button
              type="button"
              onClick={() => setShowPositionControls((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                showPositionControls
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Crop & Position</span>
            </button>
          )}
        </div>

        {personal.photo && (
          <button
            type="button"
            onClick={removePhoto}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove Photo</span>
          </button>
        )}
      </div>

      {/* Expandable Zoom & Pan Controls */}
      {personal.photo && showPositionControls && (
        <div className="pt-2 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-lg border border-slate-200/60">
          <label className="space-y-1 text-xs">
            <span className="flex items-center justify-between font-medium text-slate-700">
              <span className="inline-flex items-center gap-1">
                <ZoomIn className="w-3.5 h-3.5 text-slate-400" />
                Zoom
              </span>
              <span className="tabular-nums text-slate-500">
                {Math.round((photoSettings.zoom || 1) * 100)}%
              </span>
            </span>
            <input
              type="range"
              min="1"
              max="2.2"
              step="0.05"
              value={photoSettings.zoom || 1}
              onChange={(e) => updatePhotoSettings({ zoom: parseFloat(e.target.value) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </label>

          <label className="space-y-1 text-xs">
            <span className="flex items-center justify-between font-medium text-slate-700">
              <span className="inline-flex items-center gap-1">
                <MoveHorizontal className="w-3.5 h-3.5 text-slate-400" />
                Horizontal
              </span>
              <span className="tabular-nums text-slate-500">{photoSettings.offsetX || 0}%</span>
            </span>
            <input
              type="range"
              min="-35"
              max="35"
              step="1"
              value={photoSettings.offsetX || 0}
              onChange={(e) => updatePhotoSettings({ offsetX: parseInt(e.target.value, 10) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </label>

          <label className="space-y-1 text-xs">
            <span className="flex items-center justify-between font-medium text-slate-700">
              <span className="inline-flex items-center gap-1">
                <MoveVertical className="w-3.5 h-3.5 text-slate-400" />
                Vertical
              </span>
              <span className="tabular-nums text-slate-500">{photoSettings.offsetY || 0}%</span>
            </span>
            <input
              type="range"
              min="-35"
              max="35"
              step="1"
              value={photoSettings.offsetY || 0}
              onChange={(e) => updatePhotoSettings({ offsetY: parseInt(e.target.value, 10) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </label>
        </div>
      )}
    </div>
  );
};
