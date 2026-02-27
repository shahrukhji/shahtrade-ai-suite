import { NavLink } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Bot, Briefcase, Settings } from 'lucide-react';

const tabs = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/fno', label: 'F&O', icon: TrendingUp },
  { path: '/auto-trade', label: 'Auto Trade', icon: Bot },
  { path: '/portfolio', label: 'Portfolio', icon: Briefcase },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const BottomNavBar = () => (
  <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav border-t border-border pb-safe" style={{ height: 64 }}>
    <div className="flex h-full max-w-[430px] mx-auto">
      {tabs.map(({ path, label, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          end={path === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center min-h-[48px] gap-0.5 transition-all duration-200 ${
              isActive ? 'text-info scale-105' : 'text-muted-foreground'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && <div className="w-1 h-1 rounded-full bg-info mb-0.5" />}
              <Icon size={22} />
              <span className="text-[10px]">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  </nav>
);

export default BottomNavBar;
