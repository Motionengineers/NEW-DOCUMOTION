'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, Menu, X, Sun, Moon, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from './ThemeProvider';
import { useBranding } from './BrandingProvider';

const NotificationsWidget = dynamic(() => import('./NotificationsWidget'), { ssr: false });

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openNoti, setOpenNoti] = useState(false);
  const { theme, toggle } = useTheme();
  const { branding } = useBranding();
  const [logoError, setLogoError] = useState(false);

  // Apply UX Laws: Serial Position Effect, Hick's Law, Miller's Law
  // Serial Position Effect: Most important at start and end
  // Hick's Law: Limit to 5-7 visible items
  // Miller's Law: Group related items
  const primaryNav = [
    { href: '/dashboard', label: 'Dashboard', priority: 'high' },
    { href: '/funding/apply', label: 'Funding', priority: 'high' },
    { href: '/schemes', label: 'Schemes', priority: 'high' },
    { href: '/bank', label: 'Banks', priority: 'medium' },
    { href: '/feed', label: 'Startup Feed', priority: 'medium' },
  ];

  const secondaryNav = [];

  const moreNav = [
    { href: '/services/registration', label: 'Services', priority: 'high' },
    { href: '/banking', label: 'Startup Banking', priority: 'high' },
    { href: '/schemes/state-explorer', label: 'State Funding Explorer', priority: 'high' },
    { href: '/talent', label: 'Talent', priority: 'medium' },
    { href: '/settings/team', label: 'Team', priority: 'medium' },
    { href: '/pitch-decks', label: 'Pitch Decks', priority: 'low' },
    { href: '/ma', label: 'M&A', priority: 'low' },
  ];

  // Combine for main display (max 5 items - Miller's Law)
  const visibleNav = [...primaryNav, ...secondaryNav].slice(0, 5);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  useEffect(() => {
    setLogoError(false);
  }, [branding.logoUrl, branding.logoDarkUrl, theme]);

  const logoSrc =
    theme === 'dark' && branding.logoDarkUrl ? branding.logoDarkUrl : branding.logoUrl;
  const showLogo = Boolean(logoSrc) && !logoError;

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-xl border-b"
      style={{
        backgroundColor: 'var(--system-secondary-background)',
        borderColor: 'var(--separator)',
      }}
    >
      <div className="container mx-auto px-6 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          {/* Logo - Apply Fitt's Law: Large tap target */}
          <Link href="/" className="flex items-center space-x-2 group min-h-[48px] min-w-[48px]">
            {showLogo ? (
              <div className="relative h-8 w-8">
                <Image
                  src={logoSrc}
                  alt={branding.companyName || 'Logo'}
                  fill
                  unoptimized
                  sizes="32px"
                  className="rounded-lg object-contain transition-opacity group-hover:opacity-80"
                  onError={() => setLogoError(true)}
                />
              </div>
            ) : null}
            {!showLogo && (
              <div
                className="p-1.5 rounded-lg group-hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor: `${branding.primaryColor || '#0066cc'}1A`,
                  color: branding.primaryColor || '#0066cc',
                }}
              >
                <Zap className="h-5 w-5" />
              </div>
            )}
            <span
              className="text-xl font-semibold tracking-tight"
              style={{
                color: 'var(--label)',
                fontFamily: 'var(--font-heading, inherit)',
              }}
            >
              {branding.whiteLabelMode
                ? branding.companyName
                : branding.companyName || 'Documotion'}
            </span>
          </Link>

          {/* Desktop Navigation - Apply Law of Common Region: Visual grouping */}
          <div className="hidden md:flex items-center">
            <div
              className="flex items-center space-x-1 border-r pr-4 mr-4"
              style={{ borderColor: 'var(--separator)' }}
            >
              {/* Apply Fitt's Law: 48px tap targets */}
              {visibleNav.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-3 min-h-[48px] min-w-[48px] rounded-lg text-sm font-medium transition-all flex items-center justify-center"
                  style={{
                    color: pathname === link.href ? 'var(--system-blue)' : 'var(--label)',
                    backgroundColor:
                      pathname === link.href ? 'rgba(0, 102, 204, 0.1)' : 'transparent',
                  }}
                  onMouseEnter={e => {
                    if (pathname !== link.href) {
                      e.currentTarget.style.backgroundColor = 'var(--muted)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (pathname !== link.href) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* More Menu - Apply Hick's Law: Progressive disclosure */}
            {moreNav.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="px-4 py-3 min-h-[48px] min-w-[48px] rounded-lg text-sm font-medium transition-all flex items-center justify-center"
                  style={{
                    color: 'var(--label)',
                    backgroundColor: showMoreMenu ? 'rgba(0, 102, 204, 0.1)' : 'transparent',
                  }}
                  onMouseEnter={e => {
                    if (!showMoreMenu) {
                      e.currentTarget.style.backgroundColor = 'var(--muted)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!showMoreMenu) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  More
                  <ChevronDown
                    className={`ml-1 h-4 w-4 transition-transform ${showMoreMenu ? 'rotate-180' : ''}`}
                  />
                </button>

                {/* Dropdown Menu */}
                {showMoreMenu && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg border overflow-hidden z-50"
                    style={{
                      backgroundColor: 'var(--system-background)',
                      borderColor: 'var(--separator)',
                    }}
                    onMouseLeave={() => setShowMoreMenu(false)}
                  >
                    {moreNav.map(link => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setShowMoreMenu(false)}
                        className="block px-4 py-3 min-h-[48px] text-sm font-medium transition-all"
                        style={{
                          color: pathname === link.href ? 'var(--system-blue)' : 'var(--label)',
                          backgroundColor:
                            pathname === link.href ? 'rgba(0, 102, 204, 0.1)' : 'transparent',
                        }}
                        onMouseEnter={e => {
                          if (pathname !== link.href) {
                            e.currentTarget.style.backgroundColor = 'var(--muted)';
                          }
                        }}
                        onMouseLeave={e => {
                          if (pathname !== link.href) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons - Apply Law of Proximity: Group related controls */}
            <div
              className="flex items-center space-x-2 ml-4 pl-4 border-l"
              style={{ borderColor: 'var(--separator)' }}
            >
              {/* Theme Toggle - Apply Fitt's Law: 48px tap target */}
              <button
                onClick={toggle}
                className="h-12 w-12 flex items-center justify-center rounded-full transition-all shadow-sm"
                style={{
                  color: 'var(--label)',
                  backgroundColor: 'var(--system-secondary-background)',
                  border: '1px solid var(--separator)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'var(--muted)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'var(--system-secondary-background)';
                }}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              {/* Notifications - Apply Fitt's Law: 48px tap target */}
              <button
                onClick={() => setOpenNoti(v => !v)}
                className="h-12 w-12 flex items-center justify-center rounded-lg transition-all"
                style={{ color: 'var(--label)' }}
                aria-expanded={openNoti}
                aria-controls="notifications-panel"
                aria-label="Toggle notifications"
              >
                🔔
              </button>

              {openNoti && (
                <div
                  id="notifications-panel"
                  className="absolute right-8 top-16 z-50"
                  role="region"
                  aria-live="polite"
                >
                  <NotificationsWidget />
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button - Apply Fitt's Law: 48px tap target */}
          <button
            className="md:hidden p-3 min-h-[48px] min-w-[48px] rounded-lg flex items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ color: 'var(--label)' }}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu - Apply Miller's Law: Group items */}
        {mobileMenuOpen && (
          <div
            className="md:hidden mt-4 pb-4 space-y-1 border-t pt-4"
            style={{ borderColor: 'var(--separator)' }}
          >
            {/* Apply Law of Common Region: Group primary navigation */}
            <div className="mb-4">
              <h3
                className="px-4 text-xs font-semibold uppercase mb-2"
                style={{ color: 'var(--tertiary-label)' }}
              >
                Main
              </h3>
              {visibleNav.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 min-h-[48px] rounded-lg text-base font-medium"
                  style={{
                    color: pathname === link.href ? 'var(--system-blue)' : 'var(--label)',
                    backgroundColor:
                      pathname === link.href ? 'rgba(0, 102, 204, 0.1)' : 'transparent',
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Apply Law of Common Region: Group more options */}
            {moreNav.length > 0 && (
              <div className="mb-4">
                <h3
                  className="px-4 text-xs font-semibold uppercase mb-2"
                  style={{ color: 'var(--tertiary-label)' }}
                >
                  More
                </h3>
                {moreNav.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 min-h-[48px] rounded-lg text-base font-medium"
                    style={{
                      color: pathname === link.href ? 'var(--system-blue)' : 'var(--label)',
                      backgroundColor:
                        pathname === link.href ? 'rgba(0, 102, 204, 0.1)' : 'transparent',
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
            {/* Settings Section - Apply Law of Proximity: Group related actions */}
            <div className="pt-4 border-t" style={{ borderColor: 'var(--separator)' }}>
              <button
                onClick={toggle}
                className="w-full flex items-center space-x-3 px-4 py-3 min-h-[48px] rounded-lg text-base font-medium"
                style={{ color: 'var(--label)' }}
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="h-5 w-5" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-5 w-5" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
