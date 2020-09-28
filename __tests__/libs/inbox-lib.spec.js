import AWS from "aws-sdk";
import AWSMock from "aws-sdk-mock";
import Inbox from "../../libs/inbox-lib";

AWSMock.setSDKInstance(AWS);

describe('#Inbox', () => {
  it('is an object', () => {
    const inbox = new Inbox(new AWS.DynamoDB.DocumentClient, 'inboxesTestTable', 'test');

    expect(typeof inbox).toBe('object');
  });

  it('has expected functions', () => {
    const inbox = new Inbox(new AWS.DynamoDB.DocumentClient, 'inboxesTestTable', 'test');

    expect(typeof inbox.create).toBe('function');
    expect(typeof inbox.get).toBe('function');
    expect(typeof inbox.getByEmailAddress).toBe('function');
  });

  describe('#create', () => {
    beforeAll(() => {
      AWSMock.mock('DynamoDB.DocumentClient', 'put');
    });

    afterAll(() => {
      AWSMock.restore("DynamoDB.DocumentClient");
    });

    it('returns the created item after creation', () => {
      const inbox = new Inbox(new AWS.DynamoDB.DocumentClient, 'inboxesTestTable', 'test');

      return inbox.create()
        .then((result) => {
          expect(typeof result.inboxId).toBe('string');
          expect(typeof result.emailAddress).toBe('string');
          expect(typeof result.createdAt).toBe('number');
        });
    });
  });

  describe('#get', () => {
    beforeAll(() => {
      AWSMock.mock('DynamoDB.DocumentClient', 'get', Promise.resolve().then((_params) => (
        { Item: { foo: 'bar' } }
      )));
    });

    afterAll(() => {
      AWSMock.restore("DynamoDB.DocumentClient");
    });

    it('can retrieve an inbox from the dynamodb', async () => {
      const inbox = new Inbox(new AWS.DynamoDB.DocumentClient, 'inboxesTestTable', 'test');

      return inbox.get('any-uuid')
        .then((result) => {
          expect(result).toHaveProperty("foo");
          expect(result.foo).toEqual("bar");
        });
    });
  });

  describe('#getByEmailAddress', () => {
    afterEach(() => {
      AWSMock.restore("DynamoDB.DocumentClient");
    });

    it('can find an inbox with by its email address', async () => {
      AWSMock.mock('DynamoDB.DocumentClient', 'query', Promise.resolve().then((_params) => (
        { Items: [{ foo: 'bar' }] }
      )));
      const inbox = new Inbox(new AWS.DynamoDB.DocumentClient, 'inboxesTestTable', 'test');

      return inbox.getByEmailAddress('email@example.com')
        .then((result) => {
          expect(result).toHaveProperty("foo");
          expect(result.foo).toEqual("bar");
        });
    });

    it('returns null when no inbox is found', async () => {
      AWSMock.mock('DynamoDB.DocumentClient', 'query', Promise.resolve().then((_params) => (
        { Items: [] }
      )));
      const inbox = new Inbox(new AWS.DynamoDB.DocumentClient, 'inboxesTestTable', 'test');

      return inbox.getByEmailAddress('email@example.com')
        .then((result) => {
          expect(result).toEqual(null);
        });
    });
  });

  describe('#emailDomain', () => {
    it('returns the production domain when the stage is prod', () => {
      const inbox = new Inbox(new AWS.DynamoDB.DocumentClient, 'inboxesTestTable', 'prod');

      expect(inbox.emailDomain()).toBe('bottlenosemail.com');
    });

    it('returns the development domain when the stage is not prod', () => {
      const inbox = new Inbox(new AWS.DynamoDB.DocumentClient, 'inboxesTestTable', 'test');

      expect(inbox.emailDomain()).toBe('bottlenosemail-dev.com');
    });
  });
});