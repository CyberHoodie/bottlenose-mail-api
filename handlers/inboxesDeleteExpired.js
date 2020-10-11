import AWS from "aws-sdk";
import Inbox from "../libs/inbox-lib";
import Email from "../libs/email-lib";

export async function main(event, context) {

  try {
    const dynamoDbClient = new AWS.DynamoDB.DocumentClient;
    const s3Client = new AWS.S3;
    const inbox = new Inbox(dynamoDbClient, process.env.inboxesTableName, process.env.stage);
    const email = new Email(dynamoDbClient, s3Client, process.env.emailsTableName);

    await inbox.findOldInboxes()
      .then((inboxes) => {
        inboxes.forEach(({ inboxId }) => {
          inbox.delete(inboxId);
          email.list(inboxId).then((emails) => {
            emails.forEach(({ emailId }) => email.delete(emailId));
          });
        });
      });
  } catch (Error) {
    console.log(Error, Error.stack);
    return Error;
  }
}