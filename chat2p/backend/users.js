const bcrypt = require('bcrypt');

// Hardcoded users with bcrypt-hashed usernames and passwords
const users = [
  {
    usernameHash: '$2b$10$ZCxy.HlSYk/dFE9a0NPLseSJMmpeoE7zgIw58XsmeUqhNmpSjwel.',
    password: '$2b$10$OFuRTerWJYP.xiys641WueJAavgaVWIx98WqtmNevQ2N8uzxQmtEW'
  },
  {
    usernameHash: '$2b$10$2VO2SQaEZ4H5eFdWNM5P.uNb8LWdpHJQagd9vS/wrB7iDcBeQyCoa',
    password: '$2b$10$NxKix4CNgyK9sk4JxNHsQe32zhOHNHd1dIL.nbrAKLixvsanAqZqe'
  }
];

// Function to generate username hashes (run once to get actual hashes)
async function generateUsernameHashes() {
  const saltRounds = 10;
  const radhaUsernameHash = await bcrypt.hash('Radha', saltRounds);
  const krishnaUsernameHash = await bcrypt.hash('Krishna', saltRounds);
}

// Uncomment to generate username hashes: generateUsernameHashes();

module.exports = users;
