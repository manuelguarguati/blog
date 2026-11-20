import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User as UserIcon, Sparkles, KeyRound } from 'lucide-react';
import type { User } from '../types';
import { loginAuthor, registerAuthor, checkAuthStatus } from '../api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('María Bibiana (Bibi)');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ownerRegistered, setOwnerRegistered] = useState(false);

  useEffect(() => {
    checkAuthStatus()
      .then((data) => {
        setOwnerRegistered(data.owner_registered);
        // Default to register if no owner exists yet!
        if (!data.owner_registered) {
          setMode('register');
        } else {
          setMode('login');
        }
      })
      .catch(() => {});
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        const res = await registerAuthor(name, email, password);
        onSuccess(res.user);
        onClose();
      } else {
        const res = await loginAuthor(email, password);
        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FFFDF9] w-full max-w-md rounded-3xl shadow-2xl border border-[#EFE5DC] overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#F0E6DE] flex items-center justify-between bg-[#FFFDF9]/95 backdrop-blur-md">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-[#F5D5D8] flex items-center justify-center text-sm">
              🌸
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#3A2D2D]">
                Acceso Autora
              </h2>
              <p className="text-[11px] text-[#8C7A77]">Espacio exclusivo de María Bibiana</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F5ECE5] hover:bg-[#EADBCE] text-[#635350] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch (only if registering is still allowed) */}
        {!ownerRegistered ? (
          <div className="px-6 pt-5">
            <div className="bg-[#FAF4EE] p-3 rounded-2xl border border-[#E8DAD1] text-xs text-[#7A6460] flex items-start space-x-2">
              <Sparkles className="w-4 h-4 text-[#D88D96] shrink-0 mt-0.5" />
              <span>
                <strong>¡Primer paso!</strong> Crea tu cuenta de dueña del blog. Esta cuenta será la única que podrá publicar y administrar el contenido.
              </span>
            </div>
          </div>
        ) : (
          <div className="flex border-b border-[#F0E6DE] text-xs font-semibold">
            <button
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-3 text-center transition-colors ${
                mode === 'login'
                  ? 'text-[#8C3A48] border-b-2 border-[#8C3A48] bg-[#FAF5F0]'
                  : 'text-[#8C7A77] hover:text-[#5E4D4A]'
              }`}
            >
              Iniciar Sesión
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-[#6B5A57] mb-1">
                Tu nombre:
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#A89693] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="María Bibiana"
                  className="w-full bg-[#FAF5F0] border border-[#DECFC5] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#4A3D3C] focus:outline-none focus:ring-2 focus:ring-[#D88D96]/40"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[#6B5A57] mb-1">
              Correo electrónico:
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#A89693] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="bibi@ejemplo.com"
                className="w-full bg-[#FAF5F0] border border-[#DECFC5] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#4A3D3C] focus:outline-none focus:ring-2 focus:ring-[#D88D96]/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6B5A57] mb-1">
              Contraseña:
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#A89693] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-[#FAF5F0] border border-[#DECFC5] rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-[#4A3D3C] focus:outline-none focus:ring-2 focus:ring-[#D88D96]/40"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 bg-[#D88D96] hover:bg-[#C97A88] disabled:opacity-50 text-white py-3 rounded-full text-sm font-semibold shadow-xs hover:shadow transition-all"
            >
              <KeyRound className="w-4 h-4" />
              <span>
                {loading
                  ? 'Comprobando...'
                  : mode === 'register'
                  ? 'Registrar mi cuenta de Autora ✨'
                  : 'Ingresar como Bibi ✨'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
