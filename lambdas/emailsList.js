import { simpleParser } from "mailparser";
import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";
import s3 from "../libs/s3-lib";

async function getInbox(inboxId) {
  const params = {
    TableName: process.env.inboxesTableName,
    Key: { inboxId: inboxId }
  };

  const result = await dynamoDb.get(params);
  const inbox = result.Item;
  if ( ! inbox) {
    throw new Error("Inbox not found.");
  }

  return inbox;
}

async function getEmails(emailAddress) {
  const params = {
    TableName: process.env.emailsTableName,
    IndexName: 'EmailAddressIndex',
    KeyConditionExpression: 'emailAddress = :email_address',
    ExpressionAttributeValues: { ':email_address': emailAddress }
  };
  const result = await dynamoDb.query(params);

  return result.Items;
}

async function getS3Email(emailObject) {
  const params = {
    Bucket: emailObject.bucketName,
    Key: emailObject.bucketObjectKey
  };
  const emailData = await s3.get(params);

  return await simpleParser(emailData.Body);
}

export const main = handler(async (event, context) => {
  let inboxId;
  if (event.queryStringParameters && event.queryStringParameters.inboxId) {
    inboxId = event.queryStringParameters.inboxId;
  } else {
    throw new Error("Inbox ID is missing.");
  }

  const inbox = await getInbox(inboxId);
  const emails = await getEmails(inbox.emailAddress);

  // Return the retrieved item
  return await Promise.all(emails.map(async (email) => {
    const parsedEmailData = await getS3Email(email);

    delete email.bucketName;
    delete email.bucketObjectKey;

    return {
      ...email,
      bodyHtml: parsedEmailData.html,
      bodyText: parsedEmailData.text,
    };
  }));
});
