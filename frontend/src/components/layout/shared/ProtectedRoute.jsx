import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { LoadingSpinner } from './LoadingBoundary'; // ✅ Importar LoadingSpinner compartido
import LogoutButton from '../../ui/LogoutButton'; // ✅ Importar LogoutButton

// Access Denied component específico para ProtectedRoute
const AccessDenied = ({ userRole, requiredRole = "admin", userName }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center max-w-md mx-auto">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
        <span className="text-red-600 text-2xl">🚫</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
      <p className="text-gray-600 mb-2">
        No tienes permisos para acceder a esta sección.
      </p>
      <p className="text-sm text-gray-500 mb-2">
        Usuario: <span className="font-medium">{userName || 'Usuario'}</span>
      </p>
      <p className="text-sm text-gray-500 mb-6">
        Rol actual: <span className="font-medium capitalize">{userRole}</span> | 
        Rol requerido: <span className="font-medium capitalize">{requiredRole}</span>
      </p>
      <div className="space-y-3">
        <button
          onClick={() => window.location.href = '/admin/dashboard'}
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          Ir al Dashboard
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
        >
          Ir al Inicio
        </button>
        
        {/* ✅ NUEVO: Botón de Logout */}
        <div className="pt-4 border-t border-gray-200">
          <LogoutButton
            variant="danger"
            size="md"
            className="w-full"
            showConfirm={true}
            redirectTo="/"
          >
            🚪 Cerrar Sesión
          </LogoutButton>
        </div>
      </div>
    </div>
  </div>
);

const ProtectedRoute = ({ 
  children, 
  adminOnly = false, 
  allowedRoles = [], 
  fallbackPath = "/auth/login",
  showAccessDenied = true 
}) => {
  try {
    const { isAuthenticated, isLoading, isAdmin, user } = useAuth();

    // ⏳ Estado de carga
    if (isLoading) {
      return (
        <LoadingSpinner 
          text="Verificando autenticación..." 
          fullScreen={true}
        />
      );
    }

    // 🚫 No autenticado
    if (!isAuthenticated) {
      return <Navigate to={fallbackPath} replace />;
    }

    // 🔐 Verificar permisos específicos
    const hasRequiredPermissions = () => {
      if (adminOnly && !isAdmin) return false;
      if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) return false;
      return true;
    };

    // 🚫 Sin permisos suficientes
    if (!hasRequiredPermissions()) {
      console.log('🚫 Usuario sin permisos:', {
        userRole: user?.role,
        adminOnly,
        allowedRoles,
        isAdmin
      });

      if (showAccessDenied) {
        return (
          <AccessDenied 
            userRole={user?.role} 
            userName={user?.name || user?.email}
            requiredRole={adminOnly ? "admin" : allowedRoles.join(" o ")} 
          />
        );
      } else {
        return <Navigate to="/admin/dashboard" replace />;
      }
    }

    // ✅ Todo OK: renderizar contenido protegido
    return children;

  } catch (error) {
    console.error('❌ Error en ProtectedRoute:', error);
    
    // Fallback de emergencia
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error de Autenticación</h2>
          <p className="text-gray-600 mb-4">Por favor, recarga la página.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Recargar
          </button>
        </div>
      </div>
    );
  }
};

export default ProtectedRoute;