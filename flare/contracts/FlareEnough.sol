// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {ContractRegistry} from "@flarenetwork/flare-periphery-contracts/coston2/ContractRegistry.sol";
import {IWeb2Json} from "@flarenetwork/flare-periphery-contracts/coston2/IWeb2Json.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./TemporaryClearingHouse.sol";


struct EventData {
    string name;
    bool eventHappened;
}

struct DataTransportObject {
    uint256 eventId;
    string name;
    bool eventHappened;
}

contract FlareEnough is Ownable {
    mapping(uint256 => EventData) public events;

    function addEvent(IWeb2Json.Proof calldata data) public {
        require(isJsonApiProofValid(data), "Invalid proof");

        DataTransportObject memory dto = abi.decode(
            data.data.responseBody.abiEncodedData,
            (DataTransportObject)
        );

        // require(events[dto.eventId].name == "", "Character already exists");

        EventData memory ed = EventData({
            name: dto.name,
            eventHappened: dto.eventHappened
        });

        events[dto.eventId] = ed;
        if (dto.eventHappened) {
            setMarketStatus(dto.eventId, Status.Outcome1);
        } else {
            setMarketStatus(dto.eventId, Status.Outcome2);
        }
    }

    function abiSignatureHack(DataTransportObject calldata dto) public pure {}

    function isJsonApiProofValid(
        IWeb2Json.Proof calldata _proof
    ) private view returns (bool) {
        // Inline the check for now until we have an official contract deployed
        return ContractRegistry.getFdcVerification().verifyJsonApi(_proof);
    }

    enum Status { Pending, Outcome1, Outcome2 }

    struct Market {
        string title;
        string description;
        string outcome1;
        string outcome2;
        TemporaryClearingHouse clearingHouse1;
        TemporaryClearingHouse clearingHouse2;
        uint256 event_date;
        Status status;
    }

    Market[] public markets;
    IERC20 public usdcToken;

    event MarketCreated(uint256 marketId);

    constructor(IERC20 _usdcToken) Ownable(msg.sender) {
        usdcToken = _usdcToken;
    }

    function createMarket(string memory title, string memory description, string memory outcome1, string memory outcome2, uint256 event_date) external onlyOwner {
        uint256 marketId = markets.length;
        markets.push();

        Market storage newMarket = markets[marketId];
        newMarket.title = title;
        newMarket.description = description;
        newMarket.outcome1 = outcome1;
        newMarket.outcome2 = outcome2;
        newMarket.clearingHouse1 = new TemporaryClearingHouse(usdcToken);
        newMarket.clearingHouse2 = new TemporaryClearingHouse(usdcToken);
        newMarket.event_date = event_date;
        newMarket.status = Status.Pending;

        emit MarketCreated(marketId);
    }

    function setMarketStatus(uint256 marketId, Status newStatus) internal {
        require(marketId < markets.length, "Market does not exist");
        require(markets[marketId].status == Status.Pending, "Market must be in Pending status to change");
        markets[marketId].status = newStatus;
        if (newStatus == Status.Outcome1) {
            markets[marketId].clearingHouse1.continueSystem();
            markets[marketId].clearingHouse2.abortSystem();
        } else if (newStatus == Status.Outcome2) {
            markets[marketId].clearingHouse1.abortSystem();
            markets[marketId].clearingHouse2.continueSystem();
        } else {
            revert("Invalid status");
        }
    }

    function getMarket(uint256 marketId) external view returns (Market memory) {
        require(marketId < markets.length, "Market does not exist");
        return markets[marketId];
    }

    function getMarketsCount() external view returns (uint256) {
        return markets.length;
    }
}