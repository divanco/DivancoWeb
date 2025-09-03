import { Link } from 'react-router-dom';
import { useGetFeaturedBlogPostsQuery, useGetRecentBlogPostsQuery } from '../../features/blog';
import { scrollToSection } from '../../utils/simpleScroll';
import { useTranslation } from '../../hooks/useTranslation';

const BlogSection = () => {
  const { t } = useTranslation();
  const { data: featuredResponse, isLoading: featuredLoading, error: featuredError } = useGetFeaturedBlogPostsQuery(1);
  const { data: recentResponse, isLoading: recentLoading, error: recentError } = useGetRecentBlogPostsQuery(1);
  
  // Usar posts destacados si existen, si no usar posts recientes
  const featuredPosts = featuredResponse?.data || [];
  const recentPosts = recentResponse?.data || [];
  const blogPosts = featuredPosts.length > 0 ? featuredPosts : recentPosts;
  
  const isLoading = featuredLoading || recentLoading;
  const error = featuredError || recentError;

  

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
    return `${months[date.getMonth()]}. ${date.getFullYear()}`;
  };

  const getImageUrl = (post) => {
    console.log('🖼️ [getImageUrl] Post:', post.title);
    console.log('🖼️ [getImageUrl] featuredImage:', post.featuredImage);
    
    // Si es un objeto Cloudinary con variantes
    if (post.featuredImage && typeof post.featuredImage === 'object') {
      const imageUrl = post.featuredImage.desktop?.url || 
                      post.featuredImage.mobile?.url || 
                      post.featuredImage.thumbnail?.url ||
                      post.featuredImage.url;
      
      console.log('🖼️ [getImageUrl] URL encontrada:', imageUrl);
      return imageUrl || '/images/blog/default-blog.jpg';
    }
    
    // Si es una URL directa (string)
    if (typeof post.featuredImage === 'string') {
      console.log('🖼️ [getImageUrl] URL directa:', post.featuredImage);
      return post.featuredImage;
    }
    
    console.log('🖼️ [getImageUrl] Usando imagen por defecto');
    return '/images/blog/default-blog.jpg';
  };

  // Debug: mostrar siempre algo para ver si el componente se renderiza
  if (isLoading) {
    console.log('⏳ [BlogSectionNew] Está cargando...');
    return (
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500">{t('blogSection.cargandoPosts')}</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    console.log('❌ [BlogSectionNew] Error:', error);
    return (
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-500">Error cargando posts del blog</p>
          </div>
        </div>
      </section>
    );
  }

  if (!blogPosts.length) {
    console.log('📭 [BlogSectionNew] No hay posts disponibles');
    return (
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-500">No hay posts del blog disponibles</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="blog-section" className="py-16 lg:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 lg:mb-16">
          <div>
            <h2 className="text-4xl lg:text-5xl font-light text-gray-900 mb-4">
              {t('blogSection.noticias')}
              <span className="block text-sm font-normal text-gray-500 mt-2 tracking-wider uppercase">
                — {t('blogSection.miraLasNovedades')}
              </span>
            </h2>
          </div>
          <div className="mt-6 md:mt-0">
            <Link
              to="/blog"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200 group"
            >
              {t('blogSection.verTodasLasNovedades')}
              <svg
                className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Blog Posts */}
        <div className="space-y-12 lg:space-y-16">
          {blogPosts.slice(0, 1).map((post, index) => (
            <article key={post.id} className="group">
              
              {/* ✅ MOBILE: Layout vertical (columnas) */}
              <div className="block lg:hidden">
                {/* Date */}
                <div className="mb-4">
                  <span className="text-xs font-medium text-gray-500 tracking-wider uppercase">
                    {formatDate(post.publishedAt)}
                  </span>
                </div>

                {/* Image */}
                <div className="relative mb-6 overflow-hidden bg-gray-100">
                  <div className="aspect-[4/3] bg-gray-200">
                    <img
                      src={getImageUrl(post)}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        if (!e.target.src.includes('data:image')) {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Y2EzYWYiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNHB4Ij5JbWFnZW4gbm8gZGlzcG9uaWJsZTwvdGV4dD4KPC9zdmc+';
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h3 className="text-xl font-light text-gray-900 leading-tight group-hover:text-gray-600 transition-colors duration-200">
                    <Link to={`/blog/${post.slug}`} className="block">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="pt-2">
                    <Link
                      to={`/blog/${post.slug}`}
                      className="inline-flex items-center text-xs text-gray-500 hover:text-gray-900 transition-colors duration-200 group/link"
                    >
                      <span className="border-b border-gray-300 group-hover/link:border-gray-900 transition-colors duration-200">
                        {t('common.readMore')}
                      </span>
                      <svg className="ml-1 w-3 h-3 transform group-hover/link:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>

              {/* ✅ DESKTOP: Layout horizontal (fecha | texto | imagen) */}
              <div className="hidden lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start">
                
                {/* Date Column - 2 columnas */}
                <div className="col-span-2">
                  <span className="text-xs font-medium text-gray-500 tracking-wider uppercase">
                    {formatDate(post.publishedAt)}
                  </span>
                </div>

                {/* Content Column - 6 columnas */}
                <div className="col-span-6 space-y-4">
                  <h3 className="text-2xl lg:text-3xl font-light text-gray-900 leading-tight group-hover:text-gray-600 transition-colors duration-200">
                    <Link to={`/blog/${post.slug}`} className="block">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="pt-2">
                    <Link
                      to={`/blog/${post.slug}`}
                      className="inline-flex items-center text-xs text-gray-500 hover:text-gray-900 transition-colors duration-200 group/link"
                    >
                      <span className="border-b border-gray-300 group-hover/link:border-gray-900 transition-colors duration-200">
                        {t('common.readMore')}
                      </span>
                      <svg className="ml-1 w-3 h-3 transform group-hover/link:translate-x-0.5 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </div>

                {/* Image Column - 4 columnas */}
                <div className="col-span-4">
                  <div className="relative overflow-hidden bg-gray-100">
                    <div className="aspect-[4/3] bg-gray-200">
                      <img
                        src={getImageUrl(post)}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          if (!e.target.src.includes('data:image')) {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5Y2EzYWYiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNHB4Ij5JbWFnZW4gbm8gZGlzcG9uaWJsZTwvdGV4dD4KPC9zdmc+';
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

              </div>
            </article>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 lg:mt-20 text-center">
          <Link
            to="/blog"
            className="inline-flex items-center px-8 py-3 border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
          >
            {t('blogSection.explorarTodoBlog')}
          </Link>
        </div>
      </div>

      {/* Flecha de navegación */}
      <button 
        onClick={() => scrollToSection('#showroom-section')}
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 cursor-pointer hover:scale-110 transition-transform duration-300"
        aria-label="Ver showroom"
      >
        <div className="w-px h-6 bg-gray-300 mx-auto mb-2"></div>
        <svg className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors duration-300 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>
    </section>
  );
};

export default BlogSection;
