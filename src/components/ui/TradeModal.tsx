import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react'; // Added Loader2 icon
import Button from './Button';
import { OptionType } from '../../types';
import { ethers } from 'ethers';
import * as FlareEnoughABI from '../../config/FlareEnough.json';
import * as TestUSDCABI from '../../config/TestUSDC.json';
import * as TemporaryClearingHouseABI from '../../config/TemporaryClearingHouse.json';
import { CONTRACTS } from '../../config/index';
import { useNotification } from "@blockscout/app-sdk";
import IndexedDBService from '../../services/IndexedDBService';
import confetti from 'canvas-confetti';

type TradeModalProps = {
  option: OptionType;
  isOpen: boolean;
  onClose: () => void;
  initialSide?: 'buy' | 'sell';
  signer: ethers.Signer | null;
  // Optional: Add a callback for successful trade, e.g., to refresh balances
  onTradeSuccess?: () => void;
};

const TradeModal: React.FC<TradeModalProps> = ({
  option,
  isOpen,
  onClose,
  initialSide = 'buy',
  signer,
  onTradeSuccess
}) => {
  const [amount, setAmount] = useState<string>('1');
  const [side, setSide] = useState<'buy' | 'sell'>(initialSide);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // State for error messages
  const { openTxToast } = useNotification();

  // Reset state when modal opens or option changes
  useEffect(() => {
    if (isOpen) {
      setAmount('1');
      setSide(initialSide);
      setIsLoading(false);
      setError(null);
    }
  }, [isOpen, option, initialSide]);

  if (!isOpen) return null;

  // Calculate total, handling potential parseFloat issues
  const parsedAmount = parseFloat(amount);
  const isValidAmount = !isNaN(parsedAmount) && parsedAmount > 0;
  const total = isValidAmount
    ? (side === 'buy' ? parsedAmount * option.premium : parsedAmount * option.collateral)
    : 0;

  const triggerConfetti = () => {
    const duration = 8000; // Increased duration to 8 seconds
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 9999,
      particleCount: 150
    };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string for temporary input, or valid numbers
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setError(null); // Clear previous errors
    }
  };

  const handleTrade = async () => {
    if (!signer) {
      setError('Wallet not connected. Please connect your wallet.');
      return;
    }
    if (!isValidAmount) {
      setError('Please enter a valid amount greater than zero.');
      return;
    }
    if (total <= 0) {
        setError('Calculated total is zero or less. Please check amount and option details.');
        return;
    }


    setIsLoading(true);
    setError(null); // Clear previous errors

    try {
      const USDC = new ethers.Contract(
        CONTRACTS.TEST_USDC,
        TestUSDCABI.abi,
        signer
      );

      // Ensure amountInWei is calculated from the *total* cost for the trade
      // USDC is 6 decimals, so parseUnits to 6
      const amountToApprove = ethers.utils.parseUnits(total.toFixed(6), 6);
      console.log('Amount to Approve (USDC Wei):', amountToApprove.toString());

      const contract = new ethers.Contract(
        CONTRACTS.FLARE_ENOUGH,
        FlareEnoughABI.abi,
        signer
      );

      const eventId = parseInt(option.eventId); // eventId should be 0-indexed in smart contract, but option.eventId might be 1-indexed from UI
                                              // Ensure consistency: if option.eventId is already 0-indexed for contract, remove -1
      console.log(`Fetching market for eventId: ${eventId}`);
      const marketData = await contract.getMarket(eventId); // Assuming getMarket takes the exact eventId

      console.log('Market Data:', marketData);

      let timelineAddress;
      // It's important to match option.timeline with the contract's outcome strings precisely
      if (marketData.outcome1 === option.timeline) {
        timelineAddress = marketData.clearingHouse1;
      } else if (marketData.outcome2 === option.timeline) {
        timelineAddress = marketData.clearingHouse2;
      } else {
        setError('Selected timeline does not match any known market outcome.');
        setIsLoading(false);
        return;
      }

      if (!timelineAddress || timelineAddress === ethers.constants.AddressZero) {
        setError('Invalid timeline address obtained from market data.');
        setIsLoading(false);
        return;
      }
      console.log('Timeline Address:', timelineAddress);

      // --- Approval Step ---
      const approveTx = await USDC.approve(timelineAddress, amountToApprove);
      openTxToast("Approval Pending...", approveTx.hash); // User-friendly message
      await approveTx.wait();
      openTxToast("Approval Confirmed", approveTx.hash);

      const timelineContract = new ethers.Contract(
        timelineAddress,
        TemporaryClearingHouseABI.abi,
        signer
      );

      let function_name;
      // The amount for minting/depositing options should be the *amount* of options, not the total cost.
      // The total cost (premium/collateral) is handled by the contract based on the amount of options.
      const amountOfOptions = ethers.utils.parseUnits(parsedAmount.toString(), 2); // Assuming options are 2 decimals based on original code

      // Ensure correct strike price and expiration date
      const strikePriceInWei = ethers.utils.parseUnits(option.strike.toString(), 6); // USDC is 6 decimals
      // For expiration, consider passing an actual future date, not a hardcoded one.
      // For now, keeping your existing logic but highlighting it for review.
      const expirationTimestamp = new Date("2025-06-27T08:00:00Z").getTime() / 1000;


      if (side === 'buy') {
        function_name = 'depositAndMintCall';
        // The first parameter for depositAndMintCall is usually the premium amount, not the amount of options
        // However, based on your original code, it seems you were passing `amountInWei` (which is `total`) as the first arg.
        // Let's stick to that assumption for now, but double-check your contract's expected arguments.
        // If the contract expects the total premium, then `amountToApprove` is correct here.
        // If it expects the quantity of options, then `amountOfOptions` should be the first arg.
        const depositAndMintTx = await timelineContract[function_name](
          amountToApprove, // Assuming this is the total premium (USDC)
          option.timelineAddress, // Your option object should likely contain the correct token address
          strikePriceInWei,
          amountOfOptions, // Amount of options to mint
          expirationTimestamp
        );
        openTxToast(`Buying ${parsedAmount} ${option.type.toUpperCase()} options...`, depositAndMintTx.hash);
        await depositAndMintTx.wait();
        openTxToast(`Successfully bought ${parsedAmount} ${option.type.toUpperCase()} options!`, depositAndMintTx.hash);

      } else { // side === 'sell'
        function_name = 'depositAndMintPut';
        // Similar to buy, check contract's first argument. If it expects collateral, `amountToApprove` is correct.
        const depositAndMintTx = await timelineContract[function_name](
          amountToApprove, // Assuming this is the total collateral (USDC)
          option.timelineAddress, // Your option object should likely contain the correct token address
          strikePriceInWei,
          amountOfOptions, // Amount of options to mint
          expirationTimestamp
        );
        openTxToast(`Selling ${parsedAmount} ${option.type.toUpperCase()} options...`, depositAndMintTx.hash);
        await depositAndMintTx.wait();
        openTxToast(`Successfully sold ${parsedAmount} ${option.type.toUpperCase()} options!`, depositAndMintTx.hash);
      }


      // Store trade in IndexedDB
      const db = IndexedDBService.getInstance();
      await db.addTrade({
        eventId: option.eventId,
        timeline: option.timeline,
        type: option.type,
        side: side,
        strike: option.strike,
        premium: option.premium,
        collateral: option.collateral, // Store collateral for sell trades too
        amount: parsedAmount,
        timestamp: Date.now(), // Add a timestamp
        txHash: depositAndMintTx.hash, // Store the transaction hash
        status: 'completed' // Or 'pending' initially
      });

      // Trigger enhanced confetti animation
      triggerConfetti();

      // Call success callback if provided
      if (onTradeSuccess) {
        onTradeSuccess();
      }

      onClose(); // Close modal on success
    } catch (err: any) {
      console.error('Trade failed:', err);
      // More specific error handling
      if (err.code === 'ACTION_REJECTED') {
        setError('Transaction rejected by user.');
      } else if (err.message && err.message.includes('insufficient funds')) {
        setError('Insufficient USDC balance to complete this transaction.');
      } else {
        setError(`Trade failed: ${err.reason || err.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-start mb-6 border-b pb-4 border-border">
          <div>
            <h3 className="text-2xl font-bold text-foreground">
              Trade {option.type.toUpperCase()} Option
            </h3>
            <p className="text-lg text-primary mt-1">
              Strike: ${option.strike.toLocaleString()}
            </p>
            <div className="flex items-center mt-2 text-sm text-amber-600 dark:text-amber-400">
              <AlertTriangle size={16} className="mr-1" />
              <span>Only liquidates if "{option.timeline}" occurs</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="trade-type" className="block text-sm font-medium text-foreground mb-2">
              Select Trade Type
            </label>
            <div className="grid grid-cols-2 gap-3 p-1 rounded-lg bg-muted">
              <Button
                variant={side === 'buy' ? 'primary' : 'ghost'}
                className={`w-full py-3 rounded-lg ${side === 'buy' ? 'bg-primary text-primary-foreground' : 'text-foreground'}`}
                onClick={() => setSide('buy')}
                aria-pressed={side === 'buy'}
              >
                Buy (Long)
              </Button>
              <Button
                variant={side === 'sell' ? 'primary' : 'ghost'}
                className={`w-full py-3 rounded-lg ${side === 'sell' ? 'bg-primary text-primary-foreground' : 'text-foreground'}`}
                onClick={() => setSide('sell')}
                aria-pressed={side === 'sell'}
              >
                Sell (Short)
              </Button>
            </div>
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-foreground mb-2">
              Amount of Options
            </label>
            <input
              id="amount"
              type="number"
              value={amount}
              onChange={handleAmountChange}
              className="w-full px-4 py-3 border border-input rounded-md bg-background text-foreground text-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              min="0.1"
              step="0.1"
              placeholder="e.g., 1.0, 5.5"
            />
             {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <div className="bg-muted rounded-xl p-5 space-y-3 border border-border">
            <h4 className="text-lg font-semibold text-foreground mb-3">Order Summary</h4>
            <div className="flex justify-between text-base">
              <span className="text-muted-foreground">Option Type</span>
              <span className="text-foreground font-medium">{option.type.toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-muted-foreground">Event ID</span>
              <span className="text-foreground font-medium">{option.eventId}</span>
            </div>
            <div className="flex justify-between text-base">
              <span className="text-muted-foreground">Scenario</span>
              <span className="text-foreground font-medium">{option.timeline}</span>
            </div>
            {side === 'buy' && (
              <div className="flex justify-between text-base">
                <span className="text-muted-foreground">Premium per option</span>
                <span className="text-foreground font-medium">${option.premium.toFixed(6)}</span> {/* More decimals for precision */}
              </div>
            )}
            {side === 'sell' && (
              <div className="flex justify-between text-base">
                <span className="text-muted-foreground">Collateral per option</span>
                <span className="text-foreground font-medium">${option.collateral.toFixed(6)}</span> {/* More decimals */}
              </div>
            )}
            <div className="flex justify-between text-base">
              <span className="text-muted-foreground">Quantity</span>
              <span className="text-foreground font-medium">{parsedAmount.toFixed(1)}</span> {/* Show parsed amount with fixed decimals */}
            </div>
            <div className="flex justify-between font-bold text-lg pt-3 border-t border-border">
              <span>{side === 'buy' ? 'Total Cost' : 'Required Collateral'}</span>
              <span>${total.toFixed(6)}</span> {/* More decimals for total */}
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              className="w-full py-3 text-lg font-bold flex items-center justify-center gap-2"
              onClick={handleTrade}
              disabled={isLoading || !isValidAmount || total <= 0}
            >
              {isLoading && <Loader2 size={20} className="animate-spin" />}
              {isLoading ? 'Processing Transaction...' : `${side === 'buy' ? 'Buy' : 'Sell'} Options`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeModal;