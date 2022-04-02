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
        description: "A",
        charity: "0x2Fa4C9EA2c8E7778bEF5dE33b0E5838f12606A02"
    }

    const journeyB = {
        action: 5,
        format: 3,
        duration: 7,
        dailyValue: 8,
        description: "B",
        charity: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    }

    beforeEach(async function () {
        ShowUpClub = await ethers.getContractFactory("ShowUpClub");

        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
        
        hardhatShowUpClub = await ShowUpClub.deploy();
    });

    async function createJourneyA() {
        await hardhatShowUpClub.createJourney(
            journeyA.action, journeyA.format, journeyA.duration,
            journeyA.dailyValue, journeyA.description, journeyA.charity
        )
    }

    async function createJourneyB() {
        await hardhatShowUpClub.createJourney(
            journeyB.action, journeyB.format, journeyB.duration,
            journeyB.dailyValue, journeyB.description, journeyB.charity
        )
    }
    
    it("should create journey and emit", async function () {
        await expect(hardhatShowUpClub.createJourney(
            journeyA.action, journeyA.format, journeyA.duration,
            journeyA.dailyValue, journeyA.description, journeyA.charity
        ))
        .to.emit(hardhatShowUpClub, 'JourneyCreated')
        .withArgs(owner.address, 0);
    });

    it("should create two journeys and emit", async function () {
        await expect(hardhatShowUpClub.createJourney(
            journeyA.action, journeyA.format, journeyA.duration,
            journeyA.dailyValue, journeyA.description, journeyA.charity
        ))
        .to.emit(hardhatShowUpClub, 'JourneyCreated')
        .withArgs(owner.address, 0);

        await expect(hardhatShowUpClub.createJourney(
            journeyA.action, journeyA.format, journeyA.duration,
            journeyA.dailyValue, journeyA.description, journeyA.charity
        ))
        .to.emit(hardhatShowUpClub, 'JourneyCreated')
        .withArgs(owner.address, 1);
    });

    it("should not create for invalid charity address", async function () {
        await expect(hardhatShowUpClub.createJourney(
            journeyA.action, journeyA.format, journeyA.duration,
            journeyA.dailyValue, journeyA.description, "abcde"
        )).to.be.reverted
    });

    it("should not create for invalid action", async function () {
        await expect(hardhatShowUpClub.createJourney(
            29229, journeyA.format, journeyA.duration,
            journeyA.dailyValue, journeyA.description, journeyA.charity
        )).to.be.reverted
    });

    it("should not create for invalid format", async function () {
        await expect(hardhatShowUpClub.createJourney(
            journeyA.action, 133777777, journeyA.duration,
            journeyA.dailyValue, journeyA.description, journeyA.charity
        )).to.be.reverted
    });

    it("should create and get journey", async function () {
        await createJourneyA()
  
        const journey = await hardhatShowUpClub.getJourney(0);

        const latestBlock = await ethers.provider.getBlock("latest");
  
        expect(journey.action, "Action").to.equal(journeyA.action);
        expect(journey.format, "Format").to.equal(journeyA.format);
        expect(journey.duration, "Duration").to.equal(journeyA.duration);
        expect(journey.dailyValue, "Daily value").to.equal(journeyA.dailyValue);
        expect(journey.description, "Description").to.equal(journeyA.description);
        expect(journey.creator).to.equal(owner.address);
        expect(journey.charity).to.equal(journeyA.charity);
        expect(journey.startDate, "Start Date").to.equal(latestBlock.timestamp);
        expect(journey.currentValue, "Current Value").to.equal(0);
        expect(journey.fundsLocked, "Funds locked").to.equal(0);
    });

    it("should create and get two journeys", async function () {
        await createJourneyA()

        const latestBlockA = await ethers.provider.getBlock("latest");

        await createJourneyB()

        const latestBlockB = await ethers.provider.getBlock("latest");
  
        const journeyResultA = await hardhatShowUpClub.getJourney(0);
        const journeyResultB = await hardhatShowUpClub.getJourney(1);
  
        expect(journeyResultA.action, "Action").to.equal(journeyA.action);
        expect(journeyResultA.format, "Format").to.equal(journeyA.format);
        expect(journeyResultA.duration, "Duration").to.equal(journeyA.duration);
        expect(journeyResultA.dailyValue, "Daily value").to.equal(journeyA.dailyValue);
        expect(journeyResultA.description, "Description").to.equal(journeyA.description);
        expect(journeyResultA.creator).to.equal(owner.address);
        expect(journeyResultA.charity).to.equal(journeyA.charity);
        expect(journeyResultA.startDate, "Start Date").to.equal(latestBlockA.timestamp);
        expect(journeyResultA.currentValue, "Current Value").to.equal(0);
        expect(journeyResultA.fundsLocked, "Funds locked").to.equal(0);

        expect(journeyResultB.action, "Action").to.equal(journeyB.action);
        expect(journeyResultB.format, "Format").to.equal(journeyB.format);
        expect(journeyResultB.duration, "Duration").to.equal(journeyB.duration);
        expect(journeyResultB.dailyValue, "Daily value").to.equal(journeyB.dailyValue);
        expect(journeyResultB.description, "Description").to.equal(journeyB.description);
        expect(journeyResultB.creator).to.equal(owner.address);
        expect(journeyResultB.charity).to.equal(journeyB.charity);
        expect(journeyResultB.startDate, "Start Date").to.equal(latestBlockB.timestamp);
        expect(journeyResultB.currentValue, "Current Value").to.equal(0);
        expect(journeyResultB.fundsLocked, "Funds locked").to.equal(0);
    });


    it("should get journey id", async function () {
        await createJourneyA()
  
        const journeys = await hardhatShowUpClub.getJourneyIds();

        expect(journeys.length).to.equal(1);
        expect(journeys[0]).to.equal(0);
    });

    it("should get journey ids", async function () {
        await createJourneyA()
        await createJourneyA()
  
        const journeys = await hardhatShowUpClub.getJourneyIds();

        expect(journeys.length).to.equal(2);
        expect(journeys[0]).to.equal(0);
        expect(journeys[1]).to.equal(1);
    });

    it("two accounts should get journey ids. Third should get none", async function () {
        await createJourneyA()
        await hardhatShowUpClub.connect(addr1).createJourney(
            journeyA.action, journeyA.format, journeyA.duration,
            journeyA.dailyValue, journeyA.description, journeyA.charity
        );
        await createJourneyA()
  
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
        await createJourneyA()
        await createJourneyA()
  
        const journeys = await hardhatShowUpClub.getJourneyIdsForUser(owner.address);

        expect(journeys.length).to.equal(2);
        expect(journeys[0]).to.equal(0);
        expect(journeys[1]).to.equal(1);
    });

    it("should not get journey ids for different user", async function () {
        await createJourneyA()
        await createJourneyA()
  
        const journeys = await hardhatShowUpClub.getJourneyIdsForUser(await addr1.getAddress());

        expect(journeys.length).to.equal(0);
    });

    it("should get journey ids for different users", async function () {
        await createJourneyA()
        await hardhatShowUpClub.connect(addr1).createJourney(
            journeyA.action, journeyA.format, journeyA.duration,
            journeyA.dailyValue, journeyA.description, journeyA.charity
        );
        await createJourneyA()
  
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

            await ethers.provider.send("evm_mine", [latestBlockB.timestamp + (journeyA.duration * 86400) - 1]);

            await hardhatShowUpClub.showUp(0, 25, "a note?")
        })

        it("should revert if journey has ended", async () => {
            await createJourneyA()

            const latestBlockB = await ethers.provider.getBlock("latest");

            await ethers.provider.send("evm_mine", [latestBlockB.timestamp + (journeyA.duration * 86400)]);

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

    describe("Complete journey", function () {

        it("should revert for journey not found", async () => {
            await expect(hardhatShowUpClub.completeJourney(0)).to.be.reverted
        });

        it("should revert for journey not ended yet", async () => {
            await createJourneyA();

            const latestBlock = await ethers.provider.getBlock("latest");

            await ethers.provider.send("evm_mine", [latestBlock.timestamp + (journeyA.duration * 86400) - 1]);

            await expect(hardhatShowUpClub.completeJourney(0)).to.be.reverted
        });

        it("should complete for journey ended", async () => {
            await createJourneyA();

            const latestBlock = await ethers.provider.getBlock("latest");

            await ethers.provider.send("evm_mine", [latestBlock.timestamp + (journeyA.duration * 86400)]);

            await hardhatShowUpClub.completeJourney(0)
        });

        it("should mark journey complete", async () => {
            await createJourneyA();

            const latestBlock = await ethers.provider.getBlock("latest");
            await ethers.provider.send("evm_mine", [latestBlock.timestamp + (journeyA.duration * 86400)]);

            const journeyBefore = await hardhatShowUpClub.getJourney(0)
            
            expect(journeyBefore.completed).to.equal(false)

            await hardhatShowUpClub.completeJourney(0)

            const journeyAfter = await hardhatShowUpClub.getJourney(0)
            
            expect(journeyAfter.completed).to.equal(true)
        });

        it("should revert if already completed", async () => {
            await createJourneyA();

            const latestBlock = await ethers.provider.getBlock("latest");
            await ethers.provider.send("evm_mine", [latestBlock.timestamp + (journeyA.duration * 86400)]);

            await hardhatShowUpClub.completeJourney(0)
            await expect(hardhatShowUpClub.completeJourney(0)).to.be.reverted
        });

        it("should provide money to charity address if journey failed", async () => {
            await hardhatShowUpClub.createJourney(
                journeyA.action, journeyA.format, journeyA.duration,
                journeyA.dailyValue, journeyA.description, journeyA.charity,
                { value: 123 }
            )

            await hardhatShowUpClub.showUp(0, journeyA.dailyValue * journeyA.duration - 1, "a note?")

            const latestBlock = await ethers.provider.getBlock("latest");
            await ethers.provider.send("evm_mine", [latestBlock.timestamp + (journeyA.duration * 86400)]);

            await hardhatShowUpClub.completeJourney(0)

            const fundsForCharity = await hardhatShowUpClub.payments(journeyA.charity)
            const fundsForCreator = await hardhatShowUpClub.payments(owner.address)
            
            expect(fundsForCharity).to.equal(123)
            expect(fundsForCreator).to.equal(0)
        });

        it("should provide money to creator address if journey succeeded", async () => {
            await hardhatShowUpClub.createJourney(
                journeyA.action, journeyA.format, journeyA.duration,
                journeyA.dailyValue, journeyA.description, journeyA.charity,
                { value: 123 }
            )

            await hardhatShowUpClub.showUp(0, journeyA.dailyValue * journeyA.duration, "a note?")

            const latestBlock = await ethers.provider.getBlock("latest");
            await ethers.provider.send("evm_mine", [latestBlock.timestamp + (journeyA.duration * 86400)]);

            await hardhatShowUpClub.completeJourney(0)

            const fundsForCharity = await hardhatShowUpClub.payments(journeyA.charity)
            const fundsForCreator = await hardhatShowUpClub.payments(owner.address)
            
            expect(fundsForCharity).to.equal(0)
            expect(fundsForCreator).to.equal(123)
        });

        it("should emit journey completed", async () => {
            await createJourneyA();

            const latestBlock = await ethers.provider.getBlock("latest");

            await ethers.provider.send("evm_mine", [latestBlock.timestamp + (journeyA.duration * 86400)]);

            await expect(hardhatShowUpClub.completeJourney(0))
            .to.emit(hardhatShowUpClub, 'JourneyCompleted')
            .withArgs(0);
        });

        it("should emit multiple journeys completed", async () => {
            await createJourneyA();
            await createJourneyB();

            const latestBlock = await ethers.provider.getBlock("latest");

            await ethers.provider.send("evm_mine", [latestBlock.timestamp + ((journeyA.duration + journeyB.duration) * 86400)]);

            await expect(hardhatShowUpClub.completeJourney(0))
            .to.emit(hardhatShowUpClub, 'JourneyCompleted')
            .withArgs(0);

            await expect(hardhatShowUpClub.completeJourney(1))
            .to.emit(hardhatShowUpClub, 'JourneyCompleted')
            .withArgs(1);
        });


    });


  });