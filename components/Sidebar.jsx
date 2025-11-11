'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Banknote,
  Users,
  Building2,
  Briefcase,
  BookOpen,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/schemes', label: 'Schemes', icon: FileText },
  { href: '/bank', label: 'Banks', icon: Banknote },
  { href: '/pitch-decks', label: 'Pitch Decks', icon: FileText },
  { href: '/talent', label: 'Talent', icon: Users },
  { href: '/agencies', label: 'Agencies', icon: Building2 },
  { href: '/investors', label: 'Investors', icon: Briefcase },
  { href: '/learn', label: 'Learn', icon: BookOpen },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

  const isActive = href => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname?.startsWith(href);
  };

  const SidebarContent = () => (
    <>
      <div className="flex items-center justify-between mb-6">
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-bold"
            style={{ color: 'var(--label)' }}
          >
            Documotion
          </motion.div>
        )}
        <button
          onClick={toggleCollapse}
          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          style={{ color: 'var(--label)' }}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      <nav className="space-y-1" role="navigation">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 py-2.5 px-3 rounded-lg transition-all ${
                active ? 'bg-blue-500/20' : 'hover:bg-white/5'
              }`}
              style={{
                color: active ? 'var(--system-blue)' : 'var(--label)',
              }}
              role="link"
              aria-label={`Open ${item.label}`}
            >
              <Icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-blue-500' : ''}`} />
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-medium text-sm"
                >
                  {item.label}
                </motion.span>
              )}
            </Link>
          );
        })}
      </nav>

      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-auto pt-6 border-t text-sm opacity-80"
          style={{ borderColor: 'var(--separator)', color: 'var(--tertiary-label)' }}
        >
          <div>Signed in as</div>
          <div className="font-medium mt-1" style={{ color: 'var(--secondary-label)' }}>
            Manish • Motion Engineers
          </div>
        </motion.div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobile}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg glass"
        style={{ color: 'var(--label)' }}
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex fixed left-6 top-6 bottom-6 glass p-6 flex-col z-40 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-72'
        }`}
        aria-label="Main navigation"
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMobile}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed left-0 top-0 bottom-0 glass p-6 flex flex-col z-50 w-72"
              aria-label="Main navigation"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
