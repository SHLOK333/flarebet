// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import {TestFtsoV2Interface} from "@flarenetwork/flare-periphery-contracts/coston2/TestFtsoV2Interface.sol";
import {ContractRegistry} from "@flarenetwork/flare-periphery-contracts/coston2/ContractRegistry.sol";
import {IFeeCalculator} from "@flarenetwork/flare-periphery-contracts/coston2/IFeeCalculator.sol";

import "./ITemporaryClearingHouse.sol";

// Clearing House for options settlement
contract TemporaryClearingHouse is ITemporaryClearingHouse, AccessControl, ReentrancyGuard {
    uint256 public constant USDC = 1e6;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct Option {
        address buyer;
        address seller;
        uint256 strikePriceUSDC;
        uint256 quantityBtc;
        uint256 expiry;
        bool exercised;
        bool destroyed;
    }

    struct Order {
        address owner;
        bool isCall; // true -> CallOption, false -> PutOption
        uint256 optionId;
        uint256 premiumUSDC;
        bool active;
    }

    IERC20 public usdcToken;

    // Balances of users which will take affect if this Clearing House is aborted
    mapping(address => uint256) public deposits;

    // Balances of users which will take effect if this Clearing House is continued
    mapping(address => uint256) public virtualBalances;

    Option[] public callOptions;
    Option[] public putOptions;

    // All active and inactive orders
    Order[] public orderBook;

    // Status of the clearing house
    Status public status; 

    constructor(IERC20 _usdcToken) {
        _grantRole(ADMIN_ROLE, msg.sender);
        usdcToken = _usdcToken;
    }

    modifier notAborted() {
        require(status != Status.Aborted, "System aborted");
        _;
    }

    modifier pending() {
        require(status == Status.Pending, "System not in pending state");
        _;
    }

    function depositUsdc(uint256 usdcAmount) public pending {
        usdcToken.transferFrom(msg.sender, address(this), usdcAmount);
        deposits[msg.sender] += usdcAmount;
        virtualBalances[msg.sender] += usdcAmount;
        emit Deposited(msg.sender, usdcAmount);
    }

    // Only allow withdrawal if the system is not in pending state
    function withdraw() public nonReentrant {
        if (status == Status.Pending) {
            revert("Cannot withdraw during pending state");
        } else if (status == Status.Aborted) {
            uint256 usdcAmount = deposits[msg.sender];
            require(usdcAmount > 0, "Nothing to withdraw");
            deposits[msg.sender] = 0;
            usdcToken.transfer(msg.sender, usdcAmount);
            emit Withdrawn(msg.sender, usdcAmount);
        } else {
            uint256 usdcAmount = virtualBalances[msg.sender];
            require(usdcAmount > 0, "Nothing to withdraw");
            virtualBalances[msg.sender] = 0;
            usdcToken.transfer(msg.sender, usdcAmount);
            emit Withdrawn(msg.sender, usdcAmount);
        }
    }

    function _processWithdrawal(address user) internal {
        if (status == Status.Pending) {
            revert("Cannot withdraw during pending state");
        } else if (status == Status.Aborted) {
            uint256 usdcAmount = deposits[user];
            if (usdcAmount > 0) {
                deposits[user] = 0;
                usdcToken.transfer(user, usdcAmount);
                emit Withdrawn(user, usdcAmount);
            }
        } else {
            uint256 usdcAmount = virtualBalances[user];
            if (usdcAmount > 0) {
                virtualBalances[user] = 0;
                usdcToken.transfer(user, usdcAmount);
                emit Withdrawn(user, usdcAmount);
            }
        }
    }

    function depositAndMintCall(
        uint256 premiumUSDC,
        address seller,
        uint256 strikePriceUSDC,
        uint256 quantityBtc,
        uint256 expiry
    ) public pending {
        // Deposit USDC before minting the option
        depositUsdc(premiumUSDC);

        // Mint the call option
        mintCallOption(premiumUSDC, seller, strikePriceUSDC, quantityBtc, expiry);
    }

    function depositAndMintPut(
        uint256 premiumUSDC,
        address seller,
        uint256 strikePriceUSDC,
        uint256 quantityBtc,
        uint256 expiry
    ) public pending {
        // Deposit USDC before minting the option
        depositUsdc(premiumUSDC);

        // Mint the put option
        mintPutOption(premiumUSDC, seller, strikePriceUSDC, quantityBtc, expiry);
    }


    // Mint a call option, uses seller's USDC without their approval for testnet purpose
    function mintCallOption(
        uint256 premiumUSDC,
        address seller,
        uint256 strikePriceUSDC,
        uint256 quantityBtc,
        uint256 expiry
    ) public pending {
        address buyer = msg.sender;
        require(seller != address(0), "Invalid seller");
        require(expiry > block.timestamp, "Invalid expiry");

        // Buyer pays premium to seller
        require(virtualBalances[buyer] >= premiumUSDC, "Buyer lacks funds to pay premium");
        virtualBalances[buyer] -= premiumUSDC;
        virtualBalances[seller] += premiumUSDC;


        // Seller underwrites the option
        uint256 valueUSDC = quantityBtc * strikePriceUSDC / one_btc();
        require(virtualBalances[seller] >= valueUSDC, "Seller lacks collateral");
        virtualBalances[seller] -= valueUSDC;

        uint256 optionId = callOptions.length;
        callOptions.push(Option({
            buyer: msg.sender,
            seller: seller,
            strikePriceUSDC: strikePriceUSDC,
            quantityBtc: quantityBtc,
            expiry: expiry,
            exercised: false,
            destroyed: false
        }));

        emit CallOptionMinted(optionId, msg.sender, seller);
    }

    // Mint a put option, uses seller's USDC without their approval for testnet purpose
    function mintPutOption(
        uint256 premiumUSDC,
        address seller,
        uint256 strikePriceUSDC,
        uint256 quantityBtc,
        uint256 expiry
    ) public notAborted {
        address buyer = msg.sender;
        require(seller != address(0), "Invalid seller");
        require(expiry > block.timestamp, "Invalid expiry");

        // Buyer pays premium to seller
        require(virtualBalances[buyer] >= premiumUSDC, "Buyer lacks funds to pay premium");
        virtualBalances[buyer] -= premiumUSDC;
        virtualBalances[seller] += premiumUSDC;

        // Seller underwrites the option
        uint256 valueUSDC = quantityBtc * strikePriceUSDC / one_btc();
        require(virtualBalances[seller] >= valueUSDC, "Seller lacks collateral");
        virtualBalances[seller] -= valueUSDC;

        uint256 optionId = putOptions.length;
        putOptions.push(Option({
            buyer: msg.sender,
            seller: seller,
            strikePriceUSDC: strikePriceUSDC,
            quantityBtc: quantityBtc,
            expiry: expiry,
            exercised: false,
            destroyed: false
        }));

        emit PutOptionMinted(optionId, msg.sender, seller);
    }

    // List a call option for sale, requires the option to be owned by the caller and not exercised
    // Can list for any premium
    function listCallOptionForSale(uint256 optionId, uint256 premiumUSDC) public notAborted {
        require(optionId < callOptions.length, "Invalid option ID");
        Option storage option = callOptions[optionId];
        require(option.buyer == msg.sender, "Not your option");
        require(!option.exercised, "Already exercised");
        require(block.timestamp <= option.expiry, "Option expired");

        uint256 orderId = orderBook.length;
        orderBook.push(Order({
            owner: msg.sender,
            isCall: true,
            optionId: optionId,
            premiumUSDC: premiumUSDC,
            active: true
        }));

        emit OrderListed(orderId, true, optionId, msg.sender, premiumUSDC);
    }

    function listPutOptionForSale(uint256 optionId, uint256 premiumUSDC) public notAborted {
        require(optionId < putOptions.length, "Invalid option ID");
        Option storage option = putOptions[optionId];
        require(option.buyer == msg.sender, "Not your option");
        require(!option.exercised, "Already exercised");
        require(block.timestamp <= option.expiry, "Option expired");

        uint256 orderId = orderBook.length;
        orderBook.push(Order({
            owner: msg.sender,
            isCall: false,
            optionId: optionId,
            premiumUSDC: premiumUSDC,
            active: true
        }));

        emit OrderListed(orderId, false, optionId, msg.sender, premiumUSDC);
    }

    // Buy an option from the order book, requires sufficient virtual balance
    function buyOption(uint256 orderId) public notAborted {
        require(orderId < orderBook.length, "Invalid order ID");
        Order storage order = orderBook[orderId];
        require(order.active, "Inactive order");
        require(virtualBalances[msg.sender] >= order.premiumUSDC, "Insufficient virtual balance");

        virtualBalances[msg.sender] -= order.premiumUSDC;
        virtualBalances[order.owner] += order.premiumUSDC;

        if (order.isCall) {
            Option storage option = callOptions[order.optionId];
            option.buyer = msg.sender;
        } else {
            Option storage option = putOptions[order.optionId];
            option.buyer = msg.sender;
        }

        order.active = false;

        emit OrderFilled(orderId, msg.sender);
    }

    // Exercise a call option, requires the option to be owned by the caller and not exercised
    function exerciseCallOption(uint256 optionId) public notAborted {
        require(optionId < callOptions.length, "Invalid option ID");
        Option storage option = callOptions[optionId];

        require(option.buyer == msg.sender, "Not your option");
        require(!option.exercised, "Already exercised");
        require(block.timestamp <= option.expiry, "Option expired");

        (uint256 currentPriceUSDC, int8 decimals, ) = getBtcPrice();
        require(decimals >= 0, "Invalid decimals");

        uint256 scaledStrike = option.strikePriceUSDC;
        uint256 scaledMarket = currentPriceUSDC;

        if (scaledMarket > scaledStrike) {
            uint256 payoutUSDC = ((scaledMarket - scaledStrike) * option.quantityBtc) / (10 ** uint8(decimals));
            require(virtualBalances[option.seller] >= payoutUSDC, "Seller lacks funds");
            virtualBalances[option.seller] -= payoutUSDC;
            virtualBalances[option.buyer] += payoutUSDC;
        }

        option.exercised = true;

        emit OrderFilled(optionId, msg.sender);
    }

    function exercisePutOption(uint256 optionId) public notAborted {
        require(optionId < putOptions.length, "Invalid option ID");
        Option storage option = putOptions[optionId];

        require(option.buyer == msg.sender, "Not your option");
        require(!option.exercised, "Already exercised");
        require(block.timestamp <= option.expiry, "Option expired");

        (uint256 currentPriceUSDC, int8 decimals, ) = getBtcPrice();
        require(decimals >= 0, "Invalid decimals");

        uint256 scaledStrike = option.strikePriceUSDC;
        uint256 scaledMarket = currentPriceUSDC;

        if (scaledStrike > scaledMarket) {
            uint256 payoutUSDC = ((scaledStrike - scaledMarket) * option.quantityBtc) / (10 ** uint8(decimals));
            require(virtualBalances[option.seller] >= payoutUSDC, "Seller lacks funds");
            virtualBalances[option.seller] -= payoutUSDC;
            virtualBalances[option.buyer] += payoutUSDC;
        }

        option.exercised = true;

        emit OrderFilled(optionId, msg.sender); 
    }

    function destroyCallOption(uint256 optionId) public notAborted {
        // must be expired and not exercised
        require(optionId < callOptions.length, "Invalid option ID");
        Option storage option = callOptions[optionId];
        require(!option.exercised, "Already exercised");
        require(option.seller == msg.sender, "Not underwriter");
        require(block.timestamp > option.expiry, "Option not expired");
        require(!option.destroyed, "Already destroyed");

        option.destroyed = true;
        // Return the collateral to the seller
        virtualBalances[option.seller] += option.quantityBtc * option.strikePriceUSDC / one_btc();
    }

    function destroyPutOption(uint256 optionId) public notAborted {
        // must be expired and not exercised
        require(optionId < putOptions.length, "Invalid option ID");
        Option storage option = putOptions[optionId];
        require(!option.exercised, "Already exercised");
        require(option.seller == msg.sender, "Not underwriter");
        require(block.timestamp > option.expiry, "Option not expired");
        require(!option.destroyed, "Already destroyed");

        option.destroyed = true;
        // Return the collateral to the seller
        virtualBalances[option.seller] += option.quantityBtc * option.strikePriceUSDC / one_btc();
    }

    // Performed by Factory
    function abortSystem() public pending onlyRole(ADMIN_ROLE) {
        status = Status.Aborted;

        for (uint256 i = 0; i < callOptions.length; i++) {
            Option storage option = callOptions[i];
            _processWithdrawal(option.buyer);
            _processWithdrawal(option.seller);
        }

        for (uint256 i = 0; i < putOptions.length; i++) {
            Option storage option = putOptions[i];
            _processWithdrawal(option.buyer);
            _processWithdrawal(option.seller);
        }

        for (uint256 i = 0; i < orderBook.length; i++) {
            Order storage order = orderBook[i];
            _processWithdrawal(order.owner);
        }

        delete callOptions;
        delete putOptions;
        delete orderBook;

        emit SystemAborted();
    }

    // Performed by Factory
    function continueSystem() public pending onlyRole(ADMIN_ROLE) {
        status = Status.Continued;

        emit SystemContinued();
    }

    function getCallOptionsLength() public view returns (uint256) {
        return callOptions.length;
    }

    function getPutOptionsLength() public view returns (uint256) {
        return putOptions.length;
    }

    function getOrderBookLength() public view returns (uint256) {
        return orderBook.length;
    }


    function getBtcPrice()
        public
        view
        returns (
            uint256 value,
            int8 decimals,
            uint64 timestamp
        )
    {
        if (testBtcPrice > 0) {
            return (testBtcPrice, testBtcDecimals, uint64(block.timestamp));
        } else {
            TestFtsoV2Interface ftsoV2 = ContractRegistry.getTestFtsoV2();
            // https://dev.flare.network/ftso/feeds/
            // bytes21 xrp_id = 0x015852502f55534400000000000000000000000000;
            bytes21 btc_id = 0x014254432f55534400000000000000000000000000;
            return ftsoV2.getFeedById(btc_id);
        }
    }

    // Mock price feed for XRP
    uint256 public testBtcPrice;
    int8 public testBtcDecimals;
    
    function setTestBtcPrice(uint256 price, int8 decimals) public {
        testBtcPrice = price;
        testBtcDecimals = decimals;
    }

    function one_btc() public view returns (uint256) {
        (, int8 decimals, ) = getBtcPrice();
        return 10 ** uint8(decimals);
    }
}