import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useWallet } from '../../context/WalletContext';
import { Menu, X, Sun, Moon, History, Wallet, Zap, Trophy } from 'lucide-react'; // Added Trophy for logo
import Button from '../ui/Button'; // Assuming your Button component is robust
import Dialog from '../ui/Dialog'; // Assuming your Dialog component exists
import { useTransactionPopup } from "@blockscout/app-sdk";

// --- Header Props ---
type HeaderProps = {
  setActivePage: (page: 'home' | 'markets' | 'events') => void;
  activePage: 'home' | 'markets' | 'events';
};

// --- Main Header Component ---
const Header: React.FC<HeaderProps> = ({ setActivePage, activePage }) => {
  const { theme, toggleTheme } = useTheme();
  const { isConnected, address, connectWallet, disconnectWallet } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const { openPopup } = useTransactionPopup();

  // Close mobile menu on page change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [activePage]);

  // Handle outside clicks to close mobile menu
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (mobileMenuOpen) {
        const mobileMenu = document.getElementById('neobrutal-mobile-menu');
        const menuButton = document.getElementById('neobrutal-menu-button');
        if (mobileMenu && !mobileMenu.contains(event.target as Node) && menuButton && !menuButton.contains(event.target as Node)) {
          setMobileMenuOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [mobileMenuOpen]);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleWalletClick = () => {
    if (isConnected) {
      setShowDisconnectDialog(true);
    } else {
      connectWallet();
    }
  };

  const handleTransactionHistory = () => {
    openPopup({
      chainId: "114", // Ensure this matches your network's chain ID (Coston2 is 114)
      address: address as string,
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white dark:bg-black border-b-4 border-black dark:border-white shadow-neobrutal transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo & Brand - Neobrutalistic */}
          <div
            className="flex items-center cursor-pointer group"
            onClick={() => setActivePage('home')}
          >
            <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 bg-red-500 dark:bg-blue-500 border-4 border-black dark:border-white transform -translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-100">
              <Trophy size={28} className="text-white group-hover:scale-110 transition-transform" />
            </div>
            <span className="ml-4 text-2xl sm:text-3xl font-extrabold text-black dark:text-white uppercase tracking-tighter cursor-pointer select-none border-b-4 border-black dark:border-white pb-1 group-hover:border-red-500 dark:group-hover:border-blue-500 transition-colors duration-100">
              SportPulse
            </span>
          </div>

          {/* Desktop Navigation - Neobrutalistic */}
          <nav className="hidden md:flex space-x-2 lg:space-x-4 ml-10">
            <NavItem
              label="Home"
              isActive={activePage === 'home'}
              onClick={() => setActivePage('home')}
            />
            <NavItem
              label="Markets"
              isActive={activePage === 'markets'}
              onClick={() => setActivePage('markets')}
            />
            <NavItem
              label="Events"
              isActive={activePage === 'events'}
              onClick={() => setActivePage('events')}
            />
          </nav>

          {/* Right side buttons - Neobrutalistic */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-3 bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors duration-100 shadow-neobrutal-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={20} className="transform hover:rotate-12 transition-transform" /> : <Moon size={20} className="transform hover:-rotate-12 transition-transform" />}
            </button>

            {/* Transaction History button - only shown when connected */}
            {isConnected && (
              <button
                onClick={handleTransactionHistory}
                className="p-3 bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors duration-100 shadow-neobrutal-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white"
                title="View Transaction History"
              >
                <History size={20} />
              </button>
            )}

            {/* Connect wallet button */}
            <Button
              className="ml-2 hidden sm:block text-sm sm:text-base font-bold px-4 py-2 sm:px-5 sm:py-2.5 rounded-none border-2 border-black dark:border-white shadow-neobrutal bg-red-500 dark:bg-blue-500 text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-100 ease-linear transform active:translate-x-1 active:translate-y-1 active:shadow-none"
              onClick={handleWalletClick}
            >
              {isConnected ? formatAddress(address!) : <><Zap size={18} className="inline-block mr-2" /> Connect Wallet</>}
            </Button>

            {/* Mobile menu button */}
            <div className="md:hidden ml-4">
              <button
                onClick={() => setMobileMenuOpen((open) => !open)}
                id="neobrutal-menu-button"
                className="p-3 bg-white dark:bg-black border-2 border-black dark:border-white text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors duration-100 shadow-neobrutal-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu - Neobrutalistic */}
      {mobileMenuOpen && (
        <div
          id="neobrutal-mobile-menu"
          className="md:hidden fixed inset-0 top-20 bg-white dark:bg-black border-t-4 border-black dark:border-white z-40 flex flex-col pt-8 pb-4 animate-slide-in-down"
        >
          <nav className="space-y-1 px-4 sm:px-6 w-full">
            <MobileNavItem
              label="Home"
              isActive={activePage === 'home'}
              onClick={() => {
                setActivePage('home');
                setMobileMenuOpen(false);
              }}
            />
            <MobileNavItem
              label="Markets"
              isActive={activePage === 'markets'}
              onClick={() => {
                setActivePage('markets');
                setMobileMenuOpen(false);
              }}
            />
            <MobileNavItem
              label="Events"
              isActive={activePage === 'events'}
              onClick={() => {
                setActivePage('events');
                setMobileMenuOpen(false);
              }}
            />
            {isConnected && (
              <MobileNavItem
                label="Transaction History"
                isActive={false}
                onClick={() => {
                  handleTransactionHistory();
                  setMobileMenuOpen(false);
                }}
              />
            )}
          </nav>
          <div className="pt-8 px-4 w-full">
            <Button
              className="w-full text-base font-bold py-3 rounded-none border-2 border-black dark:border-white shadow-neobrutal bg-red-500 dark:bg-blue-500 text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all duration-100 ease-linear transform active:translate-x-1 active:translate-y-1 active:shadow-none"
              onClick={handleWalletClick}
            >
              {isConnected ? formatAddress(address!) : 'Connect Wallet'}
            </Button>
          </div>
        </div>
      )}

      {/* Disconnect Dialog */}
      <Dialog
        isOpen={showDisconnectDialog}
        onClose={() => setShowDisconnectDialog(false)}
        onConfirm={() => {
          disconnectWallet();
          setShowDisconnectDialog(false); // Close after confirming
        }}
        title="Disconnect Wallet"
        description="Are you sure you want to disconnect your wallet?"
        confirmText="Disconnect"
        cancelText="Cancel"
      />
    </header>
  );
};

// --- NavItem Component for Desktop Navigation ---
type NavItemProps = {
  label: string;
  isActive: boolean;
  onClick: () => void;
};

const NavItem: React.FC<NavItemProps> = ({ label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`relative px-4 py-2 text-lg font-bold uppercase transition-all duration-100 ease-linear group
        ${isActive
          ? 'text-red-500 dark:text-blue-500 border-b-4 border-red-500 dark:border-blue-500' // Active state
          : 'text-black dark:text-white hover:text-red-500 dark:hover:text-blue-500 hover:border-b-4 hover:border-black dark:hover:border-white' // Inactive state
        }
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white
      `}
      aria-current={isActive ? 'page' : undefined}
    >
      {label}
      {/* Exaggerated hover effect */}
      <span className="absolute bottom-0 left-0 w-full h-1 bg-red-500 dark:bg-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-100 origin-left"></span>
    </button>
  );
};

// --- MobileNavItem Component for Mobile Menu ---
const MobileNavItem: React.FC<NavItemProps> = ({ label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`block px-6 py-4 text-xl font-bold uppercase w-full text-left border-2 border-black dark:border-white shadow-neobrutal-sm mb-4 last:mb-0
        ${isActive
          ? 'bg-red-500 dark:bg-blue-500 text-white'
          : 'bg-white dark:bg-black text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-800'
        }
        transition-all duration-100 ease-linear transform active:translate-x-1 active:translate-y-1 active:shadow-none
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black dark:focus:ring-white
      `}
    >
      {label}
    </button>
  );
};

export default Header;