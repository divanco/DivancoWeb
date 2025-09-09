import React from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Importar useNavigate
import { 
  FolderIcon, 
  DocumentTextIcon, 
  TagIcon, 
  Squares2X2Icon,
  PlusIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

const DashboardPage = () => {
  const navigate = useNavigate(); // ✅ Hook para navegación

  const sections = [
    {
      id: 'projects',
      title: 'Proyectos',
      description: 'Gestiona tu portfolio de proyectos',
      icon: FolderIcon,
      count: 24,
      color: 'bg-blue-50 text-blue-600',
      borderColor: 'border-blue-200 hover:border-blue-300',
      actions: [
        { label: 'Crear', icon: PlusIcon, href: '/admin/proyectosEdit' }, // Modificado para usar la misma ruta
        { label: 'Ver todos', icon: EyeIcon, href: '/admin/proyectosEdit' },
      ]
    },
    {
      id: 'blog',
      title: 'Blog',
      description: 'Entradas y artículos del blog',
      icon: DocumentTextIcon,
      count: 12,
      color: 'bg-green-50 text-green-600',
      borderColor: 'border-green-200 hover:border-green-300',
      actions: [
        { label: 'Escribir', icon: PlusIcon, href: '/admin/blog' }, // ✅ Corregido
        { label: 'Gestionar', icon: PencilIcon, href: '/admin/blog' }, // ✅ Corregido
      ]
    },
    {
      id: 'categories',
      title: 'Showroom',
      description: 'Categorías del showroom',
      icon: TagIcon,
      count: 8,
      color: 'bg-purple-50 text-purple-600',
      borderColor: 'border-purple-200 hover:border-purple-300',
      actions: [
        { label: 'Crear', icon: PlusIcon, href: '/admin/showroom' }, // ✅ Actualizado a nueva ruta
        { label: 'Organizar', icon: Squares2X2Icon, href: '/admin/showroom' }, // ✅ Actualizado a nueva ruta
      ]
    },
   
  ];

  // ✅ Función mejorada para navegación
  const handleNavigation = (href) => {
    navigate(href);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-light text-gray-900 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-500 text-sm">
          Gestiona tu contenido y configuración del estudio
        </p>
      </div>

      {/* Grid de tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sections.map((section) => {
          const IconComponent = section.icon;
          
          return (
            <div
              key={section.id}
              className={`
                bg-white rounded-lg border-2 transition-all duration-200
                ${section.borderColor}
                hover:shadow-lg hover:-translate-y-1
              `}
            >
              {/* Header de la tarjeta */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`
                    p-3 rounded-lg ${section.color}
                  `}>
                    <IconComponent className="h-6 w-6" />
                  </div>
                  <span className="text-2xl font-light text-gray-900">
                    {section.count}
                  </span>
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {section.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {section.description}
                </p>
              </div>

              {/* Acciones */}
              <div className="border-t border-gray-100 p-4">
                <div className="flex gap-2">
                  {section.actions.map((action, index) => {
                    const ActionIcon = action.icon;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleNavigation(action.href)}
                        className="
                          flex items-center gap-2 px-3 py-2 text-xs font-medium
                          text-gray-600 hover:text-gray-900
                          bg-gray-50 hover:bg-gray-100
                          rounded-md transition-colors duration-150
                          flex-1 justify-center
                        "
                      >
                        <ActionIcon className="h-4 w-4" />
                        {action.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats rápidas */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Resumen rápido
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-light text-gray-900">
              {sections.reduce((total, section) => total + section.count, 0)}
            </div>
            <div className="text-sm text-gray-500">Total elementos</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-light text-blue-600">24</div>
            <div className="text-sm text-gray-500">Proyectos activos</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-light text-green-600">12</div>
            <div className="text-sm text-gray-500">Entradas blog</div>
          </div>
          
          
        </div>
      </div>

      {/* ✅ NUEVO: Enlaces rápidos para navegación */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Accesos rápidos</h3>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/proyectos')}
              className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
            >
              📐 Ver proyectos públicos
            </button>
            <button
              onClick={() => navigate('/showroom')}
              className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
            >
              🏪 Ver showroom público
            </button>
            <button
              onClick={() => navigate('/blog')}
              className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded transition-colors"
            >
              📝 Ver blog público
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Actividad reciente</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Último proyecto creado</span>
              <span className="text-gray-400">Hace 2 días</span>
            </div>
            <div className="flex justify-between">
              <span>Último post del blog</span>
              <span className="text-gray-400">Hace 1 semana</span>
            </div>
            <div className="flex justify-between">
              <span>Nuevos materiales</span>
              <span className="text-gray-400">Hace 3 días</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;