import React, { useState } from 'react';
import { FiX, FiHelpCircle, FiCalendar, FiList, FiClipboard } from 'react-icons/fi';
import ChecklistForm from './ChecklistForm';
import QuestionForm from './QuestionForm';
import ScheduleForm from './ScheduleForm';
import { Checklist } from '../../../models/Checklist';
import ModalPortal from '../../../components/ModalPortal';

interface ChecklistDetailModalProps {
  checklistId: string;
  checklistName?: string;
  checklist?: Checklist;
  initialTab?: 'general' | 'questions' | 'schedule';
  onClose: () => void;
  onSaved?: () => void;
}

const TABS = [
  { key: 'general',   label: 'Información General', icon: <FiClipboard size={15} /> },
  { key: 'questions', label: 'Preguntas',           icon: <FiHelpCircle size={15} /> },
  { key: 'schedule',  label: 'Programaciones',      icon: <FiCalendar size={15} /> },
] as const;

type TabKey = typeof TABS[number]['key'];

const ChecklistDetailModal: React.FC<ChecklistDetailModalProps> = ({
  checklistId,
  checklistName,
  checklist,
  initialTab = 'general',
  onClose,
  onSaved,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-surface-app rounded-[28px] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">

          {/* ── Header ── */}
          <div className="bg-white px-6 py-5 flex-shrink-0 border-b border-slate-100">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2.5">
                  <FiList className="w-5 h-5 text-primary-gold flex-shrink-0" />
                  {checklistName ?? checklist?.name ?? 'Lista de Chequeo'}
                </h2>
                <p className="text-sm text-gray-500 mt-0.5 ml-7">
                  Edita la información general, las preguntas y las programaciones de esta lista
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* ── Tabs oscuros ── */}
            <div className="mt-4 overflow-x-auto scrollbar-none">
              <div className="bg-primary p-1.5 rounded-full inline-flex gap-1">
                {TABS.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition-all active:scale-95 whitespace-nowrap ${
                      activeTab === tab.key
                        ? 'bg-primary-gold text-white shadow-[0_4px_12px_rgba(221,152,3,0.25)]'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab.icon}{tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Content ── */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/50">
            {activeTab === 'general' && (
              <ChecklistForm
                checklist={checklist}
                onClose={onClose}
                onSaved={onSaved}
              />
            )}
            {activeTab === 'questions' && <QuestionForm checklistId={checklistId} />}
            {activeTab === 'schedule' && <ScheduleForm checklistId={checklistId} onScheduleChange={onSaved} />}
          </div>

        </div>
      </div>
    </ModalPortal>
  );
};

export default ChecklistDetailModal;
