import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("DeployFactoryWithTestUSDC", (m) => {
  const testUSDC = m.contract("TestUSDC");
  const flareEnough = m.contract("FlareEnough", [testUSDC]);

  // Call createMarket on the FlareEnough contract
  const markets = [
    {
      name: "Magnus Carlsen vs. Gukesh Norway Chess",
      description: "Outcome of the Norway Chess 2025 match between Magnus Carlsen and D. Gukesh.",
      outcome1: "Carlsen Wins",
      outcome2: "Gukesh Wins",
      event_date: +new Date("2025-06-10T15:00:00Z"), // Adjust date to be relevant (e.g., in a few days)
    },
    {
      name: "NBA Finals 2025: Series Winner",
      description: "Who will win the 2025 NBA Finals series?",
      outcome1: "Boston Celtics",
      outcome2: "Dallas Mavericks",
      event_date: +new Date("2025-06-20T03:00:00Z"), // Approx date for end of NBA Finals
    },
    {
      name: "Euro 2024 Final Result", // Renamed to Euro 2024 as 2025 doesn't have it
      description: "Which team will win the European Football Championship 2024 final?",
      outcome1: "England",
      outcome2: "France",
      event_date: +new Date("2024-07-14T20:00:00Z"), // Corrected to 2024 and relevant date. Note: Past date, but for mock, it works.
                                                    // If you need it in future, change to a hypothetical future Euro/World Cup.
    },
    {
      name: "Cricket World Cup 2027: Champion",
      description: "Which nation will lift the ICC Cricket World Cup trophy in 2027?",
      outcome1: "India",
      outcome2: "Australia",
      event_date: +new Date("2027-11-20T10:00:00Z"), // Future date for CWC 2027
    },
    {
      name: "F1 World Drivers' Championship 2025",
      description: "Who will be crowned the Formula 1 World Drivers' Champion in 2025?",
      outcome1: "Max Verstappen",
      outcome2: "Charles Leclerc",
      event_date: +new Date("2025-12-07T14:00:00Z"), // Approx date for F1 season end
    }
  ];

  markets.forEach((market) => {
    m.call(flareEnough, "createMarket", [
      market.name,
      market.description,
      market.outcome1,
      market.outcome2,
      market.event_date,
    ], {id: `createMarket_${market.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}`}); // More robust ID for readability in Hardhat Ignition
  });

  return { testUSDC, flareEnough };
});