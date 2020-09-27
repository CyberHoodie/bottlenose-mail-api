import AWS from "aws-sdk";
import Email from "../libs/email-lib";

export async function main(event, context) {
  const record = event.Records[0];

  try {
    const dynamoDbClient = new AWS.DynamoDB.DocumentClient;
    const s3Client = new AWS.S3;
    const email = new Email(dynamoDbClient, s3Client, process.env.emailsTableName);

    email.create(record.s3.bucket.name, record.s3.object.key);
  } catch (Error) {
    console.log(Error, Error.stack);
    return Error;
  }
}