import { useState } from 'react';
import { useSubscribeMutation } from '../../../features/subscriber/subscriberApi';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [subscribe, { isLoading: isSubmitting }] = useSubscribeMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage('Por favor ingresa tu email');
      setShowSuccess(false);
      return;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setMessage('Por favor ingresa un email válido');
      setShowSuccess(false);
      return;
    }

    setMessage('');

    try {
      const result = await subscribe(email.trim()).unwrap();
      
      if (result.success) {
        setMessage(result.message || '¡Suscripción exitosa! Revisa tu email para confirmar.');
        setShowSuccess(true);
        setEmail('');
        
        // Limpiar mensaje después de 5 segundos
        setTimeout(() => {
          setMessage('');
          setShowSuccess(false);
        }, 5000);
      } else {
        setMessage(result.message || 'Error al suscribirse. Intenta nuevamente.');
        setShowSuccess(false);
      }
    } catch (error) {
      console.error('Error en suscripción:', error);
      const errorMessage = error?.data?.message || 'Error al suscribirse. Intenta nuevamente.';
      setMessage(errorMessage);
      setShowSuccess(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
      <p className="text-gray-300 mb-6 text-sm leading-relaxed">
        Recibe las últimas noticias sobre nuestros proyectos y novedades del blog
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu-email@ejemplo.com"
            className="
              w-full px-0 py-3 
              bg-transparent 
              border-0 border-b border-gray-600 
              text-white placeholder-gray-400
              focus:outline-none focus:border-orange-500 
              transition-colors duration-200
              text-sm
            "
            disabled={isSubmitting}
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || showSuccess}
          className={`
            w-full text-white text-sm font-medium 
            py-3 px-6 
            transition-all duration-200
            disabled:cursor-not-allowed
            uppercase tracking-wider
            ${showSuccess 
              ? 'bg-green-600 hover:bg-green-600' 
              : 'bg-naranjaDivanco hover:bg-orange-500 disabled:opacity-50'
            }
          `}
        >
          {isSubmitting ? 'SUSCRIBIENDO...' : showSuccess ? '¡SUSCRITO!' : 'SUSCRIBETE'}
        </button>
        
        {message && (
          <div className={`text-xs mt-2 p-2 rounded transition-all duration-200 ${
            showSuccess 
              ? 'text-green-400 bg-green-900/20 border border-green-700/30' 
              : 'text-red-400 bg-red-900/20 border border-red-700/30'
          }`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
};

export default Newsletter;