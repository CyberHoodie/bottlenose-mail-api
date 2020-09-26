import { v4 as uuid } from "uuid";
import { nanoid } from "nanoid";
import dynamoDb from "../libs/dynamodb-lib";

function setEmailDomain() {
  if (process.env.stage == "prod") {
    return "bottlenosemail.com";
  } else {
    return "bottlenosemail-dev.com";
  }
}

export default {
  create: async () => {
    const item = {
      inboxId: uuid(),
      emailAddress: `${nanoid(10).toLowerCase()}@${setEmailDomain()}`,
      createdAt: Date.now()
    };

    await dynamoDb.put({
      TableName: process.env.inboxesTableName,
      Item: item
    });

    return item;
  },

  get: async (id) => {
    const response = await dynamoDb.get({
      TableName: process.env.inboxesTableName,
      Key: { inboxId: id }
    });

    return response.Item;
  },

  getByEmailAddress: async (emailAddress) => {
    const response = await dynamoDb.query({
      TableName: process.env.inboxesTableName,
      IndexName: 'EmailAddressIndex',
      KeyConditionExpression: 'emailAddress = :email_address',
      ExpressionAttributeValues: { ':email_address': emailAddress}
    });

    return response.Items.length > 0 ? response.Items[0] : null;
  }
};