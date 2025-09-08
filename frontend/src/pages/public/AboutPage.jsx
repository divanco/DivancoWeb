
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from '../../hooks';

const AboutPage = () => {
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t('aboutPage.title')}</title>
        <meta name="description" content={t('aboutPage.metaDescription')} />
      </Helmet>

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center">
          {/* Background Pattern - Subtle grid */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px'
            }}></div>
          </div>

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Small title */}
            <div className="mb-12">
              <span className="text-xs font-medium text-gray-500 tracking-wider uppercase">
                — {t('aboutPage.sectionTitle')}
              </span>
            </div>

            {/* Main content */}
            <div className="space-y-8">
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-light text-gray-900 leading-tight">
                {t('aboutPage.heroTitle')}{' '}
                <span className="italic text-gray-600">{t('aboutPage.heroTitleHighlight')}</span>
                <br />
                {t('aboutPage.heroTitleEnd')}
              </h1>

              <div className="max-w-3xl mx-auto">
                <p className="text-lg lg:text-xl text-gray-600 leading-relaxed font-light">
                  {t('aboutPage.heroDescription')}
                </p>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="w-px h-12 bg-gray-300 mx-auto mb-2"></div>
            <svg className="w-4 h-4 text-gray-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-24 lg:py-32">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              
              {/* Left Column - Quote */}
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="w-16 h-px bg-gray-300"></div>
                  <blockquote className="text-2xl lg:text-3xl font-light text-gray-900 leading-relaxed">
                    "{t('aboutPage.quote')}"
                  </blockquote>
                </div>
              </div>

              {/* Right Column - Philosophy */}
              <div className="space-y-8">
                <div className="space-y-6">
                  <h2 className="text-xl font-medium text-gray-900">
                    {t('aboutPage.philosophyTitle')}
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    {t('aboutPage.philosophyText1')}
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    {t('aboutPage.philosophyText2')}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-24 lg:py-32 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
              
              <div className="text-center space-y-4">
                <div className="w-12 h-12 mx-auto bg-gray-900 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">{t('aboutPage.values.innovation.title')}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {t('aboutPage.values.innovation.description')}
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-12 h-12 mx-auto bg-gray-900 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">{t('aboutPage.values.exclusivity.title')}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {t('aboutPage.values.exclusivity.description')}
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-12 h-12 mx-auto bg-gray-900 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">{t('aboutPage.values.harmony.title')}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {t('aboutPage.values.harmony.description')}
                </p>
              </div>

            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutPage;
