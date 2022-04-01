import { ethers, network } from "hardhat";
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

        const latestBlock = await ethers.provider.getBlock("latest");
  
        expect(journey.action, "Action").to.equal(journeyA.action);
        expect(journey.format, "Format").to.equal(journeyA.format);
        expect(journey.duration, "Duration").to.equal(journeyA.duration);
        expect(journey.dailyValue, "Daily value").to.equal(journeyA.dailyValue);
        expect(journey.description, "Description").to.equal(journeyA.description);
        expect(journey.startDate, "Start Date").to.equal(latestBlock.timestamp);
        expect(journey.creator).to.equal(owner.address);
    });

    it("should create and get two journeys", async function () {
        await hardhatShowUpClub.createJourney(
            journeyA.action, journeyA.format, journeyA.duration, journeyA.dailyValue, journeyA.description
        );

        const latestBlockA = await ethers.provider.getBlock("latest");

        await hardhatShowUpClub.createJourney(
            journeyB.action, journeyB.format, journeyB.duration, journeyB.dailyValue, journeyB.description
        );

        const latestBlockB = await ethers.provider.getBlock("latest");
  
        const journeyResultA = await hardhatShowUpClub.getJourney(0);
        const journeyResultB = await hardhatShowUpClub.getJourney(1);
  
        expect(journeyResultA.action, "Action").to.equal(journeyA.action);
        expect(journeyResultA.format, "Format").to.equal(journeyA.format);
        expect(journeyResultA.duration, "Duration").to.equal(journeyA.duration);
        expect(journeyResultA.dailyValue, "Daily value").to.equal(journeyA.dailyValue);
        expect(journeyResultA.description, "Description").to.equal(journeyA.description);
        expect(journeyResultA.startDate, "Start Date").to.equal(latestBlockA.timestamp);
        expect(journeyResultA.creator).to.equal(owner.address);

        expect(journeyResultB.action, "Action").to.equal(journeyB.action);
        expect(journeyResultB.format, "Format").to.equal(journeyB.format);
        expect(journeyResultB.duration, "Duration").to.equal(journeyB.duration);
        expect(journeyResultB.dailyValue, "Daily value").to.equal(journeyB.dailyValue);
        expect(journeyResultB.description, "Description").to.equal(journeyB.description);
        expect(journeyResultB.startDate, "Start Date").to.equal(latestBlockB.timestamp);
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

    it("should get journey ids for user", async function () {
        await hardhatShowUpClub.createJourney(
            journeyA.action, journeyA.format, journeyA.duration, journeyA.dailyValue, journeyA.description
        );
        await hardhatShowUpClub.createJourney(
            journeyA.action, journeyA.format, journeyA.duration, journeyA.dailyValue, journeyA.description
        );
  
        const journeys = await hardhatShowUpClub.getJourneyIdsForUser(owner.address);

        expect(journeys.length).to.equal(2);
        expect(journeys[0]).to.equal(0);
        expect(journeys[1]).to.equal(1);
    });

    it("should not get journey ids for different user", async function () {
        await hardhatShowUpClub.createJourney(
            journeyA.action, journeyA.format, journeyA.duration, journeyA.dailyValue, journeyA.description
        );
        await hardhatShowUpClub.createJourney(
            journeyA.action, journeyA.format, journeyA.duration, journeyA.dailyValue, journeyA.description
        );
  
        const journeys = await hardhatShowUpClub.getJourneyIdsForUser(await addr1.getAddress());

        expect(journeys.length).to.equal(0);
    });

    it("should get journey ids for different users", async function () {
        await hardhatShowUpClub.createJourney(
            journeyA.action, journeyA.format, journeyA.duration, journeyA.dailyValue, journeyA.description
        );
        await hardhatShowUpClub.connect(addr1).createJourney(
            journeyA.action, journeyA.format, journeyA.duration, journeyA.dailyValue, journeyA.description
        );
        await hardhatShowUpClub.createJourney(
            journeyA.action, journeyA.format, journeyA.duration, journeyA.dailyValue, journeyA.description
        );
  
        const journeys = await hardhatShowUpClub.getJourneyIdsForUser(owner.address);

        expect(journeys.length).to.equal(2);
        expect(journeys[0]).to.equal(0);
        expect(journeys[1]).to.equal(2);

        const journeysAddr1 = await hardhatShowUpClub.getJourneyIdsForUser(await addr1.getAddress());

        expect(journeysAddr1.length).to.equal(1);
        expect(journeysAddr1[0]).to.equal(1);

        const journeysAddr2 = await hardhatShowUpClub.getJourneyIdsForUser(await addr2.getAddress());
        
        expect(journeysAddr2.length).to.equal(0);
    });

    describe("Show Up", function () {

        it("should revert for journey not there", async () => {
            await expect(hardhatShowUpClub.showUp(0, 25, "a note?")).to.be.reverted
        }) 

        it("should revert for different user than creator", async () => {
            await createJourneyA()

            await expect(hardhatShowUpClub.connect(addr1).showUp(0, 25, "a note?")).to.be.reverted
        })

        it("should not revert if journey has not ended", async () => {
            await createJourneyA()

            const latestBlockB = await ethers.provider.getBlock("latest");

            await ethers.provider.send("evm_mine", [latestBlockB.timestamp + journeyA.duration - 1]);

            await hardhatShowUpClub.showUp(0, 25, "a note?")
        })

        it("should revert if journey has ended", async () => {
            await createJourneyA()

            const latestBlockB = await ethers.provider.getBlock("latest");

            await ethers.provider.send("evm_mine", [latestBlockB.timestamp + journeyA.duration]);

            await expect(hardhatShowUpClub.showUp(0, 25, "a note?")).to.be.reverted
        })

        it("should change journey value", async () => {
            await createJourneyA()

            const journeyBefore = await hardhatShowUpClub.getJourney(0)

            expect(journeyBefore.currentValue).to.equal(0)

            await hardhatShowUpClub.showUp(0, 25, "a note?")

            const journeyAfter =  await hardhatShowUpClub.getJourney(0)

            expect(journeyAfter.currentValue).to.equal(25)
        })

        it("should change journey value multiple times", async () => {
            await createJourneyA()

            const journeyBefore = await hardhatShowUpClub.getJourney(0)

            expect(journeyBefore.currentValue).to.equal(0)

            await hardhatShowUpClub.showUp(0, 25, "a note?")

            const journeyAfter =  await hardhatShowUpClub.getJourney(0)

            expect(journeyAfter.currentValue).to.equal(25)

            await hardhatShowUpClub.showUp(0, 30, "another note?")

            const journeyAfterAgain =  await hardhatShowUpClub.getJourney(0)

            expect(journeyAfterAgain.currentValue).to.equal(55)
        })

        it("should emit event", async function () {
            await createJourneyA()

            await expect(hardhatShowUpClub.showUp(0, 25, "a note?"))
            .to.emit(hardhatShowUpClub, 'ShowUp')
            .withArgs(0, 25, "a note?");
        });

        it("should emit events", async function () {
            await createJourneyA()
            await createJourneyB()

            await expect(hardhatShowUpClub.showUp(0, 25, "a note?"))
            .to.emit(hardhatShowUpClub, 'ShowUp')
            .withArgs(0, 25, "a note?");

            await expect(hardhatShowUpClub.showUp(1, 30, "another note?"))
            .to.emit(hardhatShowUpClub, 'ShowUp')
            .withArgs(1, 30, "another note?");
        });

    });
  });