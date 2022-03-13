// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.4;

/// @title The Show Up Club.
contract ShowUpClub {

    enum Action { Run, Walk, WorkOnAProject, Write, Program, WorkOut }
    enum Format { Minutes, Kilometers, Miles, Times }

    // TODO: need user addr
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

    event JourneyCreated(address creator, uint id);
    event AttemptCreated(address creator, uint id);

    // All Journeys
    Journey[] public journeys;

    // Map from address to journey ids. 
    mapping(address => uint[]) userJourneys;

    // Journey Id to Attempts
    mapping(uint => Attempt[]) attempts;

    // TODO: how can a user find their attempts? (e.g., if it is a journey the user has not created)
    // Addr -> journeyId -> attempts for that journey
    // TODO: 

    /// Journey does not exists.
    error JourneyDoesNotExist();

    constructor() {} // TODO? 

    function createJourney(
        Action action,
        Format format,
        uint duration,
        uint dailyValue,
        string calldata description) external {
        Journey memory journey = Journey({ // See if push directly saves gas?
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

    // Create attempt.
    // Private.
    // Use a journey id and use the journey duration to compute endDate
    // should user pass in startTime ? Just assert that it is not in the past?
    // (this could be tricky as a transaction can take a bit to mine so it will end up in the past)
    // You should not be able to set start time... user can just set start time in the past and then quickly complete a long
    // journey.
    // startTime = blockTime. to make it simple starting out.
    
    function createAttempt(uint journeyId) external {
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