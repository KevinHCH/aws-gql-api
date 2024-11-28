import { join } from 'path';
import { CfnOutput, Duration, Stack, Expiration } from 'aws-cdk-lib';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { AppStackProps } from '../types/app-stack';

interface GraphQLApiProps extends AppStackProps {
  dynamoTable: dynamodb.Table;
}
export class GraphQLApi extends Stack {
  constructor(scope: Construct, id: string, props: GraphQLApiProps) {
    super(scope, id);
    const api = new appsync.GraphqlApi(this, 'graphql-api', {
      name: `graphql-api-${props.stage}`,
      definition: appsync.Definition.fromFile(join(__dirname, '..', '..', 'graphql/schema.graphql')),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: Expiration.after(Duration.days(7)),
          },
        },
      },
    });
    const table = dynamodb.Table.fromTableArn(this, props.dynamoTable.tableName, props.dynamoTable.tableArn);
    const dataSource = api.addDynamoDbDataSource('orders', table);
    dataSource.grantPrincipal.addToPrincipalPolicy(new PolicyStatement({
      actions: ['dynamodb:Query'],
      resources: [table.tableArn],
    }));

    dataSource.createResolver('QueryOrdersResolver', {
      typeName: 'Query',
      fieldName: 'orders',
      requestMappingTemplate: appsync.MappingTemplate.dynamoDbScanTable(),
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultList(),
    });


    new CfnOutput(this, 'GraphQLApiUrl', {
      value: api.graphqlUrl,
      description: 'GraphQL API URL',
    });
  }
}
