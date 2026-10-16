import React, { memo, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { 
  HiOutlineHome, 
  HiOutlineUsers, 
  HiOutlineClipboardList, 
  HiOutlineDocumentReport, 
  HiOutlineCog, 
  HiOutlineCollection, 
  HiOutlineUserGroup, 
  HiOutlineTag, 
  HiOutlineGlobeAlt, 
  HiOutlineIdentification,  
  HiOutlineChartBar,
  HiOutlineClock,
  HiOutlineMail,
  HiChevronDown,
  HiChevronRight
} from 'react-icons/hi';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from 'react-i18next';
import { useLocation, Link } from 'react-router-dom';
import useMenuLinks from '../routerLink/useMenuLinks';
import useRoles from '../../rolKeys/getRolKeys';

const MENU_ITEM_HEIGHT = 48;

interface SlideBarProps {
  isMinimized: boolean;
  toggleMinimize: () => void;
  isMobile: boolean;
}

type AccentMode = 'baby' | 'dark';

interface SidebarTheme {
  label: string;
  container: string;
  logoBorder: string;
  logoText: string;
  groupLabel: string;
  itemIdle: string;
  itemActive: string;
  iconIdle: string;
  iconActive: string;
  bar: string;
  divider: string;
}

const SIDEBAR_THEMES: Record<AccentMode, SidebarTheme> = {
  baby: {
    label: 'Baby Blue',
    container: 'bg-white border-slate-200',
    logoBorder: 'border-slate-100',
    logoText: '#1E3A5F',
    groupLabel: 'text-[#64748B] hover:text-[#1E3A5F]',
    itemIdle: 'text-[#64748B] hover:bg-sky-50/60 hover:text-[#1E3A5F]',
    itemActive: 'bg-sky-50 text-[#389CD6]',
    iconIdle: 'text-[#94A3B8] group-hover:text-[#389CD6]',
    iconActive: 'text-[#389CD6]',
    bar: 'bg-[#389CD6]',
    divider: 'border-slate-100',
  },
  dark: {
    label: 'Azul Pizarra',
    container: 'bg-[#1E3A5F] border-[#2A4365]',
    logoBorder: 'border-white/10',
    logoText: '#FFFFFF',
    groupLabel: 'text-white/50 hover:text-white/80',
    itemIdle: 'text-white/70 hover:bg-white/10 hover:text-white',
    itemActive: 'bg-white/15 text-white',
    iconIdle: 'text-white/50 group-hover:text-white',
    iconActive: 'text-[#89CFF0]',
    bar: 'bg-[#89CFF0]',
    divider: 'border-white/10',
  },
};

const STORAGE_COLLAPSED_KEY = 'pristine_sidebar_collapsed';

function readCollapsedGroups(): Record<number, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_COLLAPSED_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeCollapsedGroups(state: Record<number, boolean>) {
  try {
    localStorage.setItem(STORAGE_COLLAPSED_KEY, JSON.stringify(state));
  } catch {}
}

export const SlideBar: React.FC<SlideBarProps> = memo(({ isMinimized, toggleMinimize, isMobile }) => {
  const user = useSelector((state: RootState) => state.user.user);
  const location = useLocation();
  const { t } = useTranslation();
  const { getLinkByName } = useMenuLinks();
  const { getRoleKeyByName } = useRoles();

  const [collapsedGroups, setCollapsedGroups] = useState<Record<number, boolean>>(readCollapsedGroups);
  const [accentMode, setAccentMode] = useState<AccentMode>('baby');
  const theme = SIDEBAR_THEMES[accentMode];

  const toggleGroup = (idx: number, isCollapsed: boolean) => {
    setCollapsedGroups((prev) => {
      const next = { ...prev, [idx]: !isCollapsed };
      writeCollapsedGroups(next);
      return next;
    });
  };

  const hasPermission = (nameOrKey: string | null = ''): boolean => {
    if (!nameOrKey) return false;
    if (user?.rol_name?.toLowerCase().includes('admin') || user?.rol === 'admin' || user?.user === 'admin') {
      return true;
    }
    const resolvedKey = getRoleKeyByName(nameOrKey);
    return Boolean(
      user?.permissions?.includes(nameOrKey) ||
      (resolvedKey && user?.permissions?.includes(resolvedKey))
    );
  };

  const handleSidebarContainerClick = (e: React.MouseEvent) => {
    if (isMinimized) {
      e.stopPropagation();
      toggleMinimize();
    }
  };

  const handleMenuClick = () => {
    if (isMobile) toggleMinimize();
  };

  const sidebarGroups = [
    {
      items: [
        {
          name: t('menu.home'),
          path: '/',
          icon: HiOutlineHome,
          isVisible: true,
        }
      ]
    },
    {
      title: t('menu.administration').toUpperCase(),
      icon: HiOutlineCog,
      items: [
        { name: t('menu.userManager'), path: getLinkByName('userManager'), icon: HiOutlineUserGroup, isVisible: hasPermission("userManager") },
        { name: t('menu.permissionManager'), path: getLinkByName('permissionManager'), icon: HiOutlineIdentification, isVisible: hasPermission("permissionManager") },
        { name: t('menu.usersLocations'), path: getLinkByName('usersLocations'), icon: HiOutlineGlobeAlt, isVisible: hasPermission("usersLocations") },
      ]
    },
    {
      title: t('menu.TechnicalManagers').toUpperCase(),
      icon: HiOutlineUserGroup,
      items: [
        { name: t('menu.sedesManager'), path: getLinkByName('sedesManager'), icon: HiOutlineHome, isVisible: hasPermission("sedesManager") },
        { name: t('menu.sectorManager'), path: getLinkByName('sectorManager'), icon: HiOutlineUsers, isVisible: hasPermission("sectorManager") },
        { name: t('menu.areaManager'), path: getLinkByName('areaManager'), icon: HiOutlineCollection, isVisible: hasPermission("areaManager") },
        { name: t('menu.categoryChecklist'), path: getLinkByName('categoryChecklist'), icon: HiOutlineTag, isVisible: hasPermission("categoryChecklist") },
        { name: t('menu.GenerateQR'), path: getLinkByName('GenerateQR'), icon: HiOutlineTag, isVisible: hasPermission("GenerateQR") },
        { name: t('menu.checklistConfig'), path: getLinkByName('checklistConfig'), icon: HiOutlineCog, isVisible: hasPermission("checklistConfig") },
      ]
    },
    {
      title: t('menu.Checklist').toUpperCase(),
      icon: HiOutlineClipboardList,
      items: [
        { name: "Dashboard (Checklist)", path: getLinkByName('ChecklistView'), icon: HiOutlineChartBar, isVisible: true },
        { name: t('menu.checkListManager'), path: getLinkByName('checkListManager'), icon: HiOutlineClipboardList, isVisible: hasPermission("checkListManager") },
        { name: t('menu.registerReviewWeb'), path: getLinkByName('registerReviewWeb'), icon: HiOutlineClock, isVisible: hasPermission("registerReviewWeb") },
        { name: t('menu.review&results'), path: getLinkByName('review&results'), icon: HiOutlineChartBar, isVisible: hasPermission("review&results") },
        { name: t('menu.usersCategories'), path: getLinkByName('usersCategories'), icon: HiOutlineTag, isVisible: hasPermission("usersCategories") },
        { name: t('menu.checklistReports'), path: getLinkByName('checklistReports'), icon: HiOutlineDocumentReport, isVisible: hasPermission("checklistReports") },
      ]
    }
  ];

  return (
    <div className="relative">
      {isMobile && !isMinimized && (
        <div
          className="fixed inset-0 bg-black/30 z-30 backdrop-blur-sm"
          onClick={toggleMinimize}
        />
      )}

      <div
        onClickCapture={handleSidebarContainerClick}
        className={`
          fixed top-0 left-0 h-full border-r ${theme.container}
          flex flex-col font-inter
          transition-all duration-300 ease-in-out
          overflow-hidden
          ${isMobile
            ? `z-40 ${isMinimized ? '-translate-x-full' : 'translate-x-0 w-64'}`
            : `z-40 ${isMinimized ? 'w-20 cursor-pointer' : 'w-64 cursor-default'}`
          }
        `}
      >
        {/* Logo Pristine */}
        <div className={`h-[60px] flex items-center px-5 border-b ${theme.logoBorder} shrink-0`}>
          <img src="/img/logo_largo.svg" alt="Pristine Logo" className="h-7 w-auto shrink-0 max-w-[190px]" />
        </div>

        {/* Listado de grupos */}
        <div className="flex-1 overflow-y-auto py-4 scrollbar-custom">
          {sidebarGroups.map((group, idx) => {
            const visibleItems = group.items.filter(item => item.isVisible);
            if (visibleItems.length === 0) return null;

            const isActiveGroup = visibleItems.some(
              (item) => item.path && item.path !== '#' && location.pathname.startsWith(item.path)
            );
            const isCollapsed = collapsedGroups[idx] ?? !isActiveGroup;

            return (
              <div key={idx} className="mb-4">
                {group.title && !isMinimized ? (
                  <div
                    onClick={() => toggleGroup(idx, isCollapsed)}
                    className={`px-6 mb-2 text-[11px] font-semibold ${theme.groupLabel} tracking-widest uppercase flex items-center justify-between cursor-pointer select-none transition-colors`}
                  >
                    <div className="flex items-center gap-1.5">
                      {group.icon && <group.icon className="w-3.5 h-3.5" />}
                      <span>{group.title}</span>
                    </div>
                    {isCollapsed ? (
                      <HiChevronRight className="w-3.5 h-3.5" />
                    ) : (
                      <HiChevronDown className="w-3.5 h-3.5" />
                    )}
                  </div>
                ) : null}

                <div
                  className="transition-[max-height,opacity] duration-300 ease-in-out"
                  style={{
                    maxHeight: isCollapsed && !isMinimized ? 0 : `${visibleItems.length * MENU_ITEM_HEIGHT}px`,
                    opacity: isCollapsed && !isMinimized ? 0 : 1,
                    overflow: 'hidden',
                  }}
                >
                  {visibleItems.map((item, itemIdx) => {
                    const isExactMatch = location.pathname === item.path;
                    const isSubPathMatch = item.path !== '/' && location.pathname.startsWith(item.path + '/');
                    const isActive = isExactMatch || isSubPathMatch;

                    return (
                      <Link
                        key={itemIdx}
                        to={item.path}
                        onClick={handleMenuClick}
                        className={`
                          group relative flex items-center h-11 px-6 text-sm font-medium
                          transition-all duration-200
                          ${isActive ? theme.itemActive : theme.itemIdle}
                        `}
                      >
                        {isActive && (
                          <div className={`absolute left-0 top-1.5 bottom-1.5 w-1 ${theme.bar} rounded-r-full`} />
                        )}

                        <item.icon
                          className={`
                            w-5 h-5 shrink-0 transition-colors
                            ${isActive ? theme.iconActive : theme.iconIdle}
                            ${!isMinimized ? 'mr-3.5' : 'mx-auto'}
                          `}
                        />

                        {!isMinimized && (
                          <span className="truncate">{item.name}</span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer del Sidebar con Language Selector y Theme Switcher */}
        <div className={`p-4 border-t ${theme.divider} flex flex-col gap-2 shrink-0`}>
          {!isMinimized && (
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-medium text-slate-400">Tema</span>
              <button
                type="button"
                onClick={() => setAccentMode((prev) => (prev === 'baby' ? 'dark' : 'baby'))}
                className="text-[11px] px-2 py-0.5 rounded-full font-semibold border border-slate-200 hover:border-slate-300 transition-colors text-slate-600 bg-slate-50"
              >
                {theme.label}
              </button>
            </div>
          )}
          <LanguageSelector isMinimized={isMinimized} />
        </div>
      </div>
    </div>
  );
});
