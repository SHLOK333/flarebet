import { ethers, network } from "hardhat";
import path from "path";
import fs from "fs";

async function main() {
  const [deployer] = await ethers.getSigners();

  // Construct path to the Ignition deployment file
  const deploymentPath = path.join(
    __dirname,
    `../ignition/deployments/chain-114/deployed_addresses.json`
  );

  // Load the deployment JSON
  const deploymentJson = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));

  // Get the deployed address
  const flareEnoughAddress = deploymentJson["DeployFactoryWithTestUSDC#FlareEnough"];

  // @ts-ignore
  const flareEnough = await ethers.getContractAt("FlareEnough", flareEnoughAddress, deployer);

  // get total number of markets
  const totalMarkets = await flareEnough.getMarketsCount();
  const testUSDC = await ethers.getContractAt(
    "TestUSDC",
    deploymentJson["DeployFactoryWithTestUSDC#TestUSDC"],
    // @ts-ignore
    deployer
    );

  for (let i = 0; i < totalMarkets; i++) {
    const market = await flareEnough.getMarket(i);
    const clearingHouse1 = await ethers.getContractAt(
        "TemporaryClearingHouse",
        market.clearingHouse1,
        // @ts-ignore
        deployer
    );

    // Approve USDC transfer
    const amountInWei = ethers.parseUnits("1000000", 6); // Assuming USDC has 6 decimals
    const approveTx = await testUSDC.approve(market.clearingHouse1, amountInWei);  
    await approveTx.wait();
    console.log(`  Approved USDC transfer for Clearing House 1: ${approveTx.hash}`);

    const deposit = await clearingHouse1.depositUsdc(amountInWei);
    await deposit.wait();
    console.log(`  Deposited USDC to Clearing House 1: ${deposit.hash}`);
  }

  // Transfer USDC to 0xA9E78cef5e6c0081b68AdA2554c04198DfF17C69 for testing purposes
  const transferAmount = ethers.parseUnits("1000000", 6); // 1 million USDC
  const transferTx = await testUSDC.transfer(
    "0xA9E78cef5e6c0081b68AdA2554c04198DfF17C69",
    transferAmount
  );
  await transferTx.wait();
  console.log(`Transferred 1 million USDC to 0xA9E78cef5e6c0081b68AdA2554c04198DfF17C69: ${transferTx.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
