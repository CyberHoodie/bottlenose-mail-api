import { v4 as uuid } from "uuid";
import { simpleParser } from "mailparser";
import dynamoDb from "../libs/dynamodb-lib";
import s3 from "../libs/s3-lib";

async function getS3(bucketName, bucketObjectKey) {
  const emailData = await s3.get({
    Bucket: bucketName,
    Key: bucketObjectKey
  });

  return await simpleParser(emailData.Body);
}

function cleanEmail(email) {
  // eslint-disable-next-line no-unused-vars
  const { bucketName, bucketObjectKey, ...cleanedEmail} = email;
  return cleanedEmail;
}

export default {
  list: async (emailAddress) => {
    const response = await dynamoDb.query({
      TableName: process.env.emailsTableName,
      IndexName: 'EmailAddressIndex',
      KeyConditionExpression: 'emailAddress = :email_address',
      ExpressionAttributeValues: { ':email_address': emailAddress }
    });

    return response.Items.map((email) => cleanEmail(email));
  },

  get: async (id) => {
    const response = await dynamoDb.get({
      TableName: process.env.emailsTableName,
      Key: { emailId: id }
    });

    const email = response.Item;
    if ( ! email) {
      throw new Error("Item not found.");
    }

    const s3Email = getS3(email.bucketName, email.bucketObjectKey);
    const fullEmail = { ...email, bodyHtml: s3Email.html, bodyText: s3Email.text };

    return cleanEmail(fullEmail);
  },

  create: async (bucketName, bucketObjectKey) => {
    const data = await s3.get({ Bucket: bucketName, Key: bucketObjectKey });
    const email = await simpleParser(data.Body);

    await dynamoDb.put({
      TableName: process.env.emailsTableName,
      Item: {
        emailId: uuid(),
        emailAddress: email.to.text,
        date: email.date.getTime(),
        subject: email.subject,
        from: email.from.text,
        bucketName: bucketName,
        bucketObjectKey: bucketObjectKey,
      }
    });
  }
};