import { Link } from 'react-router-dom';
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon
} from '@heroicons/react/24/outline';

import Newsletter from './Newsletter'; 
import MapLocation from '../../ui/MapLocation';
import { useTranslation } from '../../../hooks';


const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center mb-4">
              <img 
                src="/images/logoblanco.png" 
                alt="Divanco Logo" 
                className="h-16 w-auto"
              />
              <span className="ml-2 text-xl font-bold">Divanco</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              {t('footer.companyDescription')}
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center">
                <MapPinIcon className="h-5 w-5 text-primary-400 mr-3" />
                <span className="text-gray-300">
                  Cl. 9 #5 60, Restrepo, Meta, Colombia
                </span>
              </div>
              <div className="flex items-center">
                <PhoneIcon className="h-5 w-5 text-primary-400 mr-3" />
                <span className="text-gray-300">+57 320 8021225</span>
              </div>
              <div className="flex items-center">
                <EnvelopeIcon className="h-5 w-5 text-primary-400 mr-3" />
                <span className="text-gray-300">info@divanco.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{t('footer.links')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/showroom" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.showroom')}
                </Link>
              </li>
              <li>
                <Link to="/proyectos" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.projects')}
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.blog')}
                </Link>
              </li>
              <li>
                <Link to="/nosotros" className="text-gray-300 hover:text-white transition-colors">
                  {t('footer.about')}
                </Link>
              </li>
              <li>
                <a 
                  href="https://app.geest.app/ver2/#/trigger/?pb=eyJJZFRyaWdnZXIiOjY3NzV9" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  {t('footer.contact')}
                </a>
              </li>
            </ul>
          </div>

          <Newsletter />
        </div>

        {/* Map Section */}
        <div className="mt-12 mb-8">
          <h3 className="text-lg font-semibold mb-4 text-center">{t('footer.ourLocation')}</h3>
          <div className="max-w-4xl mx-auto">
            <MapLocation />
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          {/* Social Media and Credits Row */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
            
            {/* Social Media */}
            <div className="flex items-center space-x-6">
              <span className="text-gray-400 text-sm">{t('footer.followUs')}</span>
              <a 
                href="https://instagram.com/divancoconstructora" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center space-x-2 text-gray-300 hover:text-pink-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span className="hidden sm:inline text-sm">@divancoconstructora</span>
              </a>
              
              <a 
                href="https://www.facebook.com/divancosas" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group flex items-center space-x-2 text-gray-300 hover:text-blue-400 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="hidden sm:inline text-sm">divancosas</span>
              </a>
            </div>

            {/* Code Developers Credit */}
            <div className="flex items-center space-x-3">
              <span className="text-gray-400 text-sm">{t('footer.developedBy')}</span>
              <div className="flex items-center space-x-2 group">
                <img 
                  src="/images/logoCode.PNG" 
                  alt="Code Developers" 
                  className="h-6 w-auto group-hover:scale-105 transition-transform"
                />
                <span className="text-gray-300 text-sm font-medium group-hover:text-white transition-colors">
                  Code Desarrolladores Web
                </span>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} Divanco Arquitectura. {t('footer.allRightsReserved')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;