import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Plus, 
  Calendar, 
  Tag, 
  Maximize2, 
  X, 
  Upload, 
  Image as ImageIcon,
  CheckCircle2,
  MapPin
} from 'lucide-react';
import type { ProjectImage } from '../../types';

interface ProjectImageGalleryProps {
  images: ProjectImage[];
  projectLatitude?: number;
  projectLongitude?: number;
  projectName?: string;
  onAddImage?: (newImage: ProjectImage) => void;
  canUpload?: boolean;
}

export const ProjectImageGallery: React.FC<ProjectImageGalleryProps> = ({
  images,
  projectLatitude,
  projectLongitude,
  projectName,
  onAddImage,
  canUpload = true
}) => {
  const [selectedImage, setSelectedImage] = useState<ProjectImage | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Upload Form State
  const [caption, setCaption] = useState('');
  const [dateCaptured, setDateCaptured] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [source, setSource] = useState<'Official Site' | 'Field Verified' | 'Satellite View' | 'Geo-tagged Drone' | 'Milestone Proof'>('Field Verified');
  const [imageUrl, setImageUrl] = useState('');
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Source style helpers
  const getSourceBadgeStyle = (src?: string) => {
    switch (src) {
      case 'Official Site':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Field Verified':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Satellite View':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Geo-tagged Drone':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Milestone Proof':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Sample curated realistic infrastructure fallback photos
  const samplePhotoPresets = [
    {
      label: 'Site Construction Viaduct',
      url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&q=80&w=1200',
      caption: 'Main corridor superstructure and pier cap inspection'
    },
    {
      label: 'Earthwork & Foundation',
      url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=1200',
      caption: 'Heavy foundation civil works and reinforcement installation'
    },
    {
      label: 'Aerial Drone Survey',
      url: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=1200',
      caption: 'Geo-tagged drone aerial survey across project boundary'
    },
    {
      label: 'Water / Plant Facility',
      url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=1200',
      caption: 'Pumping and hydraulic system installation verification'
    }
  ];

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    setFormError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPreviewDataUrl(result);
      setImageUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handlePresetSelect = (preset: typeof samplePhotoPresets[0]) => {
    setImageUrl(preset.url);
    setPreviewDataUrl(preset.url);
    if (!caption) {
      setCaption(preset.caption);
    }
    setFormError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = previewDataUrl || imageUrl.trim();

    if (!finalUrl) {
      setFormError('Please upload an image or provide a valid image URL.');
      return;
    }

    if (!caption.trim()) {
      setFormError('Please enter a photo caption.');
      return;
    }

    // Format date nicely
    const dateObj = new Date(dateCaptured);
    const formattedDate = !isNaN(dateObj.getTime())
      ? dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      : dateCaptured;

    const newPhoto: ProjectImage = {
      id: `img-${Date.now()}`,
      url: finalUrl,
      caption: caption.trim(),
      date: formattedDate,
      dateCaptured: formattedDate,
      source: source,
      stage: source === 'Field Verified' ? 'Field Site Verification' : 'Site Inspection Progress',
      uploadedBy: 'Officer In-Charge',
      lat: projectLatitude,
      lng: projectLongitude,
      isGeotagVerified: source === 'Field Verified' || source === 'Geo-tagged Drone',
      verificationStatus: 'Verified'
    };

    if (onAddImage) {
      onAddImage(newPhoto);
    }

    // Reset Form
    setIsUploadModalOpen(false);
    setCaption('');
    setImageUrl('');
    setPreviewDataUrl(null);
    setFormError(null);
  };

  return (
    <div id="project-images-section" className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center">
            <Camera size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Project Images & Site Verification Gallery</h2>
            <p className="text-xs text-slate-500">
              {images.length} verified photo{images.length !== 1 ? 's' : ''} on record with timestamped site audits
            </p>
          </div>
        </div>

        {/* Upload Button */}
        {canUpload && (
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-2 transition cursor-pointer"
          >
            <Plus size={15} />
            <span>Upload Project Photo</span>
          </button>
        )}
      </div>

      {/* Gallery Grid (3-4 photos per row) */}
      {images.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <ImageIcon size={24} />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Project Photos Available</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            No inspection or site progress photographs have been uploaded for this project yet. Use the upload button above to submit field photos.
          </p>
          {canUpload && (
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="mt-4 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg inline-flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Upload size={14} />
              <span>Upload First Photo</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, index) => {
            const displayDate = img.dateCaptured || img.date || 'Recent';
            const displaySource = img.source || (img.imageType ? String(img.imageType) : 'Official Site');

            return (
              <div
                key={img.id || `img-${index}`}
                onClick={() => setSelectedImage(img)}
                className="group bg-white rounded-xl border border-slate-200/70 shadow-xs hover:shadow-md transition duration-200 overflow-hidden cursor-pointer flex flex-col justify-between"
              >
                {/* Photo Thumbnail */}
                <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={img.url}
                    alt={img.caption}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      // Fallback image if broken
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&q=80&w=800';
                    }}
                  />

                  {/* Top Overlay: Source Badge */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border backdrop-blur-xs shadow-2xs ${getSourceBadgeStyle(displaySource)}`}>
                      {displaySource}
                    </span>
                  </div>

                  {/* Top Right: Zoom Icon */}
                  <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition duration-200 z-10">
                    <div className="w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-xs shadow-xs">
                      <Maximize2 size={13} />
                    </div>
                  </div>

                  {/* Geotag Indicator if verified */}
                  {img.isGeotagVerified && (
                    <div className="absolute bottom-2 left-2 z-10">
                      <span className="px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-medium flex items-center gap-1 backdrop-blur-xs">
                        <MapPin size={10} className="text-emerald-400" />
                        <span>GPS Verified</span>
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Body: Caption, Date Captured & Source */}
                <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                  {/* Photo Caption */}
                  <p className="text-xs font-semibold text-slate-800 line-clamp-2 leading-relaxed" title={img.caption}>
                    {img.caption}
                  </p>

                  {/* Metadata Footer */}
                  <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    {/* Date Captured */}
                    <span className="flex items-center gap-1 text-slate-600 font-medium">
                      <Calendar size={12} className="text-slate-400" />
                      <span>{displayDate}</span>
                    </span>

                    {/* Source Tag */}
                    <span className="flex items-center gap-1 text-slate-500 text-[10px]">
                      <Tag size={11} className="text-slate-400" />
                      <span className="truncate max-w-[100px]">{displaySource}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getSourceBadgeStyle(selectedImage.source || String(selectedImage.imageType))}`}>
                  {selectedImage.source || String(selectedImage.imageType) || 'Official Site'}
                </span>
                <span className="text-xs text-slate-500">
                  Captured: <strong className="text-slate-700">{selectedImage.dateCaptured || selectedImage.date}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Image Display */}
            <div className="relative bg-slate-950 flex items-center justify-center overflow-hidden max-h-[60vh]">
              <img
                src={selectedImage.url}
                alt={selectedImage.caption}
                className="max-h-[60vh] w-auto max-w-full object-contain"
              />
            </div>

            {/* Modal Details Footer */}
            <div className="p-4 space-y-2 bg-white">
              <h4 className="text-sm font-bold text-slate-900">{selectedImage.caption}</h4>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                {selectedImage.uploadedBy && (
                  <span>Uploaded by: <strong className="text-slate-700">{selectedImage.uploadedBy}</strong></span>
                )}
                {selectedImage.stage && (
                  <span>• Stage: <strong className="text-slate-700">{selectedImage.stage}</strong></span>
                )}
                {selectedImage.lat && selectedImage.lng && (
                  <span>• Coordinates: <strong className="font-mono text-slate-700">{selectedImage.lat.toFixed(4)}° N, {selectedImage.lng.toFixed(4)}° E</strong></span>
                )}
              </div>
              {selectedImage.notes && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 mt-2">
                  <strong>Notes:</strong> {selectedImage.notes}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Admin/Officer Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in duration-150">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
                  <Upload size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Upload Project Photograph</h3>
                  <p className="text-[11px] text-slate-500">
                    Add new site inspection photo to {projectName || 'project'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {formError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                  {formError}
                </div>
              )}

              {/* Photo Source Selector: File Upload vs URL vs Presets */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Select Photo <span className="text-rose-500">*</span>
                </label>

                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2 px-3 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Upload size={14} />
                    <span>Choose File from Device</span>
                  </button>
                </div>

                <div className="text-center text-[10px] text-slate-400 font-medium my-1">OR PASTE IMAGE URL</div>

                <input
                  type="url"
                  placeholder="https://images.example.com/site-photo.jpg"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setPreviewDataUrl(e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />

                {/* Sample Presets for Fast Testing */}
                <div className="pt-1">
                  <span className="text-[10px] text-slate-500 font-medium">Quick Presets:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {samplePhotoPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handlePresetSelect(preset)}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 border border-slate-200 transition cursor-pointer"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Preview Box */}
                {previewDataUrl && (
                  <div className="mt-2 relative w-full h-32 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
                    <img
                      src={previewDataUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={() => {
                        setFormError('Failed to load image preview. Please check the URL.');
                      }}
                    />
                    <div className="absolute top-1.5 right-1.5 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 size={10} className="text-emerald-400" />
                      <span>Ready</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Photo Caption */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">
                  Photo Caption <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pier cap reinforcement bar binding at chainage 14+200"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Date Captured & Source row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Date Captured <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={dateCaptured}
                    onChange={(e) => setDateCaptured(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Image Source <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="Field Verified">Field Verified</option>
                    <option value="Official Site">Official Site</option>
                    <option value="Satellite View">Satellite View</option>
                    <option value="Geo-tagged Drone">Geo-tagged Drone</option>
                    <option value="Milestone Proof">Milestone Proof</option>
                  </select>
                </div>
              </div>

              {/* Geotag info indicator */}
              {projectLatitude && projectLongitude && (
                <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg text-[11px] text-slate-600 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-blue-600" />
                    <span>Auto-Geotagged to Site:</span>
                  </span>
                  <span className="font-mono font-semibold text-slate-800">
                    {projectLatitude.toFixed(4)}° N, {projectLongitude.toFixed(4)}° E
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Upload size={14} />
                  <span>Upload & Publish Photo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
