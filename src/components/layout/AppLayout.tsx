import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Level1MenuItem } from '../../config/menuStructure';
import { MobileMenu } from '../navigation/MobileMenu';
import { DesktopSidebar } from '../navigation/DesktopSidebar';
import { BottomTabBar, TabId } from '../navigation/BottomTabBar';
import { Breadcrumb } from '../navigation/Breadcrumb';

interface AppLayoutProps {
  children: React.ReactNode;
  activeL1: Level1MenuItem | null;
  activeL2: string | null;
  activeL3?: string | null;
  onSelectL1: (item: Level1MenuItem) => void;
  onSelectL2: (item: string) => void;
  onSelectL3?: (item: string) => void;
  onBack: () => void;
  showBottomTabs?: boolean;
  showL2Sidebar?: boolean;
  hasL3Items?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  activeL1,
  activeL2,
  activeL3,
  onSelectL1,
  onSelectL2,
  onSelectL3,
  onBack,
  showBottomTabs = false,
  showL2Sidebar = false,
  hasL3Items = false,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('metrics');

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
      {/* Mobile Header */}
      {isMobile && (
        <header
          className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 safe-area-top"
          style={{ backgroundColor: 'var(--bg-primary)' }}
        >
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 -ml-2"
            style={{ color: 'var(--text-primary)' }}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>

          <span
            className="text-logo uppercase"
            style={{ color: 'var(--text-primary)' }}
          >
            VARVARA
          </span>

          {/* Empty div for spacing */}
          <div className="w-10" />
        </header>
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <DesktopSidebar
          activeL1={activeL1}
          activeL2={activeL2}
          activeL3={activeL3}
          onSelectL1={onSelectL1}
          onSelectL2={onSelectL2}
          onSelectL3={onSelectL3}
          showL2Sidebar={showL2Sidebar}
          hasL3Items={hasL3Items}
        />
      )}

      {/* Main Content */}
      <main
        className={`
          min-h-screen transition-all
          ${isMobile ? 'pt-16' : 'pl-sidebar'}
          ${isMobile && showBottomTabs ? 'pb-20' : ''}
        `}
        style={{ backgroundColor: 'var(--bg-secondary)' }}
      >
        {/* Desktop Breadcrumb */}
        {!isMobile && activeL1 && (
          <div
            className="px-8 py-4 border-b"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--divider-standard)'
            }}
          >
            <Breadcrumb
              activeL1={activeL1}
              activeL2={activeL2}
              activeL3={activeL3}
              onNavigateHome={() => {
                onSelectL1('DASHBOARD' as Level1MenuItem);
              }}
              onNavigateL1={() => {
                if (activeL2) {
                  onBack();
                }
              }}
              onNavigateL2={() => {
                if (activeL3) {
                  onBack();
                }
              }}
            />
          </div>
        )}

        {/* Page Content */}
        <div className="relative">
          {children}
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeL1={activeL1}
        activeL2={activeL2}
        activeL3={activeL3}
        onSelectL1={(item) => {
          onSelectL1(item);
        }}
        onSelectL2={(item) => {
          onSelectL2(item);
        }}
        onSelectL3={(item) => {
          onSelectL3?.(item);
          setIsMobileMenuOpen(false);
        }}
        onBack={onBack}
      />

      {/* Mobile Bottom Tab Bar */}
      {isMobile && showBottomTabs && (
        <BottomTabBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}
    </div>
  );
};

export default AppLayout;
