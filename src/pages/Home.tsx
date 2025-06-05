import React, { useState } from 'react';
import { ArrowRight, Clock, Dribbble, Trophy, Zap, Users, ChevronDown, ChevronUp } from 'lucide-react'; // Added ChevronDown, ChevronUp
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { getTimelineLabel } from '../utils/general';
import { useMarket } from '../context/MarketContext';
import { useNotification } from "@blockscout/app-sdk";

type HeaderProps = {
  setActivePage: (page: 'home' | 'markets' | 'events') => void;
};

const Home: React.FC<HeaderProps> = ({ setActivePage }) => {
  const { openTxToast } = useNotification();
  const { events, selectEvent, selectTimeline, loading, error } = useMarket();
  const featuredEvents = events.filter(event => !event.resolved).slice(0, 3); // Still take 3 for featured

  const handleTimelineClick = (eventId: string, timeline: string) => {
    selectEvent(eventId);
    // @ts-ignore
    selectTimeline(timeline);
    setActivePage('markets');
  };

  return (
    <div className="flex flex-col bg-[#e0f2fe] dark:bg-[#0f172a] font-sans text-gray-900 dark:text-white">

      {/* Hero Section - Sports Theme */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-purple-900 text-white border-b-8 border-yellow-400 dark:border-yellow-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="md:flex md:items-center md:justify-between gap-10">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
                SportPulse
              </h1>
              <p className="text-xl text-blue-100 dark:text-blue-200 leading-relaxed mb-8">
                Predict the thrilling moments of sports. Choose scenarios, play against the odds, and win big!
              </p>
              <div className="flex gap-4 flex-wrap">
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold uppercase rounded-full px-8 py-4 shadow-lg transform transition duration-300 hover:scale-105"
                  onClick={() => setActivePage('markets')}
                >
                  Place Your Bets <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-white text-white font-bold uppercase rounded-full px-8 py-4 shadow-lg transform transition duration-300 hover:bg-white hover:text-blue-700"
                >
                  How to Play
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 bg-white dark:bg-gray-800 border-4 border-yellow-400 dark:border-yellow-600 p-8 rounded-lg shadow-2xl transform rotate-3">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Trophy className="h-7 w-7 mr-3 text-yellow-500" />
                  <div>
                    <div className="font-bold text-xl text-gray-900 dark:text-white">World Cup Final 2026</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Match in 15 days</div>
                  </div>
                </div>
                <span className="text-sm font-bold px-4 py-2 bg-green-500 text-white uppercase rounded-full">Live Betting</span>
              </div>

              <div className="space-y-4">
                <div className="text-sm font-semibold uppercase text-gray-700 dark:text-gray-300">If Brazil Wins:</div>
                <div className="grid grid-cols-2 gap-4">
                  <BetBox label="Score Over 2.5 Goals" value="$75,000" payout="$3,500" positive />
                  <BetBox label="Clean Sheet" value="$60,000" payout="$2,800" />
                </div>
                <div className="text-sm font-semibold uppercase mt-4 text-gray-700 dark:text-gray-300">If Argentina Wins:</div>
                <div className="grid grid-cols-2 gap-4">
                  <BetBox label="Messi Scores First" value="$80,000" payout="$4,000" positive />
                  <BetBox label="Extra Time Needed" value="$55,000" payout="$2,200" />
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button className="px-6 py-3 bg-blue-600 text-white font-bold text-base rounded-full shadow-lg transform transition duration-300 hover:scale-105 hover:bg-blue-700">
                  View All Scenarios
                </button>
                <button className="px-6 py-3 bg-yellow-400 text-blue-900 font-bold text-base rounded-full shadow-lg transform transition duration-300 hover:scale-105 hover:bg-yellow-500">
                  Place Your Prediction
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works - Sports Themed */}
      <section className="py-20 bg-blue-100 dark:bg-gray-900 border-t-8 border-yellow-400 dark:border-yellow-600">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-extrabold mb-6 uppercase text-gray-900 dark:text-white">The Game Rules</h2>
            <p className="text-xl max-w-2xl mx-auto text-gray-700 dark:text-gray-300">Unravel the dynamics of SportPulse and how your predictions come to life.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <FeatureCard
              icon={<Dribbble className="h-8 w-8" />}
              title="Dynamic Scenarios"
              description="Bet on various outcomes that branch from a core sports event."
            />
            <FeatureCard
              icon={<Zap className="h-8 w-8" />}
              title="Instant Settlement"
              description="Winnings are settled swiftly once the real-world event concludes."
            />
            <FeatureCard
              icon={<Users className="h-8 w-8" />}
              title="Community Driven Markets"
              description="Participate in markets proposed and refined by the sports community."
            />
          </div>
        </div>
      </section>

      {/* Featured Markets Section (added for context to use MarketCard) */}
      <section className="py-20 bg-[#e0f2fe] dark:bg-[#0f172a]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold mb-4 text-gray-900 dark:text-white">Featured Sports Events</h2>
            <p className="text-lg text-gray-700 dark:text-gray-300">Don't miss out on these exciting upcoming events!</p>
          </div>
          {loading && <p className="text-center text-lg text-gray-700 dark:text-gray-300">Loading events...</p>}
          {error && <p className="text-center text-red-500 text-lg">Error loading events: {error.message}</p>}
          {!loading && !error && featuredEvents.length === 0 && (
            <p className="text-center text-lg text-gray-700 dark:text-gray-300">No featured events available at the moment.</p>
          )}
          <div className="grid md:grid-cols-3 gap-8">
            {featuredEvents.map(event => (
              <MarketCard
                key={event.id}
                title={event.title}
                description={event.description}
                date={new Date(event.date).toLocaleDateString()}
                active={!event.resolved} // Assuming 'resolved' means not active
                timelines={event.timelines.map((t: { id: string; }) => t.id)} // Pass timeline IDs
                onTimelineClick={(timelineId) => handleTimelineClick(event.id, timelineId)}
              />
            ))}
          </div>
        </div>
      </section>


      {/* CTA Section - Sports Themed */}
      <section className="bg-gradient-to-r from-blue-800 to-purple-900 text-white border-t-8 border-yellow-400 dark:border-yellow-600 py-16">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h2 className="text-4xl font-extrabold mb-2">Ready to make your winning move?</h2>
            <p className="text-lg text-blue-200">Join SportPulse and become a champion of predictions.</p>
          </div>
          <div className="flex gap-4">
            <Button
              variant="secondary"
              size="lg"
              className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold uppercase rounded-full px-8 py-4 shadow-lg transform transition duration-300 hover:scale-105"
              onClick={() => setActivePage('markets')}
            >
              Bet Now!
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-white text-white font-bold uppercase rounded-full px-8 py-4 shadow-lg transform transition duration-300 hover:bg-white hover:text-blue-700"
            >
              Watch Tutorial
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

const BetBox = ({ label, value, payout, positive }: { label: string; value: string; payout: string; positive?: boolean }) => (
  <div className="p-4 bg-gray-100 dark:bg-gray-700 border-2 border-blue-400 dark:border-blue-600 rounded-lg shadow-md">
    <div className="flex justify-between items-center mb-1">
      <span className={`text-sm font-bold ${positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {label}
      </span>
      <span className="text-lg font-bold text-gray-900 dark:text-white">{value}</span>
    </div>
    <div className="text-xs text-gray-600 dark:text-gray-400">Potential Payout: {payout}</div>
  </div>
);

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <Card className="p-8 border-4 border-yellow-400 dark:border-yellow-600 shadow-xl bg-white dark:bg-gray-800 text-center rounded-lg transform hover:scale-105 transition duration-300">
    <div className="w-16 h-16 bg-blue-600 dark:bg-blue-800 text-white flex items-center justify-center rounded-full mx-auto mb-6 text-3xl">
      {icon}
    </div>
    <h3 className="text-2xl font-extrabold uppercase mb-3 text-gray-900 dark:text-white">{title}</h3>
    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{description}</p>
  </Card>
);

type MarketCardProps = {
  title: string;
  description: string;
  date: string;
  active: boolean;
  timelines: string[];
  onTimelineClick: (timeline: string) => void;
};

const MarketCard: React.FC<MarketCardProps> = ({
  title,
  description,
  date,
  active,
  timelines,
  onTimelineClick
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card hover className="border-4 border-blue-400 dark:border-blue-600 shadow-xl bg-white dark:bg-gray-800 flex flex-col p-6 rounded-lg h-[350px] transform hover:scale-105 transition duration-300 relative"> {/* Added relative for dropdown positioning */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-xl text-gray-900 dark:text-white">{title}</h3>
        {active && (
          <span className="bg-green-500 text-white text-xs px-3 py-1 font-bold uppercase rounded-full">Live</span>
        )}
      </div>
      <p className="text-sm mb-4 text-gray-600 dark:text-gray-400 line-clamp-3">{description}</p>
      <div className="text-sm mb-4 flex items-center text-gray-700 dark:text-gray-300">
        <Clock className="mr-2 h-4 w-4 text-blue-500" /> Event Date: {date}
      </div>
      <div className="mt-auto relative"> {/* Made this relative for dropdown */}
        <Button
          variant="secondary"
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-blue-900 font-bold uppercase text-sm rounded-full px-4 py-2 shadow-sm flex justify-between items-center"
          onClick={() => setIsOpen(!isOpen)}
        >
          Select Scenario
          {isOpen ? <ChevronUp className="ml-2 h-5 w-5" /> : <ChevronDown className="ml-2 h-5 w-5" />}
        </Button>
        {isOpen && (
          <div className="absolute bottom-full left-0 w-full bg-white dark:bg-gray-700 border border-blue-300 dark:border-blue-500 rounded-lg shadow-lg z-10 mb-2 max-h-48 overflow-y-auto">
            {timelines.length > 0 ? (
              timelines.map((timeline, index) => (
                <button
                  key={index}
                  className="block w-full text-left px-4 py-2 text-gray-800 dark:text-white hover:bg-blue-100 dark:hover:bg-gray-600 transition duration-150 ease-in-out"
                  onClick={() => {
                    onTimelineClick(timeline);
                    setIsOpen(false); // Close dropdown after selection
                  }}
                >
                  {getTimelineLabel(timeline)}
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500 dark:text-gray-400">No scenarios available</div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default Home;