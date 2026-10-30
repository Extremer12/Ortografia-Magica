import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import type { Grade } from '../types';
import { AVATAR_OPTIONS, formatDisplayDate } from '../utils/storage';
import { ConfirmModal } from './ConfirmModal';
import {
  X,
  UserPlus,
  Users,
  Check,
  Trash2,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'profiles' | 'create';
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'profiles',
}) => {
  const {
    activeProfile,
    allProfiles,
    switchProfile,
    createProfile,
    deleteProfile,
    resetActiveProfileProgress,
  } = useGame();

  const [tab, setTab] = useState<'profiles' | 'create'>(initialTab);
  const [newNickname, setNewNickname] = useState('');
  const [newGrade, setNewGrade] = useState<Grade>('3.°');
  const [newAvatar, setNewAvatar] = useState('🦊');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Confirmation modal states
  const [confirmAction, setConfirmAction] = useState<
    'reset_profile' | 'delete_profile' | null
  >(null);
  const [profileToDeleteId, setProfileToDeleteId] = useState<string | null>(null);

  if (!isOpen) return null;

  const grades: Grade[] = ['1.°', '2.°', '3.°', '4.°', '5.°', '6.°', '7.°'];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newNickname.trim();
    if (!trimmed) {
      setErrorMessage('Por favor, ingresá un apodo para el aventurero.');
      return;
    }
    if (trimmed.length < 2) {
      setErrorMessage('El apodo debe tener al menos 2 caracteres.');
      return;
    }

    createProfile(trimmed, newGrade, newAvatar);
    setNewNickname('');
    setErrorMessage(null);
    setSuccessMessage(`¡Perfil de ${trimmed} creado con éxito!`);
    setTimeout(() => {
      setSuccessMessage(null);
      setTab('profiles');
    }, 1200);
  };

  const handleTriggerDelete = (id: string) => {
    if (allProfiles.length <= 1) {
      setErrorMessage('No podés eliminar el único perfil activo. Si querés comenzar de cero, utilizá la opción de reiniciar.');
      return;
    }
    setProfileToDeleteId(id);
    setConfirmAction('delete_profile');
  };

  const handleConfirmDelete = () => {
    if (profileToDeleteId) {
      deleteProfile(profileToDeleteId);
      setProfileToDeleteId(null);
      setConfirmAction(null);
      setSuccessMessage('Perfil eliminado correctamente.');
      setTimeout(() => setSuccessMessage(null), 2000);
    }
  };

  const handleConfirmReset = () => {
    resetActiveProfileProgress();
    setConfirmAction(null);
    setSuccessMessage(`El progreso de ${activeProfile.nickname} ha sido reiniciado a cero.`);
    setTimeout(() => setSuccessMessage(null), 2500);
  };

  const profileToDelete = allProfiles.find(p => p.id === profileToDeleteId);

  return (
    <>
      <div className="fixed inset-0 z-50 bg-[#0A1426]/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 text-[#16284F]">
        <div 
          className="bg-[#FDFBF7] border border-[#C8BDA5] rounded-2xl max-w-md w-full shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95"
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#E2DAC8] flex items-center justify-between bg-[#FAF6EC]">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#C27D16] block">
                Expedición Local
              </span>
              <h2 className="text-base sm:text-lg font-editorial font-bold text-[#16284F]">
                Perfiles y Aventureros
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#7E8DAA] hover:text-[#16284F] hover:bg-[#F2ECE0] transition-colors cursor-pointer"
              aria-label="Cerrar modal de perfiles"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-[#E2DAC8] text-xs font-semibold px-4 pt-2 gap-1 bg-[#FDFBF7]">
            <button
              onClick={() => {
                setTab('profiles');
                setErrorMessage(null);
              }}
              className={`pb-2 px-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                tab === 'profiles'
                  ? 'border-[#1F5F46] text-[#1F5F46] font-bold'
                  : 'border-transparent text-[#7E8DAA] hover:text-[#16284F]'
              }`}
            >
              <Users size={14} />
              <span>Perfiles ({allProfiles.length})</span>
            </button>

            <button
              onClick={() => {
                setTab('create');
                setErrorMessage(null);
              }}
              className={`pb-2 px-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                tab === 'create'
                  ? 'border-[#1F5F46] text-[#1F5F46] font-bold'
                  : 'border-transparent text-[#7E8DAA] hover:text-[#16284F]'
              }`}
            >
              <UserPlus size={14} />
              <span>Nuevo aventurero</span>
            </button>
          </div>

          {/* Alerts */}
          {errorMessage && (
            <div className="mx-4 mt-3 p-3 rounded-xl bg-[#FDF1F0] border border-[#F5C2BE] text-xs text-[#8F261C] flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mx-4 mt-3 p-3 rounded-xl bg-[#EBF4F0] border border-[#C6DFD5] text-xs text-[#1F5F46] flex items-center gap-2">
              <Check size={15} className="stroke-[3] shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Body Content */}
          <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-left">
            {/* TAB 1: PROFILES LIST */}
            {tab === 'profiles' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#62718E]">
                  <span>Seleccioná el perfil para continuar su bitácora:</span>
                </div>

                <div className="space-y-2">
                  {allProfiles.map((p) => {
                    const isActive = p.id === activeProfile.id;
                    return (
                      <div
                        key={p.id}
                        className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                          isActive
                            ? 'bg-[#FAF6EC] border-2 border-[#C27D16] shadow-xs'
                            : 'bg-[#FDFBF7] border-[#E2DAC8] hover:border-[#C8BDA5]'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => switchProfile(p.id)}
                          className="flex items-center gap-3 text-left flex-1 cursor-pointer min-w-0"
                        >
                          <div className="w-10 h-10 rounded-xl bg-[#16284F] text-[#FAF6EC] flex items-center justify-center text-xl shrink-0 shadow-2xs">
                            {p.avatar}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-editorial font-bold text-sm text-[#16284F] truncate">
                                {p.nickname}
                              </h4>
                              {isActive && (
                                <span className="text-[10px] bg-[#C27D16] text-white px-2 py-0.2 rounded-full font-bold">
                                  Activo
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#62718E] truncate">
                              {p.grade} grado · Nivel {p.level} · {p.currentXp} XP · Racha {p.streakDays}d
                            </p>
                          </div>
                        </button>

                        <div className="flex items-center gap-1.5 pl-2">
                          {allProfiles.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleTriggerDelete(p.id)}
                              className="p-1.5 rounded-lg text-[#8C7F69] hover:text-[#B9382C] hover:bg-[#FDF1F0] transition-colors cursor-pointer"
                              title={`Eliminar perfil de ${p.nickname}`}
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reset Active Profile Progress Button */}
                <div className="pt-3 border-t border-[#E8DFCF] flex items-center justify-between text-xs">
                  <span className="text-[#7E8DAA]">
                    Última actividad: {formatDisplayDate(activeProfile.lastActiveDate)}
                  </span>

                  <button
                    type="button"
                    onClick={() => setConfirmAction('reset_profile')}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#8F261C] hover:text-[#5C1610] p-1 rounded transition-colors cursor-pointer"
                  >
                    <RotateCcw size={12} />
                    <span>Reiniciar progreso de {activeProfile.nickname}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: CREATE PROFILE */}
            {tab === 'create' && (
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#16284F] block">
                    Apodo o Nombre del estudiante:
                  </label>
                  <input
                    type="text"
                    value={newNickname}
                    onChange={(e) => setNewNickname(e.target.value)}
                    placeholder="Ej: Luna, Tomás, Sofía..."
                    maxLength={20}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9CDB8] bg-[#FAF6EC] text-sm text-[#16284F] focus:outline-none focus:ring-2 focus:ring-[#C27D16]"
                    autoFocus
                  />
                  <span className="text-[10px] text-[#8C7F69] block">
                    No se requieren correos, contraseñas ni datos personales.
                  </span>
                </div>

                {/* Grade Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#16284F] block">
                    Año escolar en primaria:
                  </label>
                  <div className="grid grid-cols-7 gap-1">
                    {grades.map((g) => (
                      <button
                        type="button"
                        key={g}
                        onClick={() => setNewGrade(g)}
                        className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          newGrade === g
                            ? 'bg-[#C27D16] text-white shadow-2xs'
                            : 'bg-[#F2ECE0] text-[#526079] hover:bg-[#E8DFCF]'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Avatar Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#16284F] block">
                    Elegí un avatar de expedición:
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {AVATAR_OPTIONS.map((av) => {
                      const isSelected = newAvatar === av.emoji;
                      return (
                        <button
                          type="button"
                          key={av.id}
                          onClick={() => setNewAvatar(av.emoji)}
                          className={`p-2.5 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#FAF6EC] border-2 border-[#C27D16] shadow-xs'
                              : 'bg-[#F2ECE0] border border-transparent hover:bg-[#E8DFCF]'
                          }`}
                          title={`${av.name} (${av.role})`}
                        >
                          <span className="text-2xl">{av.emoji}</span>
                          <span className="text-[9px] text-[#526079] font-semibold mt-0.5 truncate w-full text-center">
                            {av.role}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl btn-editorial-primary text-sm flex items-center justify-center gap-2 cursor-pointer font-bold shadow-xs mt-2"
                >
                  <UserPlus size={16} />
                  <span>Crear perfil y comenzar</span>
                </button>
              </form>
            )}
          </div>

          {/* Privacy footer badge */}
          <div className="p-3 bg-[#FAF6EC] border-t border-[#E2DAC8] text-center text-[10px] text-[#7E8DAA] flex items-center justify-center gap-1.5">
            <ShieldCheck size={12} className="text-[#1F5F46]" />
            <span>Sin registro ni contraseñas · Guardado en este dispositivo</span>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={confirmAction === 'reset_profile'}
        title="¿Reiniciar progreso?"
        message={`Se restablecerán a cero los puntos de XP, nivel, racha, estrellas y lecciones completadas del perfil de ${activeProfile.nickname}. Se mantendrá el apodo, grado y avatar.`}
        confirmLabel="Sí, reiniciar progreso"
        cancelLabel="Cancelar"
        isDestructive={true}
        onConfirm={handleConfirmReset}
        onCancel={() => setConfirmAction(null)}
      />

      <ConfirmModal
        isOpen={confirmAction === 'delete_profile'}
        title="¿Eliminar este perfil?"
        message={`Vas a eliminar permanentemente a "${profileToDelete?.nickname || 'este perfil'}". Esta acción no se puede deshacer y se perderán todos sus datos en este dispositivo.`}
        confirmLabel="Eliminar perfil"
        cancelLabel="Cancelar"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setConfirmAction(null);
          setProfileToDeleteId(null);
        }}
      />
    </>
  );
};
