import AWS from "aws-sdk";
import handler from "../libs/handler-lib";
import Email from "../libs/email-lib";

export const main = handler(async (event, context) => {
  const dynamoDbClient = new AWS.DynamoDB.DocumentClient;
  const s3Client = new AWS.S3;
  const email = new Email(dynamoDbClient, s3Client, process.env.inboxesTableName);
  const result = await email.get(event.pathParameters.id);

  return result;
});