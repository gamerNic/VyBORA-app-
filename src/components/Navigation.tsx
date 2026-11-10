import React from 'react';
import { ActiveTab, ThemeColors } from '../types/music';
import { Home, Music2, ListMusic, Heart, Sliders, Settings } from 'lucide-react';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  theme: ThemeColors;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  theme,
}) => {
  const tabs = [
    { id: 'home' as ActiveTab, label: 'Inicio', icon: Home },
    { id: 'library' as ActiveTab, label: 'Biblioteca', icon: Music2 },
    { id: 'playlists' as ActiveTab, label: 'Playlists', icon: ListMusic },
    { id: 'favorites' as ActiveTab, label: 'Favoritos', icon: Heart },
    { id: 'equalizer' as ActiveTab, label: 'Ecualizador', icon: Sliders },
    { id: 'settings' as ActiveTab, label: 'Ajustes', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-xl border-t border-white/5 pb-safe">
      <div className="max-w-lg mx-auto grid grid-cols-6 items-center h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-all group relative"
            >
              <div
                className={`p-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'scale-110 shadow-lg'
                    : 'text-slate-400 group-hover:text-slate-200 group-hover:scale-105'
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: `${theme.primary}20`,
                        color: theme.primary,
                        boxShadow: `0 0 16px ${theme.primary}40`,
                      }
                    : undefined
                }
              >
                <Icon
                  className="w-5 h-5 transition-transform"
                  strokeWidth={isActive ? 2.5 : 2}
                  fill={isActive && tab.id === 'favorites' ? theme.primary : 'none'}
                />
              </div>

              <span
                className={`text-[10px] font-medium tracking-tight mt-0.5 transition-colors ${
                  isActive ? 'text-white font-semibold' : 'text-slate-400 group-hover:text-slate-300'
                }`}
              >
                {tab.label}
              </span>

              {/* Active glow dot */}
              {isActive && (
                <div
                  className="absolute bottom-1 w-1 h-1 rounded-full animate-pulse"
                  style={{ backgroundColor: theme.primary }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
