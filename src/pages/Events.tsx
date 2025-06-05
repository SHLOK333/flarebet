import React from 'react';
import Card from '../components/ui/Card'; // Assume this Card component is Neobrutalistic
import Button from '../components/ui/Button'; // Assume this Button component is Neobrutalistic
// Corrected imports for lucide-react icons.
// Using common icons that are likely to be in all versions of lucide-react.
// If you need specific icons like 'Swords' or 'Gem', please verify their exact names
// on the Lucide Icons website (https://lucide.dev/icons/) and ensure your
// lucide-react package is up to date.
import {
  
  Dribbble,
  Gamepad,
  Sparkles,
  Disc,
  Award,
  ChevronRight
} from 'lucide-react';

// Define a type for your Sport/Game categories
type SportGameCategory = {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType; // Icon component from lucide-react or similar
  link: string; // Link to the specific betting page for this category
};

// Placeholder data for sports and games categories
const sportsGames: SportGameCategory[] = [
  {
    id: 'football',
    name: 'Football',
    description: 'Bet on the biggest football leagues and matches worldwide.',
    icon: Dribbble, // Using Dribbble as a placeholder for Football icon
    link: '/markets/football',
  },
  {
    id: 'basketball',
    name: 'Basketball',
    description: 'Dribble, shoot, and bet on basketball from NBA to international.',
    icon: Dribbble, // Changed from Basketball to Dribbble
    link: '/markets/basketball',
  },
  {
    id: 'esports',
    name: 'Esports',
    description: 'Enter the arena of competitive gaming. Dota 2, LoL, CS:GO, and more.',
    icon: Gamepad, // Using Gamepad instead of Swords
    link: '/markets/esports',
  },
  {
    id: 'crypto-games',
    name: 'Crypto Games',
    description: 'Engage in blockchain-based betting games and predictions.',
    icon: Sparkles, // Using Sparkles instead of Gem
    link: '/markets/crypto-games',
  },
  {
    id: 'dice-games',
    name: 'Dice Games',
    description: 'Simple and thrilling dice-based betting opportunities.',
    icon: Disc, // Using Disc instead of Dice5
    link: '/markets/dice-games',
  },
  {
    id: 'fantasy-leagues',
    name: 'Fantasy Leagues',
    description: 'Draft your dream team and compete in fantasy sports betting.',
    icon: Award, // Using Award instead of Trophy
    link: '/markets/fantasy-leagues',
  },
];

// --- SportGameCard Component - Neobrutalistic ---
type SportGameCardProps = {
  category: SportGameCategory;
};

const SportGameCard: React.FC<SportGameCardProps> = ({ category }) => {
  const Icon = category.icon; // Get the icon component

  return (
    <Card className="relative p-0 overflow-hidden border-4 border-black dark:border-white rounded-none shadow-neobrutal group transition-all duration-100 ease-linear transform hover:-translate-x-1 hover:-translate-y-1 hover:shadow-none active:translate-x-0 active:translate-y-0 active:shadow-neobrutal">
      {/* Dynamic Top Border Indicator based on category or just a consistent color */}
      <div className="h-3 bg-indigo-500 dark:bg-purple-600"></div>

      <div className="p-6 bg-white dark:bg-gray-900 flex flex-col items-center text-center">
        <div className="mb-4">
          {/* Ensure Icon is a valid React component */}
          {Icon && <Icon size={48} className="text-indigo-700 dark:text-purple-400" />}
        </div>
        <h3 className="text-2xl font-extrabold text-black dark:text-white uppercase tracking-tight mb-2">
          {category.name}
        </h3>
        <p className="text-gray-700 dark:text-gray-300 text-sm font-mono mb-6">
          {category.description}
        </p>
        <Button
          onClick={() => window.location.href = category.link} // Navigate to the link
          className="w-full py-3 text-base font-bold rounded-none border-2 border-black dark:border-white shadow-neobrutal-sm bg-blue-500 text-white hover:bg-black hover:text-white transition-all duration-100 ease-linear transform active:translate-x-1 active:translate-y-1 active:shadow-none"
        >
          Explore Markets <ChevronRight size={18} className="ml-2" />
        </Button>
      </div>
    </Card>
  );
};


// --- Main Sports & Games Page Component ---
const Events: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Title & Description - Neobrutalistic */}
      <div className="mb-10 p-4 border-4 border-black dark:border-white shadow-neobrutal bg-white dark:bg-gray-900">
        <h1 className="text-4xl font-extrabold text-black dark:text-white uppercase mb-3 tracking-tighter">
          Sports & Games Betting
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 font-mono">
          Dive into a world of diverse betting opportunities across sports and games.
        </p>
      </div>

      {/* Grid of Sport/Game Cards */}
      <section>
        <h2 className="text-3xl font-bold text-black dark:text-white uppercase mb-6 tracking-wide">
          Choose Your Arena
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sportsGames.map(category => (
            <SportGameCard key={category.id} category={category} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Events;