// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;

/// @title The Show Up Club.
contract ShowUpClub {

    enum Action { Run, Walk, WorkOnAProject, Write, Program, WorkOut }
    enum Format { Minutes, Kilometers, Miles, Times }

    struct Journey {
        Action action;      // Action.
        Format format;      // Format.
        uint duration;      // Duration in ms.
        uint dailyValue;    // Daily value. E.g, 20
        string description; // Description of the journey.
        address creator;    // Journey Creator.
        uint startDate;     // Start date.
        uint currentValue;  // Current value.
    }

    event JourneyCreated(address indexed creator, uint id);
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

    constructor() {} // TODO? 

    function createJourney(
        Action action,
        Format format,
        uint duration,
        uint dailyValue,
        string calldata description) external {
        // TODO See if push directly saves gas?
        Journey memory journey = Journey({ 
            action: action,
            format: format,
            duration: duration,
            dailyValue: dailyValue,
            description: description,
            creator: msg.sender,
            startDate: block.timestamp,
            currentValue: 0
        });

        journeys.push(journey);
        userJourneys[msg.sender].push(journeys.length - 1);

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
        Journey storage journey = journeys[journeyId];
        if (journey.creator != msg.sender)
            revert NotCreatorOfJourney();

        uint journeyEndDate = getJourneyEndDate(journeyId);
        if (journeyEndDate < block.timestamp)
            revert JourneyEnded();

        journey.currentValue = journey.currentValue + value;
        emit ShowUp(journeyId, value, note);
    }

    function getJourneyEndDate(uint journeyId) internal view
        returns (uint endDate_)
    {
        Journey memory journey = getJourneyInternal(journeyId);
        endDate_ = journey.startDate + journey.duration;
    }
}