# AWS CDK GraphQL API with DynamoDB

This project demonstrates how to use AWS CDK with TypeScript to create and deploy a GraphQL API powered by AppSync and DynamoDB. The infrastructure is organized into two stacks: **Data Stack** and **API Stack**, with a clear separation of stateful and stateless components.

## Project Structure
This project was created using this [template](https://github.com/AminFazlMondo/deployable-awscdk-app-ts)

The project is structured into two main folders:

- **`stateful/`**: Contains components that manage data or state, such as DynamoDB tables. These components hold persistent data and are central to the application's storage requirements.

- **`stateless/`**: Contains components that manage computation and API logic, such as the AppSync GraphQL API. These components are stateless, focusing on executing operations rather than persisting data.

### Why this structure?

This folder structure follows the **separation of concerns** principle. By isolating stateful resources from stateless ones, the project becomes more modular, maintainable, and scalable:

1. **Stateful (`stateful/`)**: These resources, such as DynamoDB tables, define the persistent storage and are typically long-lived and harder to replace without data migration.
2. **Stateless (`stateless/`)**: These components are easier to recreate or update. By keeping them separate, you can iterate quickly on API logic without risking the underlying data.

## Stacks Overview

### Data Stack (`stateful/data-stack`)

The `DataStack` defines a DynamoDB table that serves as the persistent backend for the GraphQL API. This table stores customer and order information, including nested product data for each order.

Key features:
- **Partition Key**: `PK` (e.g., `CUSTOMER#email1@example.com` for customers).
- **Sort Key**: `SK` (e.g., `ORDER#1` for orders).
- **Billing Mode**: PAY_PER_REQUEST for cost efficiency.
- Dynamically seeded with initial data using an AWS Lambda function.

### API Stack (`stateless/gql-api`)

The `GraphQLApi` stack defines the AppSync GraphQL API that interacts with the DynamoDB table. It includes resolvers for queries to fetch and manipulate data.

Key features:
- Authentication: `API_KEY` (can be replaced with other methods like IAM or Cognito).
- Queries supported:
  - `orders`: Fetch customer orders, including nested customer and product details.

## Getting Started

### Prerequisites

- Node.js (20.x or later)
- AWS CLI configured with proper credentials
- CDK CLI installed globally (`npm install -g aws-cdk`)

### Install Dependencies

```bash
npm install
```

### Deploy the Stacks

To deploy the entire project:

```bash
cdk deploy --all
```

This will deploy both `data-stack` and `api-stack` as part of the root stack.

### Test the Deployment

Unit tests are included for validating stack resources using the AWS CDK `assertions` library. Run tests with:

```bash
npm test
```

## Tests

Tests are included to ensure that:

- The DynamoDB table is created with the correct schema.
- The AppSync GraphQL API is deployed with proper configuration.
- Resolvers and data sources are correctly linked.

Example:

```typescript
test('GraphQLApi has correct properties', () => {
  const template = Template.fromStack(api);
  template.hasResourceProperties('AWS::AppSync::GraphQLApi', {
    AuthenticationType: 'API_KEY',
    Name: 'graphql-api',
  });
});
```

## Diagram

The project includes the following architecture:

1. **DynamoDB Table**: Stores customer, order, and product data.
2. **AppSync GraphQL API**: Provides a query interface to retrieve and manipulate data.
3. **Resolvers**: Link GraphQL queries to DynamoDB operations.

## Summary

This project illustrates how to use AWS CDK to create an API-first architecture with AppSync and DynamoDB. By separating stateful and stateless components, it ensures a clean design, allowing for modular development and easy maintenance.
