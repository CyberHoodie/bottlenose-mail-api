import AWS from "aws-sdk";
import AWSMock from "aws-sdk-mock";
import { validate as uuidVvalidate } from "uuid";
import Email from "../../libs/email-lib";

AWSMock.setSDKInstance(AWS);

describe('#Email', () => {
  it('is an object', () => {
    const email = new Email(
      new AWS.DynamoDB.DocumentClient,
      new AWS.S3,
      'emailsTestTable'
    );

    expect(typeof email).toBe('object');
  });

  it('has expected functions', () => {
    const email = new Email(
      new AWS.DynamoDB.DocumentClient,
      new AWS.S3,
      'emailsTestTable'
    );

    expect(typeof email.list).toBe('function');
    expect(typeof email.get).toBe('function');
    expect(typeof email.create).toBe('function');
  });

  describe('#list', () => {
    let queryObjectMock;

    beforeEach(() => {
      queryObjectMock = jest.fn(() => (
        { Items: [{ foo: "bar",  bucketName: "bucketname", bucketObjectKey: "bucketkey"}] }
      ));
      AWSMock.mock('DynamoDB.DocumentClient', 'query', (params, callback) => {
        callback(null, queryObjectMock(params));
      });
    });

    afterEach(() => {
      AWSMock.restore("DynamoDB.DocumentClient");
    });

    it('returns a list of items', () => {
      const email = new Email(
        new AWS.DynamoDB.DocumentClient,
        new AWS.S3,
        'emailsTestTable'
      );

      return email.list('inbox-uuid')
        .then((result) => {
          expect(Array.isArray(result)).toBe(true);
        });
    });

    it('finds emails based on inboxId', () => {
      const email = new Email(
        new AWS.DynamoDB.DocumentClient,
        new AWS.S3,
        'emailsTestTable'
      );

      return email.list('inbox-uuid')
        .then((result) => {
          expect(queryObjectMock).toBeCalledWith(
            expect.objectContaining({ ExpressionAttributeValues: { ':inbox_id': 'inbox-uuid' } })
          );
        });
    })

    it('does not return bucket information with the email', () => {
      const email = new Email(
        new AWS.DynamoDB.DocumentClient,
        new AWS.S3,
        'emailsTestTable'
      );

      return email.list('inbox-uuid')
        .then((result) => {
          expect(result[0]).not.toHaveProperty("bucketName");
          expect(result[0]).not.toHaveProperty("bucketObjectKey");
        });
    });
  });

  describe('#get', () => {
    beforeEach(() => {
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

    afterEach(() => {
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

    it('throws an error if an email is not found', () => {
      AWSMock.restore("DynamoDB.DocumentClient");
      AWSMock.mock('DynamoDB.DocumentClient', 'get', Promise.resolve().then((_params) => ({
        Item: null
      })));

      const email = new Email(
        new AWS.DynamoDB.DocumentClient,
        new AWS.S3,
        'emailsTestTable'
      );

      expect(email.get('non-existant-uuid'))
        .rejects.toThrow(expect.objectContaining({ statusCode: 404 }));
    })

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
    let queryObjectMock;

    beforeEach(() => {
      queryObjectMock = jest.fn(() => ({ Items: [{ inboxId: "inbox-uuid" }] }));
      AWSMock.mock('DynamoDB.DocumentClient', 'put');
      AWSMock.mock('DynamoDB.DocumentClient', 'query', (params, callback) => {
        callback(null, queryObjectMock(params));
      });
      AWSMock.mock('S3', 'getObject', Promise.resolve().then((_params) => (
        { Body: test }
      )));

      require('mailparser').__setMockEmail({
        to: { text: "test@email.com" },
        from: { text: "Will <will@email.com" },
        subject: "test email",
        date: new Date,
      });
    });

    afterEach(() => {
      AWSMock.restore("DynamoDB.DocumentClient");
      AWSMock.restore("S3");
    });

    it('creates an email with a uuid', () => {
      const email = new Email(
        new AWS.DynamoDB.DocumentClient,
        new AWS.S3,
        'emailsTestTable'
      );

      return email.create('bucketname', 'bucketkey', 'inboxesTestTable', 'test')
        .then((result) => {
          expect(typeof result.emailId).toBe('string');
          expect(uuidVvalidate(result.emailId)).toBe(true);
        });
    });

    it('assigns an inbox id to the email', () => {
      const email = new Email(
        new AWS.DynamoDB.DocumentClient,
        new AWS.S3,
        'emailsTestTable'
      );

      return email.create('bucketname', 'bucketkey', 'inboxesTestTable', 'test')
        .then((result) => {
          expect(typeof result.inboxId).toBe('string');
          expect(result.inboxId).toBe(queryObjectMock().Items[0].inboxId);
        });
    })

    it('throws an error if no associated inbox is found', () => {
      const emptyQueryObjectMock = jest.fn(() => ({ Items: [] }));
      AWSMock.remock('DynamoDB.DocumentClient', 'query', (params, callback) => {
        callback(null, emptyQueryObjectMock(params));
      });

      const email = new Email(
        new AWS.DynamoDB.DocumentClient,
        new AWS.S3,
        'emailsTestTable'
      );

      expect.assertions(1);
      return email.create('bucketname', 'bucketkey', 'inboxesTestTable', 'test')
        .catch((error) => {
          expect(error.message).toMatch("Email creation attempted without a valid inbox.");
        });
    })

    it('adds mime information to DynamoDB record', () => {
      const email = new Email(
        new AWS.DynamoDB.DocumentClient,
        new AWS.S3,
        'emailsTestTable'
      );

      return email.create('bucketname', 'bucketkey', 'inboxesTestTable', 'test')
        .then((result) => {
          expect(typeof result.emailAddress).toBe('string');
          expect(typeof result.date).toBe('number');
          expect(typeof result.subject).toBe('string');
          expect(typeof result.from).toBe('string');
        });
    });
  });
});