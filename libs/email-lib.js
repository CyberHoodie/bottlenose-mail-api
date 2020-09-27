import { v4 as uuid } from "uuid";
import mailparser, { simpleParser } from "mailparser";

export default class Email {
  constructor(database, fileStorage, tableName) {
    this.tableName = tableName;
    this.fileStorage = fileStorage;
    this.database = database;
  }

  list(emailAddress) {
    return this.database.query({
      TableName: this.tableName,
      IndexName: 'EmailAddressIndex',
      KeyConditionExpression: 'emailAddress = :email_address',
      ExpressionAttributeValues: { ':email_address': emailAddress }
    }).promise()
      .then((response) => (
        response.Items.map((email) => this.cleanEmail(email))
      ));
  }

  get(id) {
    return this.database.get({
      TableName: process.env.emailsTableName,
      Key: { emailId: id }
    }).promise()
      .then((response) => {
        const email = response.Item;
        if ( ! email) {
          throw new Error("Item not found.");
        }

        return this.getEmailFile(email.bucketName, email.bucketObjectKey)
          .then((s3Email) => {
            const fullEmail = {
              ...email,
              bodyHtml: s3Email.html,
              bodyText: s3Email.text
            };

            return this.cleanEmail(fullEmail);
          });
      });
  }

  create(bucketName, bucketObjectKey) {
    return this.fileStorage.getObject({
      Bucket: bucketName,
      Key: bucketObjectKey
    }).promise()
      .then((data) => {
        return simpleParser(data.Body)
          .then((email) => {
            return this.database.put({
              TableName: this.tableName,
              Item: {
                emailId: uuid(),
                emailAddress: email.to.text,
                date: email.date.getTime(),
                subject: email.subject,
                from: email.from.text,
                bucketName: bucketName,
                bucketObjectKey: bucketObjectKey,
              }
            }).promise();
          });
      });
  }

  getEmailFile(bucketName, bucketObjectKey) {
    return this.fileStorage.getObject({
      Bucket: bucketName,
      Key: bucketObjectKey
    }).promise()
      .then((response) => {
        return mailparser.simpleParser(response.Body)
          .then((parsed) => {
            return parsed;
          });
      });
  }

  cleanEmail(email) {
    // eslint-disable-next-line no-unused-vars
    const { bucketName, bucketObjectKey, ...cleanedEmail} = email;
    return cleanedEmail;
  }
}
