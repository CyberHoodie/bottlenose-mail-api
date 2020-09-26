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
    const result = await dynamoDb.query({
      TableName: process.env.emailsTableName,
      IndexName: 'EmailAddressIndex',
      KeyConditionExpression: 'emailAddress = :email_address',
      ExpressionAttributeValues: { ':email_address': emailAddress }
    });

    return result.Items.map((email) => cleanEmail(email));
  },

  get: async (id) => {
    const result = await dynamoDb.get({
      TableName: process.env.emailsTableName,
      Key: { emailId: id }
    });

    const email = result.Item;
    if ( ! email) {
      throw new Error("Item not found.");
    }

    const s3Result = getS3(email.bucketName, email.bucketObjectKey);
    const fullEmail = { ...email, bodyHtml: s3Result.html, bodyText: s3Result.text };

    return cleanEmail(fullEmail);
  }
};