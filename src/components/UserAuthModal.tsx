import React, { useState } from 'react';
import { User, LogIn, UserPlus, ShieldCheck, Check, Sparkles, X } from 'lucide-react';
import { User as UserType } from '../types';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserType[];
  currentUser: UserType | null;
  onSelectUser: (user: UserType) => void;
  onRegisterUser: (name: string, email: string) => void;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUser,
  onSelectUser,
  onRegisterUser,
}) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim() && emailInput.trim()) {
      onRegisterUser(nameInput.trim(), emailInput.trim());
      setNameInput('');
      setEmailInput('');
      setIsRegistering(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2.5 bg-cyan-950 border border-cyan-800 text-cyan-400 rounded-xl">
            <LogIn className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">User Login & Account Switcher</h2>
            <p className="text-xs text-slate-400">
              Select or register a terminal node account to transmit and receive vectors.
            </p>
          </div>
        </div>

        {!isRegistering ? (
          <div className="space-y-4">
            <div className="text-xs font-semibold text-slate-300">Choose Active Terminal Node Account:</div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {users.map((u) => {
                const isSelected = currentUser?.id === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => {
                      onSelectUser(u);
                      onClose();
                    }}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all text-left ${
                      isSelected
                        ? 'bg-cyan-950/70 border-cyan-500/80 text-cyan-200 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-9 h-9 rounded-full border border-slate-700 bg-slate-800"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-200">{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                        <div className="text-[10px] text-cyan-400 font-mono mt-0.5">{u.role}</div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-cyan-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setIsRegistering(true)}
              className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors"
            >
              <UserPlus className="w-4 h-4 text-cyan-400" />
              Register New Terminal User Account
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">User Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. User CC (Charlie)"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <input
                type="email"
                required
                placeholder="e.g. user_cc@vector.net"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsRegistering(false)}
                className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-950"
              >
                Create Account & Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
