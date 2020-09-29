import AWS from "aws-sdk";
import handler from "../libs/handler-lib";
import Email from "../libs/email-lib";

export const main = handler(async (event, context) => {
  let inboxId;

  if (event.queryStringParameters && event.queryStringParameters.inboxId) {
    inboxId = event.queryStringParameters.inboxId;
  } else {
    throw new Error("Inbox ID is missing.");
  }

  const dynamoDbClient = new AWS.DynamoDB.DocumentClient;
  const s3Client = new AWS.S3;
  const email = new Email(dynamoDbClient, s3Client, process.env.inboxesTableName);

  return await email.list(inboxId, process.env.inboxesTableName, process.env.stage);
});