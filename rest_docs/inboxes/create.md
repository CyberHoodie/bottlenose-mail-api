# Create an Inbox

`POST /inboxes`

## Description

Create an empty inbox. Inboxes will self-destruct after 1 day.

## Successful Response

**Code**: `200`

**Content Example**
```json
{
  "inboxId": "d843bdd6-7c86-43e0-a3e4-0405d08c0f24",
  "emailAddress": "wn0x8rp1py@bottlenosemail.com",
  "createdAt": "1599696547782"
}
```

## Error Response

**Code**: `500`

**Content Example**
```json
{
  "error": "Some error message"
}
```