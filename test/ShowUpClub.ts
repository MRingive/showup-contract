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
        action: "ActionA",
        format: "FormatA",
        duration: 3,
        dailyValue: 4,
        description: "A",
        sink: "0x2Fa4C9EA2c8E7778bEF5dE33b0E5838f12606A02",
        fee: 0
    }

    const journeyB = {
        action: "ActionB",
        format: "FormatB",
        duration: 7,
        dailyValue: 8,
        description: "B",
        sink: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        fee: 1
    }

    beforeEach(async function () {
        ShowUpClub = await ethers.getContractFactory("ShowUpClub");

        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
        
        hardhatShowUpClub = await ShowUpClub.deploy();
    });

    async function createJourneyA() {
        await hardhatShowUpClub.createJourney(
            journeyA.action, journeyA.format, journeyA.duration,
            journeyA.dailyValue, journeyA.description, journeyA.sink,
            journeyA.fee
        )
    }

    async function createJourneyB() {
        await hardhatShowUpClub.createJourney(
            journeyB.action, journeyB.format, journeyB.duration,
            journeyB.dailyValue, journeyB.description, journeyB.sink,
            journeyB.fee, { value: 1 }
        )
    }
    
    it("should create journey and emit", async function () {
        await expect(hardhatShowUpClub.createJourney(
            journeyA.action, journeyA.format, journeyA.duration,
            journeyA.dailyValue, journeyA.description, journeyA.sink,
            journeyA.fee
        ))
        .to.emit(hardhatShowUpClub, 'JourneyCreated')
        .withArgs(owner.address, 0);
    });

    it("should create two journeys and emit", async function () {
        await expect(hardhatShowUpClub.createJourney(
            journeyA.action, journeyA.format, journeyA.duration,
            journeyA.dailyValue, journeyA.description, journeyA.sink,
            journeyA.fee
        ))
        .to.emit(hardhatShowUpClub, 'JourneyCreated')
        .withArgs(owner.address, 0);

        await expect(hardhatShowUpClub.createJourney(
            journeyA.action, journeyA.format, journeyA.duration,
            journeyA.dailyValue, journeyA.description, journeyA.sink,
            journeyA.fee
        ))
        .to.emit(hardhatShowUpClub, 'JourneyCreated')
        .withArgs(owner.address, 1);
    });

    it("should not create for invalid sink address", async function () {
        await expect(hardhatShowUpClub.createJourney(
            journeyA.action, journeyA.format, journeyA.duration,
            journeyA.dailyValue, journeyA.description, "abcde",
            journeyA.fee
        )).to.be.reverted
    });

    it("should not create with fee more than deposit", async function () {
        await expect(hardhatShowUpClub.createJourney(
            journeyA.action, journeyA.format, journeyA.duration,
            journeyA.dailyValue, journeyA.description, journeyA.sink,
            200, {value: 199}
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
        expect(journey.sink).to.equal(journeyA.sink);
        expect(journey.startDate, "Start Date").to.equal(latestBlock.timestamp);
        expect(journey.currentValue, "Current Value").to.equal(0);
        expect(journey.deposit, "Deposit").to.equal(0);
    });

    it("should create and get journey with deposit minus fee", async function () {
        await hardhatShowUpClub.createJourney(
            journeyB.action, journeyB.format, journeyB.duration,
            journeyB.dailyValue, journeyB.description, journeyB.sink,
            100, { value: 420 })
  
        const journey = await hardhatShowUpClub.getJourney(0);
  
        expect(journey.deposit, "Deposit").to.equal(320);
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
        expect(journeyResultA.sink).to.equal(journeyA.sink);
        expect(journeyResultA.startDate, "Start Date").to.equal(latestBlockA.timestamp);
        expect(journeyResultA.currentValue, "Current Value").to.equal(0);
        expect(journeyResultA.deposit, "Deposit").to.equal(0);

        expect(journeyResultB.action, "Action").to.equal(journeyB.action);
        expect(journeyResultB.format, "Format").to.equal(journeyB.format);
        expect(journeyResultB.duration, "Duration").to.equal(journeyB.duration);
        expect(journeyResultB.dailyValue, "Daily value").to.equal(journeyB.dailyValue);
        expect(journeyResultB.description, "Description").to.equal(journeyB.description);
        expect(journeyResultB.creator).to.equal(owner.address);
        expect(journeyResultB.sink).to.equal(journeyB.sink);
        expect(journeyResultB.startDate, "Start Date").to.equal(latestBlockB.timestamp);
        expect(journeyResultB.currentValue, "Current Value").to.equal(0);
        expect(journeyResultB.deposit, "Deposit").to.equal(0);
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
            journeyA.dailyValue, journeyA.description, journeyA.sink,
            journeyA.fee
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
            journeyA.dailyValue, journeyA.description, journeyA.sink,
            journeyA.fee
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

        it("should provide money to sink address if journey failed", async () => {
            await hardhatShowUpClub.createJourney(
                journeyA.action, journeyA.format, journeyA.duration,
                journeyA.dailyValue, journeyA.description, journeyA.sink,
                journeyA.fee, { value: 123 }
            )

            await hardhatShowUpClub.showUp(0, journeyA.dailyValue * journeyA.duration - 1, "a note?")

            const latestBlock = await ethers.provider.getBlock("latest");
            await ethers.provider.send("evm_mine", [latestBlock.timestamp + (journeyA.duration * 86400)]);

            await hardhatShowUpClub.completeJourney(0)

            const fundsForCharity = await hardhatShowUpClub.payments(journeyA.sink)
            const fundsForCreator = await hardhatShowUpClub.payments(owner.address)
            
            expect(fundsForCharity).to.equal(123)
            expect(fundsForCreator).to.equal(0)
        });

        it("should provide money to creator address if journey succeeded", async () => {
            await hardhatShowUpClub.createJourney(
                journeyA.action, journeyA.format, journeyA.duration,
                journeyA.dailyValue, journeyA.description, journeyA.sink,
                journeyA.fee, { value: 123 }
            )

            await hardhatShowUpClub.showUp(0, journeyA.dailyValue * journeyA.duration, "a note?")

            const latestBlock = await ethers.provider.getBlock("latest");
            await ethers.provider.send("evm_mine", [latestBlock.timestamp + (journeyA.duration * 86400)]);

            await hardhatShowUpClub.completeJourney(0)

            const fundsForCharity = await hardhatShowUpClub.payments(journeyA.sink)
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


    describe("Owner", () => {

        it("should return owner", async () => {
            const contractOwner = await hardhatShowUpClub.owner()
            expect(contractOwner).to.equal(owner.address)
        })

        it("should transfer ownership", async () => {
            const newAddress = await addr1.getAddress()
            await hardhatShowUpClub.transferOwnership(newAddress)
            
            const contractOwner = await hardhatShowUpClub.owner()
            expect(contractOwner).to.equal(newAddress)
        })

        it("should have funds after journey with fee created", async () => {
            await createJourneyB()

            const feeForOwner = await hardhatShowUpClub.payments(owner.address)
            expect(feeForOwner).to.equal(journeyB.fee)
        })

        it("should not have funds after journey with no fee created", async () => {
            await createJourneyA()

            const feeForOwner = await hardhatShowUpClub.payments(owner.address)
            expect(feeForOwner).to.equal(0)
        })

        it("should have more funds after journeys with fees created", async () => {
            await createJourneyB()
            await createJourneyB()
            await createJourneyB()

            const feeForOwner = await hardhatShowUpClub.payments(owner.address)

            expect(feeForOwner).to.equal(3)
        })

        it("should have funds for different owners", async () => {
            await createJourneyB()

            const newAddress = await addr1.getAddress()
            await hardhatShowUpClub.transferOwnership(newAddress)

            await createJourneyB()
            await createJourneyB()

            const feeForOwner = await hardhatShowUpClub.payments(owner.address)
            expect(feeForOwner).to.equal(1)
            const feeForNewAddress = await hardhatShowUpClub.payments(newAddress)
            expect(feeForNewAddress).to.equal(2)
        })

    })

  });