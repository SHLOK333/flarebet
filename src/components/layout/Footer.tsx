import React from 'react';
import { Trophy, Twitter, Github, Globe, ChevronRight } from 'lucide-react'; // Added Trophy for logo, Globe for general link, ChevronRight for button

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black dark:bg-gray-950 border-t-4 border-white dark:border-black mt-auto shadow-neobrutal-top py-8 sm:py-12 relative overflow-hidden">
      {/* Background Grid/Lines - Neobrutalistic */}
      <div className="absolute inset-0 z-0 opacity-5 dark:opacity-10">
        <div className="absolute inset-0 bg-repeat bg-[size:30px_30px] [background-image:linear-gradient(to_right,theme(colors.gray.700)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.gray.700)_1px,transparent_1px)] dark:bg-[size:30px_30px] dark:[background-image:linear-gradient(to_right,theme(colors.gray.200)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.gray.200)_1px,transparent_1px)]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="md:flex md:justify-between items-start">
          {/* Brand Info */}
          <div className="mb-8 md:mb-0 max-w-sm">
            <div className="flex items-center group cursor-pointer">
              <div className="h-10 w-10 bg-red-500 dark:bg-blue-500 border-2 border-white dark:border-black flex items-center justify-center transform -translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-100">
                <Trophy size={24} className="text-white group-hover:scale-110 transition-transform" />
              </div>
              <span className="ml-3 text-2xl font-extrabold text-white uppercase tracking-tighter select-none border-b-2 border-white pb-1 group-hover:border-red-500 dark:group-hover:border-blue-500 transition-colors duration-100">
                SportPulse
              </span>
            </div>
            <p className="mt-4 text-md text-gray-300 dark:text-gray-400 font-mono leading-relaxed">
              Precision markets powered by conditional logic on the Flare network. Bet smarter, win bolder.
            </p>
            <div className="mt-6">
              <a
                href="#top" // Example link to scroll to top
                className="inline-flex items-center justify-center px-6 py-2 border-2 border-white dark:border-black text-white dark:text-black bg-red-500 dark:bg-blue-500 text-sm font-bold uppercase rounded-none shadow-neobrutal-white dark:shadow-neobrutal transition-all duration-100 ease-linear transform active:translate-x-1 active:translate-y-1 active:shadow-none hover:bg-white hover:text-black dark:hover:bg-black dark:hover:text-white"
              >
                Launch App <ChevronRight size={18} className="ml-2" />
              </a>
            </div>
          </div>

          {/* Navigation Links Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-12 lg:gap-16">
            <FooterSection title="Platform">
              <FooterLink label="Markets" href="#" />
              <FooterLink label="Events" href="#" />
              <FooterLink label="How it Works" href="#" />
            </FooterSection>

            <FooterSection title="Resources">
              <FooterLink label="Documentation" href="#" />
              <FooterLink label="Tutorials" href="#" />
              <FooterLink label="FAQ" href="#" />
              <FooterLink label="Blog" href="#" />
            </FooterSection>

            <FooterSection title="Legal">
              <FooterLink label="Privacy Policy" href="#" />
              <FooterLink label="Terms of Service" href="#" />
              <FooterLink label="Disclaimer" href="#" />
            </FooterSection>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t-2 border-gray-700 dark:border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center text-center">
          <p className="text-sm font-mono text-gray-400 dark:text-gray-500 mb-4 md:mb-0">
            &copy; {currentYear} SportPulse. All rights reserved. Built with Flare.
          </p>
          <div className="flex space-x-6">
            <SocialLink icon={Twitter} label="Twitter" href="#" />
            <SocialLink icon={Github} label="GitHub" href="#" />
            <SocialLink icon={Globe} label="Website" href="#" /> {/* Generic website icon */}
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- Helper Components for Footer structure and styling ---

// Footer Section Title
const FooterSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h3 className="text-base font-extrabold text-white dark:text-gray-200 uppercase tracking-widest mb-4 border-b-2 border-red-500 dark:border-blue-500 pb-1 inline-block">
      {title}
    </h3>
    <ul className="mt-4 space-y-3">
      {children}
    </ul>
  </div>
);

// Footer Navigation Link
const FooterLink: React.FC<{ label: string; href: string }> = ({ label, href }) => (
  <li>
    <a
      href={href}
      className="text-lg font-bold text-gray-300 dark:text-gray-400 hover:text-red-500 dark:hover:text-blue-500 transition-colors duration-100 ease-linear relative group inline-block"
    >
      {label}
      {/* Exaggerated underline on hover */}
      <span className="absolute left-0 bottom-0 w-0 h-[3px] bg-red-500 dark:bg-blue-500 group-hover:w-full transition-all duration-150 ease-linear"></span>
    </a>
  </li>
);

// Social Media Link
const SocialLink: React.FC<{ icon: React.ElementType; label: string; href: string }> = ({ icon: Icon, label, href }) => (
  <a
    href={href}
    className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-blue-500 transition-colors duration-100 ease-linear
               p-2 border-2 border-transparent hover:border-red-500 dark:hover:border-blue-500 rounded-none
               transform hover:-translate-y-1 active:translate-y-0 shadow-neobrutal-sm hover:shadow-none dark:hover:shadow-neobrutal-sm-white
               focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-blue-500"
    target="_blank"
    rel="noopener noreferrer"
    title={label}
  >
    <span className="sr-only">{label}</span>
    <Icon size={24} className="transform group-hover:scale-110 transition-transform duration-100" />
  </a>
);

export default Footer;