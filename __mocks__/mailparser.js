const mailparser = jest.genMockFromModule('mailparser');

let mockEmail = Object.create(null);
function __setMockEmail(newMockEmail) {
  mockEmail = newMockEmail;
}

function simpleParser(_mimeEmail) {
  return Promise.resolve().then(() => {
    return mockEmail;
  });
}

mailparser.__setMockEmail = __setMockEmail;
mailparser.simpleParser   = simpleParser;

module.exports = mailparser;