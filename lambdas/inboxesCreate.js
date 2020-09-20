import { v4 as uuid } from "uuid";
import { nanoid } from "nanoid";
import handler from "../libs/handler-lib";
import dynamoDb from "../libs/dynamodb-lib";

function setEmailDomain() {
  if (process.env.stage == "prod") {
    return "bottlenosemail.com";
  } else {
    return "bottlenosemail-dev.com";
  }
}

export const main = handler(async (event, context) => {
  const params = {
    TableName: process.env.inboxesTableName,
    // 'Item' contains the attributes of the item to be created
    // - 'inboxId': a unique uuid
    // - 'emailAddress': a unique email address
    // - 'createdAt': current Unix timestamp
    Item: {
      inboxId: uuid(),
      emailAddress: `${nanoid(10).toLowerCase()}@${setEmailDomain()}`,
      createdAt: Date.now()
    }
  };

  await dynamoDb.put(params);

  return params.Item;
});