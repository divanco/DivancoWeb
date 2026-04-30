import { useState, useCallback } from 'react';
import {
  useGetBrandingByDomainQuery,
  useGetBrandingQuery,
  useUploadLogoMutation,
  useUploadFaviconMutation,
  useUploadBannerMutation,
  useUpdateBrandingMutation,
} from '../features/branding/brandingApi.js';

/**
 * useBranding — Hook para gestionar el branding de una unidad de negocio.
 *
 * Cloudinary folder por tenant/BU (equivalente a Azure Blob container):
 *   Logo:    tenants/{tenant}/{businessUnit}/branding/logo    ← URL fija, overwrite: true
 *   Favicon: tenants/{tenant}/{businessUnit}/branding/favicon
 *   Banner:  tenants/{tenant}/{businessUnit}/branding/banner
 *
 * Uso:
 *   // Branding específico de una BU:
 *   const { branding, uploadLogo, isUploading } = useBranding({ tenant: 'grupo-divanco', businessUnit: 'divanco-arquitectura' });
 *
 *   // Detectar automáticamente por dominio (multi-plataforma):
 *   const { branding } = useBranding();
 */
export const useBranding = ({ tenant = null, businessUnit = null } = {}) => {
  const [uploadProgress, setUploadProgress] = useState({});

  // Si no se especifican tenant/businessUnit, detectar por dominio
  const domainQuery = useGetBrandingByDomainQuery(undefined, { skip: !!(tenant && businessUnit) });
  const unitQuery = useGetBrandingQuery(
    { tenant, businessUnit },
    { skip: !tenant || !businessUnit }
  );

  const activeQuery = (tenant && businessUnit) ? unitQuery : domainQuery;
  const branding = activeQuery.data?.data ?? null;
  const isLoading = activeQuery.isLoading;
  const error = activeQuery.error;

  // Mutaciones
  const [uploadLogoMutation, { isLoading: isUploadingLogo }] = useUploadLogoMutation();
  const [uploadFaviconMutation, { isLoading: isUploadingFavicon }] = useUploadFaviconMutation();
  const [uploadBannerMutation, { isLoading: isUploadingBanner }] = useUploadBannerMutation();
  const [updateBrandingMutation, { isLoading: isUpdating }] = useUpdateBrandingMutation();

  const isUploading = isUploadingLogo || isUploadingFavicon || isUploadingBanner;

  /**
   * Sube el logo al Cloudinary folder de la BU.
   * public_id fijo: tenants/{tenant}/{businessUnit}/branding/logo
   * La URL nunca cambia al reemplazar la imagen.
   */
  const uploadLogo = useCallback(async (file, t = tenant, bu = businessUnit) => {
    if (!t || !bu) throw new Error('tenant y businessUnit son requeridos para subir el logo');
    setUploadProgress((p) => ({ ...p, logo: 'uploading' }));
    try {
      const result = await uploadLogoMutation({ tenant: t, businessUnit: bu, file }).unwrap();
      setUploadProgress((p) => ({ ...p, logo: 'done' }));
      return result.data;
    } catch (err) {
      setUploadProgress((p) => ({ ...p, logo: 'error' }));
      throw err;
    }
  }, [tenant, businessUnit, uploadLogoMutation]);

  /**
   * Sube el favicon al Cloudinary folder de la BU.
   * public_id fijo: tenants/{tenant}/{businessUnit}/branding/favicon
   */
  const uploadFavicon = useCallback(async (file, t = tenant, bu = businessUnit) => {
    if (!t || !bu) throw new Error('tenant y businessUnit son requeridos para subir el favicon');
    setUploadProgress((p) => ({ ...p, favicon: 'uploading' }));
    try {
      const result = await uploadFaviconMutation({ tenant: t, businessUnit: bu, file }).unwrap();
      setUploadProgress((p) => ({ ...p, favicon: 'done' }));
      return result.data;
    } catch (err) {
      setUploadProgress((p) => ({ ...p, favicon: 'error' }));
      throw err;
    }
  }, [tenant, businessUnit, uploadFaviconMutation]);

  /**
   * Sube el banner al Cloudinary folder de la BU.
   * public_id fijo: tenants/{tenant}/{businessUnit}/branding/banner
   */
  const uploadBanner = useCallback(async (file, t = tenant, bu = businessUnit) => {
    if (!t || !bu) throw new Error('tenant y businessUnit son requeridos para subir el banner');
    setUploadProgress((p) => ({ ...p, banner: 'uploading' }));
    try {
      const result = await uploadBannerMutation({ tenant: t, businessUnit: bu, file }).unwrap();
      setUploadProgress((p) => ({ ...p, banner: 'done' }));
      return result.data;
    } catch (err) {
      setUploadProgress((p) => ({ ...p, banner: 'error' }));
      throw err;
    }
  }, [tenant, businessUnit, uploadBannerMutation]);

  /**
   * Actualiza colores, tipografía y metadatos del branding.
   */
  const updateBranding = useCallback(async (data, t = tenant, bu = businessUnit) => {
    if (!t || !bu) throw new Error('tenant y businessUnit son requeridos');
    return updateBrandingMutation({ tenant: t, businessUnit: bu, ...data }).unwrap();
  }, [tenant, businessUnit, updateBrandingMutation]);

  return {
    branding,
    isLoading,
    error,

    // Assets — URLs fijas de Cloudinary
    logoUrl: branding?.logoUrl ?? null,
    faviconUrl: branding?.faviconUrl ?? null,
    bannerUrl: branding?.bannerUrl ?? null,

    // Colores del tenant
    colors: {
      primary: branding?.primaryColor ?? '#000000',
      secondary: branding?.secondaryColor ?? '#ffffff',
      accent: branding?.accentColor ?? '#ff6b35',
    },

    // Acciones de subida
    uploadLogo,
    uploadFavicon,
    uploadBanner,
    updateBranding,

    // Estados de carga
    isUploading,
    isUpdating,
    uploadProgress,
  };
};
