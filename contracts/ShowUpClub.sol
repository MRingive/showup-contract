// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/security/PullPayment.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title The Show Up Club.
contract ShowUpClub is PullPayment, Ownable {

    struct Journey {
        string action;      // Action.
        string format;      // Format.
        uint duration;      // Duration in days.
        uint dailyValue;    // Daily value. E.g, 20
        string description; // Description of the journey.
        address creator;    // Journey Creator.
        address sink;       // Sink Address.
        uint startDate;     // Start date.
        uint currentValue;  // Current value.
        uint deposit;       // Deposit.
        bool completed;     // Completed.
    }

    event JourneyCreated(address indexed creator, uint id);
    event JourneyCompleted(uint indexed id);
    event ShowUp(uint indexed journeyId, uint value, string note);
    

    // All Journeys
    Journey[] public journeys;

    // Map from address to journey ids. 
    mapping(address => uint[]) userJourneys;

    // Journey Id to ShowUps
    //mapping(uint => ShowUp[]) showups;

    /// Journey does not exist.
    error JourneyDoesNotExist();

    /// Sender did not create journey.
    error NotCreatorOfJourney();

    /// Journey ended.
    error JourneyEnded();

    /// Journey not ended yet.
    error JourneyNotEnded();

    /// Journey already completed.
    error JourneyAlreadyCompleted();

    constructor() {} // TODO?

    function createJourney(
        string calldata action,
        string calldata format,
        uint duration,
        uint dailyValue,
        string calldata description,
        address sink,
        uint fee) external payable {
            _createJourney(action, format, duration, dailyValue, description, sink, fee);
    }

    function _createJourney(
        string calldata action,
        string calldata format,
        uint duration,
        uint dailyValue,
        string calldata description,
        address sink,
        uint fee) internal {
        Journey memory journey = Journey({
            action: action,
            format: format,
            duration: duration,
            dailyValue: dailyValue,
            description: description,
            creator: msg.sender,
            sink: sink,
            startDate: block.timestamp,
            currentValue: 0,
            deposit: msg.value - fee,
            completed: false
        });

        journeys.push(journey);
        userJourneys[msg.sender].push(journeys.length - 1);

        _asyncTransfer(owner(), fee);

        emit JourneyCreated(journey.creator, journeys.length - 1);
    }

    function getJourney(uint id) external view 
        returns (Journey memory journey_)
    {
        journey_ = getJourneyInternal(id);
    }

    function getJourneyInternal(uint id) internal view 
        returns (Journey memory journey_)
    {
        journey_ = journeys[id];
    }

    function getJourneyIds() external view
        returns (uint[] memory journeyIds_)
    {
        journeyIds_ = userJourneys[msg.sender];
    }

    function getJourneyIdsForUser(address creator) external view
        returns (uint[] memory journeyIds_)
    {
        journeyIds_ = userJourneys[creator];
    }

    function showUp(uint journeyId, uint value, string calldata note) external {
        uint journeyEndDate = getJourneyEndDate(journeyId);
        if (journeyEndDate < block.timestamp)
            revert JourneyEnded();
        
        Journey storage journey = journeys[journeyId];
        if (journey.creator != msg.sender)
            revert NotCreatorOfJourney();

        journey.currentValue = journey.currentValue + value;
        emit ShowUp(journeyId, value, note);
    }

    function getJourneyEndDate(uint journeyId) internal view
        returns (uint endDate_)
    {
        Journey memory journey = getJourneyInternal(journeyId);
        endDate_ = journey.startDate + _getJourneyDurationInSeconds(journey);
    }

    function _getJourneyDurationInSeconds(Journey memory journey) internal pure
        returns (uint durationInDays_)
    {
        durationInDays_ = journey.duration * 1 days;
    }
    
    function completeJourney(uint journeyId) public {
        uint journeyEndDate = getJourneyEndDate(journeyId); // TODO: is it cheaper to use the storage journey?
        if (journeyEndDate >= block.timestamp)
            revert JourneyNotEnded();

        Journey storage journey = journeys[journeyId];

        if (journey.completed)
            revert JourneyAlreadyCompleted();

        journey.completed = true;

        uint totalValueRequired = journey.duration * journey.dailyValue;
        bool success = journey.currentValue >= totalValueRequired;

        if (success) {
            _asyncTransfer(journey.creator, journey.deposit);
        } else {
            _asyncTransfer(journey.sink, journey.deposit);
        }
        
        emit JourneyCompleted(journeyId);
    }
}