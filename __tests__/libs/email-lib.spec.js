import AWS from "aws-sdk";
import AWSMock from "aws-sdk-mock";
import Email from "../../libs/email-lib";

AWSMock.setSDKInstance(AWS);

describe('#Email', () => {
  it('is an object', () => {
    const email = new Email(new AWS.DynamoDB.DocumentClient, 'emailsTestTable', 'test');

    expect(typeof email).toBe('object');
  });

  it('has expected functions', () => {
    const email = new Email(new AWS.DynamoDB.DocumentClient, 'emailsTestTable', 'test');

    expect(typeof email.list).toBe('function');
    expect(typeof email.get).toBe('function');
    expect(typeof email.create).toBe('function');
  });

  describe('#list', () => {
    // beforeAll(() => {
    //   AWSMock.mock('DynamoDB.DocumentClient', 'put', Promise.resolve().then((params) => (
    //     { Item: params }
    //   )));
    // });

    // afterAll(() => {
    //   AWSMock.restore("DynamoDB.DocumentClient");
    // });

    // it('returns the created item after creation', () => {
    //   const inbox = new Inbox(new AWS.DynamoDB.DocumentClient, 'inboxesTestTable', 'test');

    //   return inbox.create()
    //     .then((result) => {
    //       expect(typeof result.inboxId).toBe('string');
    //       expect(typeof result.emailAddress).toBe('string');
    //       expect(typeof result.createdAt).toBe('number');
    //     });
    // });
  });

  describe('#get', () => {
    beforeAll(() => {
      AWSMock.mock('DynamoDB.DocumentClient', 'get', Promise.resolve().then((_params) => ({
        Item: {
          foo: 'bar',
          bucketName: 'bucketname',
          bucketObjectKey: 'bucketkey',
        }
      })));

      AWSMock.mock('S3', 'getObject', Promise.resolve().then((_params) => (
        { Body: 'test' }
      )));
    });

    afterAll(() => {
      AWSMock.restore("DynamoDB.DocumentClient");
      AWSMock.restore("S3");
    });

    it('can retrieve an email from the DynamoDB', () => {
      const email = new Email(
        new AWS.DynamoDB.DocumentClient,
        new AWS.S3,
        'emailsTestTable'
      );

      return email.get('any-uuid')
        .then((result) => {
          expect(result).toHaveProperty("foo");
          expect(result.foo).toEqual("bar");
        });
    });

    it('combines DynamoDB and S3 email information', () => {
      const mockedEmail = { text: 'Hi!', html: '<h1>Hi!</h1>' };
      require('mailparser').__setMockEmail(mockedEmail);
      const email = new Email(
        new AWS.DynamoDB.DocumentClient,
        new AWS.S3,
        'emailsTestTable'
      );

      return email.get('any-uuid')
        .then((result) => {
          expect(result).toHaveProperty("bodyHtml");
          expect(result).toHaveProperty("bodyText");
          expect(result.bodyText).toEqual(mockedEmail.text);
          expect(result.bodyHtml).toEqual(mockedEmail.html);
        });
    });

    it('does not return bucket information with the email', () => {
      const email = new Email(
        new AWS.DynamoDB.DocumentClient,
        new AWS.S3,
        'emailsTestTable'
      );

      return email.get('any-uuid')
        .then((result) => {
          expect(result).not.toHaveProperty("bucketName");
          expect(result).not.toHaveProperty("bucketObjectKey");
        });
    });
  });

  describe('#create', () => {
    // afterEach(() => {
    //   AWSMock.restore("DynamoDB.DocumentClient");
    // });

    // it('can find an inbox with by its email address', async () => {
    //   AWSMock.mock('DynamoDB.DocumentClient', 'query', Promise.resolve().then((_params) => (
    //     { Items: [{ foo: 'bar' }] }
    //   )));
    //   const inbox = new Inbox(new AWS.DynamoDB.DocumentClient, 'inboxesTestTable', 'test');

    //   return inbox.getByEmailAddress('email@example.com')
    //     .then((result) => {
    //       expect(result).toHaveProperty("foo");
    //       expect(result.foo).toEqual("bar");
    //     });
    // });

    // it('returns null when no inbox is found', async () => {
    //   AWSMock.mock('DynamoDB.DocumentClient', 'query', Promise.resolve().then((_params) => (
    //     { Items: [] }
    //   )));
    //   const inbox = new Inbox(new AWS.DynamoDB.DocumentClient, 'inboxesTestTable', 'test');

    //   return inbox.getByEmailAddress('email@example.com')
    //     .then((result) => {
    //       expect(result).toEqual(null);
    //     });
    // });
  });
});