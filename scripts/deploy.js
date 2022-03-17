async function main() {
    const ShowUpClub = await ethers.getContractFactory("ShowUpClub");
    const showUpClubDeployed = await ShowUpClub.deploy();
  
    console.log("ShowUp deployed to:", showUpClubDeployed.address);
    console.log("Owner address: " + showUpClubDeployed.signer.address)
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });