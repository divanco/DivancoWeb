import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGetProjectsByYearQuery } from '../../../features/projects/projectsApi';
import { scrollToSection } from '../../../utils/simpleScroll';

function EdicionesPage() {
  const [currentImage, setCurrentImage] = useState(0);
  const currentYear = 2025; // Cambiar esto para mostrar diferentes años

  // ✅ Obtener proyectos del año actual desde la API
  const { data: projectsData, isLoading, error } = useGetProjectsByYearQuery(currentYear);
  
  // ✅ Procesar proyectos para crear el slideshow
  const projects = projectsData?.data?.projects || [];
  
  // ✅ Crear array de imágenes desde los proyectos reales
  const images = projects.length > 0 
    ? projects.map((project, index) => {
        // Buscar imagen principal o primera imagen disponible
        const mainImage = project.media?.find(img => img.isMain) || project.media?.[0];
        
        return {
          id: project.id,
          src: mainImage?.urls?.desktop || mainImage?.urls?.main || "/images/prueba/hero.png",
          alt: `${project.title} - Edición ${currentYear}`,
          project: project // ✅ Incluir datos del proyecto
        };
      })
    : [
        // ✅ Fallback si no hay proyectos
        {
          id: 1,
          src: "/images/prueba/edicion1.png",
          alt: `Edición Living ${currentYear}`,
          project: null
        },
        {
          id: 2,
          src: "/images/prueba/edicion2.png", 
          alt: `Edición Modelo ${currentYear}`,
          project: null
        },
        {
          id: 3,
          src: "/images/prueba/edicion3.png",
          alt: `Edición Piscina ${currentYear}`,
          project: null
        },
        {
          id: 4,
          src: "/images/prueba/hero.png",
          alt: `Edición Hero ${currentYear}`,
          project: null
        }
      ];

  // Auto-cambio de imágenes cada 4 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section id="ediciones-section" className="relative h-screen bg-gray-50 overflow-hidden">
      {/* Container de imágenes */}
      <div className="absolute inset-0">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentImage ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'%3E%3Crect width='1200' height='800' fill='%23f5f5f5'/%3E%3Ctext x='600' y='400' text-anchor='middle' fill='%23999' font-size='32' font-family='Arial'%3EEdiciones 2025%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>
        ))}
        
        {/* Overlay sutil */}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Loading state */}
          {isLoading && (
            <div className="text-white/80 text-lg">
              Cargando proyectos de la edición {currentYear}...
            </div>
          )}

          {/* Error state */}
          {error && !isLoading && (
            <div className="text-red-400 text-lg">
              Error cargando proyectos de la edición {currentYear}
            </div>
          )}

          {/* Content when loaded */}
          {!isLoading && !error && (
            <>
              {/* Título principal clickeable */}
              <Link 
                to="/ediciones"
                className="group inline-block"
              >
                <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light tracking-wider text-white mb-4 hover:text-white/90 transition-all duration-500 group-hover:scale-105">
                  EDICION {currentYear}
                </h2>
              </Link>

              {/* ✅ Información mínima y elegante del proyecto actual */}
              {images[currentImage]?.project && (
                <div className="mt-6 space-y-2">
                  <h3 className="text-xl sm:text-2xl text-white font-light">
                    {images[currentImage].project.title}
                  </h3>
                  <div className="flex justify-center space-x-4 text-xs sm:text-sm text-white/60">
                    {images[currentImage].project.location && (
                      <span>{images[currentImage].project.location}</span>
                    )}
                    {images[currentImage].project.projectType && (
                      <span>• {images[currentImage].project.projectType}</span>
                    )}
                  </div>
                </div>
              )}

              {/* Subtítulo general o información de proyecto */}
              {!images[currentImage]?.project && (
                <p className="mt-8 text-base sm:text-lg text-white/70 font-light max-w-md mx-auto leading-relaxed">
                  Descubre nuestra nueva colección de espacios únicos
                </p>
              )}

              {/* Contador de proyectos */}
              {projects.length > 0 && (
                <p className="mt-4 text-white/60 text-sm">
                  {projects.length} proyecto{projects.length !== 1 ? 's' : ''} en la edición {currentYear}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* ✅ Controles de navegación y call-to-action (solo si no está cargando) */}
      {!isLoading && (
        <>
          {/* Indicador de navegación */}
          <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 flex justify-center space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentImage 
                    ? 'bg-white w-8' 
                    : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

          {/* Call to action sutil */}
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
            {images[currentImage]?.project ? (
              <Link 
                to={`/proyectos/${images[currentImage].project.slug}`}
                className="inline-flex items-center text-white/80 hover:text-white text-sm font-light uppercase tracking-widest transition-colors duration-300 group"
              >
                Ver detalles
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            ) : (
              <Link 
                to="/proyectos"
                className="inline-flex items-center text-white/80 hover:text-white text-sm font-light uppercase tracking-widest transition-colors duration-300 group"
              >
                Ver todos los proyectos
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            )}
          </div>
        </>
      )}

      {/* Elementos decorativos */}
      <div className="absolute top-8 left-8 w-px h-16 bg-white/20"></div>
      <div className="absolute bottom-8 right-8 w-px h-16 bg-white/20"></div>
      <div className="absolute top-16 right-16 w-1 h-1 bg-white/30 rounded-full"></div>
      <div className="absolute bottom-16 left-16 w-1 h-1 bg-white/30 rounded-full"></div>

      {/* Contador elegante */}
      <div className="absolute top-8 right-8 text-white/60 font-light text-lg">
        {!isLoading && (
          <>
            <span className="text-white">{(currentImage + 1).toString().padStart(2, '0')}</span>
            <span className="mx-2">—</span>
            <span>{images.length.toString().padStart(2, '0')}</span>
            {projects.length > 0 && (
              <div className="text-xs mt-1 text-white/40">
                Edición {currentYear}
              </div>
            )}
          </>
        )}
      </div>

      {/* Flecha de navegación - Volver al inicio */}
      <button 
        onClick={() => {
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }}
        className="absolute bottom-6 left-1/2 transform -translate-x-1/2 cursor-pointer hover:scale-110 transition-transform duration-300"
        aria-label="Volver al inicio"
      >
        <div className="w-px h-6 bg-white/50 mx-auto mb-2"></div>
        <svg className="w-4 h-4 text-white/70 hover:text-white transition-colors duration-300 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </section>
  );
}

export default EdicionesPage;