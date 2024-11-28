import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { DataStack } from '../src/stateful/data-stack';
import { GraphQLApi } from '../src/stateless/gql-api';
import { Stage } from '../src/utils/env';

let app: App;
let dataStack: DataStack;
let api: GraphQLApi;

beforeAll(() => {
  app = new App();
  dataStack = new DataStack(app, 'data-stack', { stage: Stage.test });
  api = new GraphQLApi(app, 'api-stack', { stage: Stage.test, dynamoTable: dataStack.table });
});

describe('GraphQLApi Tests', () => {
  let apiTemplate: Template;

  beforeAll(() => {
    apiTemplate = Template.fromStack(api);
  });

  test('GraphQLApi stack is created', () => {
    apiTemplate.resourceCountIs('AWS::AppSync::GraphQLApi', 1);
  });

  test('AppSync DataSource is created', () => {
    apiTemplate.resourceCountIs('AWS::AppSync::DataSource', 1);
  });

  test('AppSync Resolver is created', () => {
    apiTemplate.resourceCountIs('AWS::AppSync::Resolver', 1);
  });

  test('GraphQLApi has correct properties', () => {
    apiTemplate.hasResourceProperties('AWS::AppSync::GraphQLApi', {
      AuthenticationType: 'API_KEY',
      Name: 'graphql-api-test',
    });
  });
});

describe('DynamoDB Tests', () => {
  let dataTemplate: Template;

  beforeAll(() => {
    dataTemplate = Template.fromStack(dataStack);
  });

  test('DynamoDB Table is created', () => {
    dataTemplate.resourceCountIs('AWS::DynamoDB::Table', 1);
  });

  test('DynamoDB Table has correct attributes', () => {
    dataTemplate.hasResourceProperties('AWS::DynamoDB::Table', {
      AttributeDefinitions: [
        {
          AttributeName: 'PK',
          AttributeType: 'S',
        },
        {
          AttributeName: 'SK',
          AttributeType: 'S',
        },
      ],
      KeySchema: [
        {
          AttributeName: 'PK',
          KeyType: 'HASH',
        },
        {
          AttributeName: 'SK',
          KeyType: 'RANGE',
        },
      ],
      BillingMode: 'PAY_PER_REQUEST',
    });
  });

});
