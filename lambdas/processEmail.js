import { v4 as uuid } from "uuid";
import { simpleParser } from "mailparser";
import s3 from "../libs/s3-lib";
import dynamoDb from "../libs/dynamodb-lib";

export async function main(event, context) {
  const record = event.Records[0];
  const s3Params = {
    Bucket: record.s3.bucket.name,
    Key: record.s3.object.key
  };

  try {
    const data = await s3.get(s3Params);
    const email = await simpleParser(data.Body);

    await dynamoDb.put({
      TableName: process.env.emailsTableName,
      Item: {
        emailId: uuid(),
        emailAddress: email.to.text,
        date: email.date.getTime(),
        subject: email.subject,
        from: email.from.text,
        bucketName: s3Params.Bucket,
        bucketObjectKey: s3Params.Key,
      }
    });
  } catch (Error) {
    console.log(Error, Error.stack);
    return Error;
  }
}