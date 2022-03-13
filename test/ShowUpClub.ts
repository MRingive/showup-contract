import { ethers } from "hardhat";
import { Signer } from "ethers";
import { ShowUpClub } from "../typechain-types";
import { expect } from 'chai'

describe("ShowUpClub contract", function () {

    let ShowUpClub;
    let hardhatShowUpClub: ShowUpClub;
    let owner: { address: any; };
    let addr1: Signer;
    let addr2: Signer;
    let addrs;

    const journeyA = {
        action: 1,
        format: 2,
        duration: 3,
        dailyValue: 4,
        description: "A"
    }

    const journeyB = {
        action: 5,
        format: 3,
        duration: 7,
        dailyValue: 8,
        description: "B"
    }

    beforeEach(async function () {
        ShowUpClub = await ethers.getContractFactory("ShowUpClub");

        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
        
        hardhatShowUpClub = await ShowUpClub.deploy();
    });

    async function createJourneyA() {
        await hardhatShowUpClub.createJourney(
            journeyA.action, journeyA.format, journeyA.duration, journeyA.dailyValue, journeyA.description
        )
    }

    async function createJourneyB() {
        await hardhatShowUpClub.createJourney(
            journeyB.action, journeyB.format, journeyB.duration, journeyB.dailyValue, journeyB.description
        )
    }
    
    it("should create journey and emit", async function () {
        await expect(hardhatShowUpClub.createJourney(
            journeyA.action, journeyA.format, journeyA.duration, journeyA.dailyValue, journeyA.description
        ))
        .to.emit(hardhatShowUpClub, 'JourneyCreated')
        .withArgs(owner.address, 0);
    });

    it("should create two journeys and emit", async function () {
        await expect(hardhatShowUpClub.createJourney(
            journeyA.action, journeyA.format, journeyA.duration, journeyA.dailyValue, journeyA.description
        ))
        .to.emit(hardhatShowUpClub, 'JourneyCreated')
        .withArgs(owner.address, 0);

        await expect(hardhatShowUpClub.createJourney(
            journeyA.action, journeyA.format, journeyA.duration, journeyA.dailyValue, journeyA.description
        ))
        .to.emit(hardhatShowUpClub, 'JourneyCreated')
        .withArgs(owner.address, 1);
    });

    it("should create and get journey", async function () {
        await hardhatShowUpClub.createJourney(
            journeyA.action, journeyA.format, journeyA.duration, journeyA.dailyValue, journeyA.description
        );
  
        const journey = await hardhatShowUpClub.getJourney(0);
  
        expect(journey.action, "Action").to.equal(journeyA.action);
        expect(journey.format, "Format").to.equal(journeyA.format);
        expect(journey.duration, "Duration").to.equal(journeyA.duration);
        expect(journey.dailyValue, "Daily value").to.equal(journeyA.dailyValue);
        expect(journey.description, "Description").to.equal(journeyA.description);
        expect(journey.creator).to.equal(owner.address);
    });

    it("should create and get two journeys", async function () {
        await hardhatShowUpClub.createJourney(
            journeyA.action, journeyA.format, journeyA.duration, journeyA.dailyValue, journeyA.description
        );
        await hardhatShowUpClub.createJourney(
            journeyB.action, journeyB.format, journeyB.duration, journeyB.dailyValue, journeyB.description
        );
  
        const journeyResultA = await hardhatShowUpClub.getJourney(0);
        const journeyResultB = await hardhatShowUpClub.getJourney(1);
  
        expect(journeyResultA.action, "Action").to.equal(journeyA.action);
        expect(journeyResultA.format, "Format").to.equal(journeyA.format);
        expect(journeyResultA.duration, "Duration").to.equal(journeyA.duration);
        expect(journeyResultA.dailyValue, "Daily value").to.equal(journeyA.dailyValue);
        expect(journeyResultA.description, "Description").to.equal(journeyA.description);
        expect(journeyResultA.creator).to.equal(owner.address);

        expect(journeyResultB.action, "Action").to.equal(journeyB.action);
        expect(journeyResultB.format, "Format").to.equal(journeyB.format);
        expect(journeyResultB.duration, "Duration").to.equal(journeyB.duration);
        expect(journeyResultB.dailyValue, "Daily value").to.equal(journeyB.dailyValue);
        expect(journeyResultB.description, "Description").to.equal(journeyB.description);
        expect(journeyResultB.creator).to.equal(owner.address);
    });


    it("should get journey id", async function () {
        await hardhatShowUpClub.createJourney(
            journeyA.action, journeyA.format, journeyA.duration, journeyA.dailyValue, journeyA.description
        );
  
        const journeys = await hardhatShowUpClub.getJourneyIds();

        expect(journeys.length).to.equal(1);
        expect(journeys[0]).to.equal(0);
    });

    it("should get journey ids", async function () {
        await hardhatShowUpClub.createJourney(
            journeyA.action, journeyA.format, journeyA.duration, journeyA.dailyValue, journeyA.description
        );
        await hardhatShowUpClub.createJourney(
            journeyA.action, journeyA.format, journeyA.duration, journeyA.dailyValue, journeyA.description
        );
  
        const journeys = await hardhatShowUpClub.getJourneyIds();

        expect(journeys.length).to.equal(2);
        expect(journeys[0]).to.equal(0);
        expect(journeys[1]).to.equal(1);
    });

    it("two accounts should get journey ids. Third should get none", async function () {
        await hardhatShowUpClub.createJourney(
            journeyA.action, journeyA.format, journeyA.duration, journeyA.dailyValue, journeyA.description
        );
        await hardhatShowUpClub.connect(addr1).createJourney(
            journeyA.action, journeyA.format, journeyA.duration, journeyA.dailyValue, journeyA.description
        );
        await hardhatShowUpClub.createJourney(
            journeyA.action, journeyA.format, journeyA.duration, journeyA.dailyValue, journeyA.description
        );
  
        const journeys = await hardhatShowUpClub.getJourneyIds();

        expect(journeys.length).to.equal(2);
        expect(journeys[0]).to.equal(0);
        expect(journeys[1]).to.equal(2);

        const journeysAddr1 = await hardhatShowUpClub.connect(addr1).getJourneyIds();

        expect(journeysAddr1.length).to.equal(1);
        expect(journeysAddr1[0]).to.equal(1);

        const journeysAddr2 = await hardhatShowUpClub.connect(addr2).getJourneyIds();
        
        expect(journeysAddr2.length).to.equal(0);
    });

    it("should fail to create attempt with no journey", async function () {
        await expect(hardhatShowUpClub.createAttempt(0)).to.be.reverted
    });

    it("should fail to create attempt with no journey for id 1", async function () {
        await hardhatShowUpClub.createJourney(
            journeyA.action, journeyA.format, journeyA.duration, journeyA.dailyValue, journeyA.description
        );

        await expect(hardhatShowUpClub.createAttempt(1)).to.be.reverted
    });

    it("should create attempt", async function () {
        await hardhatShowUpClub.createJourney(
            journeyA.action, journeyA.format, journeyA.duration, journeyA.dailyValue, journeyA.description
        );

        await expect(hardhatShowUpClub.createAttempt(0))
            .to.emit(hardhatShowUpClub, 'AttemptCreated')
            .withArgs(owner.address, 0);
    });

    it("should create two attempts", async function () {
        await hardhatShowUpClub.createJourney(
            journeyA.action, journeyA.format, journeyA.duration, journeyA.dailyValue, journeyA.description
        );

        await expect(hardhatShowUpClub.createAttempt(0))
            .to.emit(hardhatShowUpClub, 'AttemptCreated')
            .withArgs(owner.address, 0);

        await expect(hardhatShowUpClub.createAttempt(0))
            .to.emit(hardhatShowUpClub, 'AttemptCreated')
            .withArgs(owner.address, 1);
    });

    it("should create attempts for different journeys", async function () {
        await hardhatShowUpClub.createJourney(
            journeyA.action, journeyA.format, journeyA.duration, journeyA.dailyValue, journeyA.description
        );

        await hardhatShowUpClub.createJourney(
            journeyA.action, journeyA.format, journeyA.duration, journeyA.dailyValue, journeyA.description
        );

        await expect(hardhatShowUpClub.createAttempt(0))
            .to.emit(hardhatShowUpClub, 'AttemptCreated')
            .withArgs(owner.address, 0);

        await expect(hardhatShowUpClub.createAttempt(1))
            .to.emit(hardhatShowUpClub, 'AttemptCreated')
            .withArgs(owner.address, 0);
    });

    it("should create attempt and get end date", async function () {
        await createJourneyA();

        await hardhatShowUpClub.createAttempt(0);

        const endDate = await hardhatShowUpClub.getAttemptEndDate(0, 0);

        const latestBlock = await ethers.provider.getBlock("latest")

        expect(endDate).to.equal(latestBlock.timestamp + journeyA.duration);
    });

    it("should have different end dates", async function () {
        await createJourneyA();
        await createJourneyB();

        await hardhatShowUpClub.createAttempt(0);
        const latestBlockA = await ethers.provider.getBlock("latest");

        await hardhatShowUpClub.createAttempt(1);
        const latestBlockB = await ethers.provider.getBlock("latest");

        const endDateA = await hardhatShowUpClub.getAttemptEndDate(0, 0);
        const endDateB = await hardhatShowUpClub.getAttemptEndDate(1, 0);

        expect(endDateA).to.equal(latestBlockA.timestamp + journeyA.duration, "Attempt A date");
        expect(endDateB).to.equal(latestBlockB.timestamp + journeyB.duration, "Attempt B date");
    });
  });