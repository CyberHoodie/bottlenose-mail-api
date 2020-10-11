import AWS from "aws-sdk";
import Email from "../libs/email-lib";

AWS.config.logger = console;

export async function main(event, context) {
  const record = event.Records[0];

  try {
    const dynamoDbClient = new AWS.DynamoDB.DocumentClient;
    const s3Client = new AWS.S3;
    const email = new Email(dynamoDbClient, s3Client, process.env.emailsTableName);

    return email.create(record.s3.bucket.name, record.s3.object.key, process.env.inboxesTableName, process.env.stage);
  } catch (Error) {
    console.log(Error, Error.stack);
    return Error;
  }
}