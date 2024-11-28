import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

import { marshall } from "@aws-sdk/util-dynamodb";

export async function handler() {
  const tableName = process.env.TABLE_NAME as string

  const seedData = [
    // Customers
    {
      PK: 'CUSTOMER#email1@example.com',
      SK: 'CUSTOMER',
      fullName: 'John Doe',
    },
    {
      PK: 'CUSTOMER#email2@example.com',
      SK: 'CUSTOMER',
      fullName: 'Jane Smith',
    },
    // Orders for John Doe
    {
      PK: 'CUSTOMER#email1@example.com',
      SK: 'ORDER#1',
      date: '2024-01-01',
      totalAmount: 100,
      products: [
        { name: 'Product A', price: 50, quantity: 1 },
        { name: 'Product B', price: 25, quantity: 2 },
      ],
    },
    {
      PK: 'CUSTOMER#email1@example.com',
      SK: 'ORDER#2',
      date: '2024-01-02',
      totalAmount: 75,
      products: [{ name: 'Product C', price: 75, quantity: 1 }],
    },
    // Products
    {
      PK: 'PRODUCT#Product A',
      SK: 'PRODUCT',
      price: 50,
    },
    {
      PK: 'PRODUCT#Product B',
      SK: 'PRODUCT',
      price: 25,
    },
    {
      PK: 'PRODUCT#Product C',
      SK: 'PRODUCT',
      price: 75,
    },
  ];
  // Insert into dynamodb
  const dynamodb = new DynamoDBClient()

  try {
    const insertPromises = seedData.map((item) => {
      const params = {
        TableName: tableName,
        Item: marshall(item),
      };
      return dynamodb.send(new PutItemCommand(params));
    });

    await Promise.all(insertPromises);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "All items inserted successfully." }),
    };
  } catch (error) {
    console.error("Error inserting items:", error);
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "Failed to insert items.",
        error: error.message,
      }),
    };
  }

}