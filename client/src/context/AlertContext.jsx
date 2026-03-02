import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const AlertContext = createContext();

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  const addAlert = useCallback((type, message, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setAlerts((prev) => [...prev, { id, type, message }]);

    if (duration) {
      setTimeout(() => {
        removeAlert(id);
      }, duration);
    }
  }, []);

  const removeAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  // Convenience methods
  const showAlert = useCallback((type, message) => addAlert(type, message), [addAlert]);
  const success = useCallback((message) => addAlert('success', message), [addAlert]);
  const error = useCallback((message) => addAlert('error', message), [addAlert]);
  const info = useCallback((message) => addAlert('info', message), [addAlert]);

  return (
    <AlertContext.Provider value={{ alerts, addAlert, removeAlert, showAlert, success, error, info }}>
      {children}
      
      {/* Alert Container */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-md px-4 pointer-events-none">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={cn(
              "pointer-events-auto flex items-center p-4 rounded-lg shadow-lg border animate-in slide-in-from-top-2 fade-in duration-300",
              "bg-white/95 backdrop-blur-md",
              alert.type === 'success' && "border-green-200 text-green-800",
              alert.type === 'error' && "border-red-200 text-red-800",
              alert.type === 'info' && "border-blue-200 text-blue-800"
            )}
          >
            <div className="flex-shrink-0 mr-3">
              {alert.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
              {alert.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
              {alert.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
            </div>
            <div className="flex-1 text-sm font-medium">{alert.message}</div>
            <button
              onClick={() => removeAlert(alert.id)}
              className="ml-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
};
