// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

interface ITemporaryClearingHouse {
    enum Status { Pending, Aborted, Continued }

    // Events
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    event CallOptionMinted(uint256 indexed optionId, address indexed buyer, address indexed seller);
    event PutOptionMinted(uint256 indexed optionId, address indexed buyer, address indexed seller);

    event OrderListed(uint256 indexed orderId, bool isCall, uint256 indexed optionId, address indexed owner, uint256 price);
    event OrderFilled(uint256 indexed orderId, address indexed buyer);

    event SystemAborted();
    event SystemContinued();

    // Views
    function deposits(address user) external view returns (uint256);
    function virtualBalances(address user) external view returns (uint256);

    function getCallOptionsLength() external view returns (uint256);
    function getPutOptionsLength() external view returns (uint256);
    function getOrderBookLength() external view returns (uint256);

    function status() external view returns (Status);

    // User actions
    function depositUsdc(uint usdcAmount) external;
    function withdraw() external;

    function mintCallOption(  
        uint256 premiumUSDC,
        address seller,
        uint256 strikePrice,
        uint256 quantity,
        uint256 expiry
    ) external;

    function mintPutOption(
        uint256 premiumUSDC,
        address seller,
        uint256 strikePrice,
        uint256 quantity,
        uint256 expiry
    ) external;

    function listCallOptionForSale(uint256 optionId, uint256 price) external;
    function listPutOptionForSale(uint256 optionId, uint256 price) external;

    function buyOption(uint256 orderId) external;

    // Admin
    function abortSystem() external;
}