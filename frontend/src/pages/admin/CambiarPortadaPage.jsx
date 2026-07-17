import { useState, useRef } from 'react';
import { useGetHeroImageQuery, useUpdateHeroImageMutation } from '../../features/siteSettings/siteSettingsApi';
import toast from 'react-hot-toast';

const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
];

const IMAGE_MAX_MB = 20;
const VIDEO_MAX_MB = 100;
const VIDEO_RECOMMENDED_MB = 15;

const isAcceptedFile = (file) => ACCEPTED_TYPES.includes(file.type);
const isVideoFile = (file) => file.type.startsWith('video/');
const formatMb = (bytes) => (bytes / (1024 * 1024)).toFixed(1);

const CambiarPortadaPage = () => {
  const [preview, setPreview] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const { data, isLoading: isLoadingCurrent } = useGetHeroImageQuery();
  const [updateHeroImage, { isLoading: isUploading }] = useUpdateHeroImageMutation();

  const currentUrl = data?.data?.url;
  const currentType = data?.data?.type || (currentUrl ? 'image' : null);

  const clearSelection = () => {
    setSelectedFile(null);
    setPreview(null);
    setPreviewType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const applyFile = (file) => {
    if (!file) return;

    if (!isAcceptedFile(file)) {
      toast.error('Solo se permiten imágenes (JPG, PNG, WebP) o videos (MP4, WebM)');
      return;
    }

    const isVideo = isVideoFile(file);
    const maxMb = isVideo ? VIDEO_MAX_MB : IMAGE_MAX_MB;
    const sizeMb = file.size / (1024 * 1024);

    if (sizeMb > maxMb) {
      toast.error(
        isVideo
          ? `El video supera el máximo de ${VIDEO_MAX_MB}MB`
          : `La imagen supera el máximo de ${IMAGE_MAX_MB}MB`
      );
      return;
    }

    if (isVideo && sizeMb > VIDEO_RECOMMENDED_MB) {
      toast(
        `El video pesa ${formatMb(file.size)}MB. Ideal: menos de ${VIDEO_RECOMMENDED_MB}MB para una carga rápida.`,
        { icon: '⚠️', duration: 5000 }
      );
    }

    setSelectedFile(file);
    setPreviewType(isVideo ? 'video' : 'image');
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    applyFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    applyFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error('Selecciona una imagen o un video primero');
      return;
    }

    try {
      await updateHeroImage(selectedFile).unwrap();
      toast.success(
        isVideoFile(selectedFile)
          ? 'Video de portada actualizado correctamente'
          : 'Imagen de portada actualizada correctamente'
      );
      clearSelection();
    } catch (err) {
      const message =
        err?.data?.message ||
        err?.error ||
        (err?.status === 'FETCH_ERROR'
          ? 'No hubo respuesta del servidor (timeout o red). Probá un video más liviano (<15MB) o reintentá.'
          : 'Error al subir el archivo. Intenta de nuevo.');
      toast.error(message, { duration: 6000 });
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">Portada del inicio</h1>
      <p className="text-sm text-gray-500 mb-8">
        Imagen o video a pantalla completa en el hero de la página principal.
      </p>

      {/* Specs */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Imagen</h3>
          <ul className="text-xs text-gray-600 space-y-1.5">
            <li>
              <span className="font-medium text-gray-700">Formato:</span> JPG, PNG o WebP
            </li>
            <li>
              <span className="font-medium text-gray-700">Dimensión:</span> 1920×1080 px (16:9)
            </li>
            <li>
              <span className="font-medium text-gray-700">Peso:</span> máx. {IMAGE_MAX_MB}MB
            </li>
            <li className="text-gray-500 pt-1">
              Se comprime automáticamente al subir (mismo flujo que el resto del sitio).
            </li>
          </ul>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-2">Video</h3>
          <ul className="text-xs text-gray-600 space-y-1.5">
            <li>
              <span className="font-medium text-gray-700">Formato:</span> MP4 (H.264) o WebM
            </li>
            <li>
              <span className="font-medium text-gray-700">Dimensión:</span> 1920×1080 px (16:9)
            </li>
            <li>
              <span className="font-medium text-gray-700">Peso:</span> ideal &lt; {VIDEO_RECOMMENDED_MB}MB · máx. {VIDEO_MAX_MB}MB
            </li>
            <li className="text-gray-500 pt-1">
              Loop corto (10–30 s), sin audio necesario (se reproduce en silencio).
            </li>
          </ul>
        </div>
      </div>

      {/* Media actual */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-700">Portada actual</h2>
          {currentType && (
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {currentType === 'video' ? 'Video' : 'Imagen'}
            </span>
          )}
        </div>
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
          {isLoadingCurrent ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : currentUrl ? (
            currentType === 'video' ? (
              <video
                src={currentUrl}
                className="w-full h-full object-cover"
                muted
                loop
                playsInline
                autoPlay
                controls
              />
            ) : (
              <img
                src={currentUrl}
                alt="Portada actual"
                className="w-full h-full object-cover"
              />
            )
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
              Sin media configurada — se usa la imagen por defecto
            </div>
          )}
        </div>
      </div>

      {/* Upload zone */}
      <div className="mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Nuevo archivo</h2>
        <div
          className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
            onChange={handleFileChange}
            className="hidden"
          />
          {preview ? (
            <div className="relative w-full aspect-video rounded overflow-hidden">
              {previewType === 'video' ? (
                <video
                  src={preview}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  playsInline
                  autoPlay
                  controls
                />
              ) : (
                <img src={preview} alt="Vista previa" className="w-full h-full object-cover" />
              )}
              <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                Vista previa · {selectedFile ? `${formatMb(selectedFile.size)}MB` : ''} ·{' '}
                {previewType === 'video' ? 'Video' : 'Imagen'}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Haz clic o arrastra una imagen o un video aquí
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Imagen: 1920×1080 · máx. {IMAGE_MAX_MB}MB (compresión automática)
                </p>
                <p className="text-xs text-gray-400">
                  Video: MP4 1920×1080 · ideal &lt; {VIDEO_RECOMMENDED_MB}MB · máx. {VIDEO_MAX_MB}MB
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex gap-3 justify-end">
        {selectedFile && (
          <button
            onClick={clearSelection}
            disabled={isUploading}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={!selectedFile || isUploading}
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isUploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Subiendo...
            </>
          ) : (
            'Guardar portada'
          )}
        </button>
      </div>
    </div>
  );
};

export default CambiarPortadaPage;
