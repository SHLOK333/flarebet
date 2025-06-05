import { ethers, run, web3 } from "hardhat";
import { prepareAttestationRequestBase, submitAttestationRequest, retrieveDataAndProofBaseWithRetry } from "./Base";
import path from "path";
import fs from "fs";

const FlareEnough = artifacts.require("FlareEnough");

const { WEB2JSON_VERIFIER_URL_TESTNET, VERIFIER_API_KEY_TESTNET, COSTON2_DA_LAYER_URL } = process.env;


// Post data apiURL
async function setData() {
    const apiUrl = "";
    const data = {
        name: "",
        eventId: 0,
        eventHappened: false,
    }

    const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    console.log("Response status:", response.status);
}

// Request data
const apiUrl = "";
const postProcessJq = `{name: .name, eventId: .eventId, eventHappened: .eventHappened}`;
const httpMethod = "GET";
// Defaults to "Content-Type": "application/json"
const headers = "{}";
const queryParams = "{}";
const body = "{}";
const abiSignature = `{
          "components": [
            {
              "internalType": "uint256",
              "name": "eventId",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "bool",
              "name": "eventHappened",
              "type": "bool"
            }
          ],
          "internalType": "struct DataTransportObject",
          "name": "dto",
          "type": "tuple"
        }`;

// // Configuration constants
const attestationTypeBase = "Web2Json";
const sourceIdBase = "PublicWeb2";
const verifierUrlBase = WEB2JSON_VERIFIER_URL_TESTNET;

async function prepareAttestationRequest(apiUrl: string, postProcessJq: string, abiSignature: string) {
    const requestBody = {
        url: apiUrl,
        httpMethod: httpMethod,
        headers: headers,
        queryParams: queryParams,
        body: body,
        postProcessJq: postProcessJq,
        abiSignature: abiSignature,
    };

    const url = `${verifierUrlBase}Web2Json/prepareRequest`;
    const apiKey = VERIFIER_API_KEY_TESTNET as string;
    return await prepareAttestationRequestBase(url, apiKey, attestationTypeBase, sourceIdBase, requestBody);
}

async function retrieveDataAndProof(abiEncodedRequest: string, roundId: number) {
    const url = `${COSTON2_DA_LAYER_URL}api/v1/fdc/proof-by-request-round-raw`;
    console.log("Url:", url, "n");
    return await retrieveDataAndProofBaseWithRetry(url, abiEncodedRequest, roundId);
}

async function getFlareEnoughContract() {
  const [deployer] = await ethers.getSigners();
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
  return flareEnough;
}

async function interactWithContract(dataContract: any, proof: any) {
    console.log("Proof hex:", proof.response_hex, "\n");

    // A piece of black magic that allows us to read the response type from an artifact
    const IWeb2JsonVerification = await artifacts.require("IWeb2JsonVerification");
    const responseType = IWeb2JsonVerification._json.abi[0].inputs[0].components[1];
    console.log("Response type:", responseType, "\n");

    const decodedResponse = web3.eth.abi.decodeParameter(responseType, proof.response_hex);
    console.log("Decoded proof:", decodedResponse, "\n");
    const transaction = await dataContract.addEvent({
        merkleProof: proof.proof,
        data: decodedResponse,
    });
    console.log("Transaction:", transaction.hash, "\n");
}

async function main() {
    await setData();
    const data = await prepareAttestationRequest(apiUrl, postProcessJq, abiSignature);
    console.log("Data:", data, "\n");

    const abiEncodedRequest = data.abiEncodedRequest;
    const roundId = await submitAttestationRequest(abiEncodedRequest);

    const proof = await retrieveDataAndProof(abiEncodedRequest, roundId);
    console.log("Proof:", proof, "\n");

    const dataContract: any = await getFlareEnoughContract();

    await interactWithContract(dataContract, proof);
}

void main().then(() => {
    process.exit(0);
});