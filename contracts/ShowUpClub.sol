// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;

/// @title The Show Up Club.
contract ShowUpClub {

    enum Action { Run, Walk, WorkOnAProject, Write, Program, WorkOut }
    enum Format { Minutes, Kilometers, Miles, Times }

    struct Attempt {
        uint startDate;
        address creator;
    }

    struct Journey {
        Action action;      // Action.
        Format format;      // Format.
        uint duration;      // Duration in ms.
        uint dailyValue;    // Daily value. E.g, 20
        string description; // Description of the journey.
        address creator;    // Journey Creator.
    }

    event JourneyCreated(address indexed creator, uint id);
    event AttemptCreated(address indexed creator, uint id);

    // All Journeys
    Journey[] public journeys;

    // Map from address to journey ids. 
    mapping(address => uint[]) userJourneys;

    // Journey Id to Attempts
    mapping(uint => Attempt[]) attempts;

    // TODO: how can a user find their attempts? (e.g., if it is a journey the user has not created)
    // Addr -> journeyId -> attempts for that journey

    /// Journey does not exists.
    error JourneyDoesNotExist();

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
            creator: msg.sender
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

    function createAttempt(uint journeyId) external {
        // TODO should you only be allowed the have one attempt running pr. journey? Or does this not matter?
        
        if (journeys.length < journeyId + 1)
            revert JourneyDoesNotExist();

        attempts[journeyId].push(Attempt({
            startDate: block.timestamp,
            creator: msg.sender
        }));

        emit AttemptCreated(msg.sender, attempts[journeyId].length - 1);
    }

    function getAttemptEndDate(uint journeyId, uint attemptId) external view
        returns (uint endDate_)
    {
        Journey memory journey = getJourneyInternal(journeyId);
        Attempt memory attempt = attempts[journeyId][attemptId];

        endDate_ = attempt.startDate + journey.duration;
    }
}