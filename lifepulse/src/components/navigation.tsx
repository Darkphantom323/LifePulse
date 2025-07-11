'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers';
import { useUserProfile } from '@/hooks/useApi';
import { useState } from 'react';
import { 
  BarChart3, 
  Target, 
  Droplets, 
  Heart, 
  Calendar,
  Settings,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { clsx } from 'clsx';
import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navigation = [
  { name: 'Insights', href: '/', icon: BarChart3 },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Hydration', href: '/hydration', icon: Droplets },
  { name: 'Breathe', href: '/breathe', icon: Heart },
  { name: 'Schedule', href: '/schedule', icon: Calendar },
];

const secondaryNavigation = [
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
];

// Memoized nav item component
const NavItem = memo(function NavItem({ 
  item, 
  isActive,
  onClick 
}: { 
  item: typeof navigation[0], 
  isActive: boolean,
  onClick?: () => void
}) {
  return (
    <li>
      <Link
        href={item.href}
        onClick={onClick}
        className={clsx(
          'group flex gap-x-3 rounded-xl p-3 text-sm leading-6 font-medium transition-all duration-200 relative overflow-hidden',
          isActive
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
            : 'text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50'
        )}
      >
        <item.icon
          className={clsx(
            'h-5 w-5 shrink-0 transition-all duration-200',
            isActive 
              ? 'text-white' 
              : 'text-gray-400 group-hover:text-blue-600'
          )}
        />
        <span className="truncate">{item.name}</span>
        {isActive && (
          <motion.div
            layoutId="activeTab"
            className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl -z-10"
            initial={false}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        )}
      </Link>
    </li>
  );
});

const SecondaryNavItem = memo(function SecondaryNavItem({ 
  item, 
  isActive,
  onClick 
}: { 
  item: typeof secondaryNavigation[0], 
  isActive: boolean,
  onClick?: () => void
}) {
  return (
    <li>
      <Link
        href={item.href}
        onClick={onClick}
        className={clsx(
          'group flex gap-x-3 rounded-xl p-3 text-sm leading-6 font-medium transition-all duration-200',
          isActive
            ? 'bg-gray-100 text-blue-600'
            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
        )}
      >
        <item.icon
          className={clsx(
            'h-5 w-5 shrink-0 transition-colors duration-200',
            isActive 
              ? 'text-blue-600' 
              : 'text-gray-400 group-hover:text-blue-600'
          )}
        />
        {item.name}
      </Link>
    </li>
  );
});

// Mobile Menu Toggle
const MobileMenuToggle = memo(function MobileMenuToggle({ 
  isOpen, 
  setIsOpen 
}: { 
  isOpen: boolean; 
  setIsOpen: (open: boolean) => void; 
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setIsOpen(!isOpen)}
      className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-white shadow-lg border border-gray-200 backdrop-blur-sm"
    >
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="close"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <X className="h-6 w-6 text-gray-700" />
          </motion.div>
        ) : (
          <motion.div
            key="menu"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Menu className="h-6 w-6 text-gray-700" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
});

// Sidebar Content Component
const SidebarContent = memo(function SidebarContent({ 
  pathname, 
  user, 
  profileData,
  logout,
  onNavigate 
}: {
  pathname: string;
  user: any;
  profileData?: any;
  logout: () => void;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center px-2">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            LifePulse
          </h1>
        </motion.div>
      </div>

      {/* User Info */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mx-2 mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100"
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center overflow-hidden">
              {profileData?.profilePictureUrl ? (
                <img 
                  src={profileData.profilePictureUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {profileData?.name || user?.name || user?.email}
            </p>
            <p className="text-xs text-gray-600 truncate">
              {profileData?.email || user?.email}
            </p>
          </div>
        </div>
      </motion.div>
      
      {/* Navigation */}
      <nav className="flex flex-1 flex-col px-2">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="space-y-1">
              {navigation.map((item) => (
                <NavItem 
                  key={item.name} 
                  item={item} 
                  isActive={pathname === item.href}
                  onClick={onNavigate}
                />
              ))}
            </ul>
          </li>
          
          <li className="mt-auto">
            <ul role="list" className="space-y-1">
              {secondaryNavigation.map((item) => (
                <SecondaryNavItem 
                  key={item.name} 
                  item={item} 
                  isActive={pathname === item.href}
                  onClick={onNavigate}
                />
              ))}
              
              <li>
                <button
                  onClick={() => {
                    onNavigate?.();
                    logout();
                    window.location.href = '/auth/signin';
                  }}
                  className="group flex gap-x-3 rounded-xl p-3 text-sm leading-6 font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 w-full text-left transition-all duration-200"
                >
                  <LogOut className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-red-600 transition-colors duration-200" />
                  Sign Out
                </button>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );
});

export const Navigation = memo(function Navigation() {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const { data: profileData } = useUserProfile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Show auth UI if not authenticated
  if (loading) {
    return (
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 border-r border-gray-200">
          <div className="flex h-16 shrink-0 items-center">
            <div className="animate-pulse flex space-x-4 w-full">
              <div className="rounded-xl bg-gray-200 h-10 w-10"></div>
              <div className="h-6 bg-gray-200 rounded w-24 mt-2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 border-r border-gray-200 justify-center">
          <div className="text-center space-y-6">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="flex items-center justify-center gap-3"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                LifePulse
              </h1>
            </motion.div>
            <div className="space-y-4">
              <p className="text-gray-600">
                Sign in to access your personal wellness tracker
              </p>
              <div className="space-y-3">
                <Link
                  href="/auth/signin"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:scale-[1.02] shadow-lg"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 hover:scale-[1.02]"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile menu toggle */}
      <MobileMenuToggle isOpen={mobileMenuOpen} setIsOpen={setMobileMenuOpen} />

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40"
          >
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-600/75 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div 
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 flex w-full max-w-xs"
            >
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 border-r border-gray-200 shadow-xl">
                <SidebarContent 
                  pathname={pathname} 
                  user={user} 
                  profileData={profileData}
                  logout={logout}
                  onNavigate={() => setMobileMenuOpen(false)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 border-r border-gray-200 shadow-lg">
          <SidebarContent pathname={pathname} user={user} profileData={profileData} logout={logout} />
        </div>
      </div>
    </>
  );
}); 