import { baseApi } from '../../services/api.js';

/**
 * brandingApi — Multi-tenant / Multi-plataforma
 *
 * Jerarquía: tenant → businessUnit → branding assets
 *
 * Cada BU tiene sus propios assets en Cloudinary con public_id FIJO:
 *   Logo:    tenants/{tenant}/{businessUnit}/branding/logo
 *   Favicon: tenants/{tenant}/{businessUnit}/branding/favicon
 *   Banner:  tenants/{tenant}/{businessUnit}/branding/banner
 *
 * La URL de cada asset es FIJA (overwrite: true en Cloudinary),
 * por lo que no hay que gestionar cache-busting.
 */
export const brandingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // ── Consultas públicas ──────────────────────────────────────────────────

    // Detectar branding por dominio actual (multi-plataforma)
    getBrandingByDomain: builder.query({
      query: () => '/branding/by-domain',
      providesTags: (result) =>
        result?.data ? [{ type: 'Branding', id: `${result.data.tenant}/${result.data.businessUnit}` }] : ['Branding'],
    }),

    // Listar todas las BUs activas de un tenant
    getBrandingsByTenant: builder.query({
      query: (tenant) => `/branding/${tenant}`,
      providesTags: (result, error, tenant) => [{ type: 'Branding', id: `tenant:${tenant}` }],
    }),

    // Obtener branding de una BU específica
    getBranding: builder.query({
      query: ({ tenant, businessUnit }) => `/branding/${tenant}/${businessUnit}`,
      providesTags: (result, error, { tenant, businessUnit }) => [
        { type: 'Branding', id: `${tenant}/${businessUnit}` },
      ],
    }),

    // ── Consultas admin ─────────────────────────────────────────────────────

    // Listar todos los brandings (todos los tenants)
    getAllBrandings: builder.query({
      query: () => '/branding',
      providesTags: ['Branding'],
    }),

    // ── Mutaciones admin ────────────────────────────────────────────────────

    // Crear nueva BU dentro de un tenant
    createBranding: builder.mutation({
      query: ({ tenant, ...data }) => ({
        url: `/branding/${tenant}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { tenant }) => [
        { type: 'Branding', id: `tenant:${tenant}` },
        'Branding',
      ],
    }),

    // Actualizar datos de texto/colores de una BU
    updateBranding: builder.mutation({
      query: ({ tenant, businessUnit, ...data }) => ({
        url: `/branding/${tenant}/${businessUnit}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { tenant, businessUnit }) => [
        { type: 'Branding', id: `${tenant}/${businessUnit}` },
      ],
    }),

    // Subir logo → Cloudinary: tenants/{tenant}/{businessUnit}/branding/logo
    uploadLogo: builder.mutation({
      query: ({ tenant, businessUnit, file }) => {
        const formData = new FormData();
        formData.append('logo', file);
        return {
          url: `/branding/${tenant}/${businessUnit}/logo`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: (result, error, { tenant, businessUnit }) => [
        { type: 'Branding', id: `${tenant}/${businessUnit}` },
      ],
    }),

    // Subir favicon → Cloudinary: tenants/{tenant}/{businessUnit}/branding/favicon
    uploadFavicon: builder.mutation({
      query: ({ tenant, businessUnit, file }) => {
        const formData = new FormData();
        formData.append('favicon', file);
        return {
          url: `/branding/${tenant}/${businessUnit}/favicon`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: (result, error, { tenant, businessUnit }) => [
        { type: 'Branding', id: `${tenant}/${businessUnit}` },
      ],
    }),

    // Subir banner → Cloudinary: tenants/{tenant}/{businessUnit}/branding/banner
    uploadBanner: builder.mutation({
      query: ({ tenant, businessUnit, file }) => {
        const formData = new FormData();
        formData.append('banner', file);
        return {
          url: `/branding/${tenant}/${businessUnit}/banner`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: (result, error, { tenant, businessUnit }) => [
        { type: 'Branding', id: `${tenant}/${businessUnit}` },
      ],
    }),

    // Eliminar BU y sus assets de Cloudinary
    deleteBranding: builder.mutation({
      query: ({ tenant, businessUnit }) => ({
        url: `/branding/${tenant}/${businessUnit}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { tenant }) => [
        { type: 'Branding', id: `tenant:${tenant}` },
        'Branding',
      ],
    }),
  }),
});

export const {
  useGetBrandingByDomainQuery,
  useGetBrandingsByTenantQuery,
  useGetBrandingQuery,
  useGetAllBrandingsQuery,
  useCreateBrandingMutation,
  useUpdateBrandingMutation,
  useUploadLogoMutation,
  useUploadFaviconMutation,
  useUploadBannerMutation,
  useDeleteBrandingMutation,
} = brandingApi;
