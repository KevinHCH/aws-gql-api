import { join } from 'path';
import { CfnOutput, Duration, Stack, RemovalPolicy } from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as customResources from 'aws-cdk-lib/custom-resources';
import { InvocationType } from 'aws-cdk-lib/triggers';
import { Construct } from 'constructs';
import { AppStackProps } from '../types/app-stack';

export class DataStack extends Stack {
  public readonly table: dynamodb.Table;
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);
    // dynamodb
    this.table = new dynamodb.Table(this, 'orders', {
      tableName: `orders-${props.stage}`,
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // seed function
    const seedFn = new NodejsFunction(this, 'seedFn', {
      entry: join(__dirname, '..', '..', '/lambda/seed.ts'),
      handler: 'handler',
      runtime: Runtime.NODEJS_22_X,
      timeout: Duration.seconds(30),
      environment: {
        TABLE_NAME: this.table.tableName,
      },
    });
    this.table.grantReadWriteData(seedFn);

    // seed custom resource on create
    const seedResource = new customResources.AwsCustomResource(this, 'seed-data-on-create', {
      onCreate: {
        service: 'Lambda',
        action: 'invoke',
        parameters: {
          FunctionName: seedFn.functionName,
          InvocationType: InvocationType.REQUEST_RESPONSE,
        },
        physicalResourceId: customResources.PhysicalResourceId.of('seed-data-on-create'),
      },
      policy: customResources.AwsCustomResourcePolicy.fromStatements([
        new PolicyStatement({
          actions: ['lambda:InvokeFunction'],
          resources: [seedFn.functionArn],
        }),
      ]),
    });
    seedResource.node.addDependency(this.table);
    new CfnOutput(this, 'TableName', { value: this.table.tableName, description: 'Dynamo db which has all our data.' });
    new CfnOutput(this, 'SeedFunctionName', { value: seedFn.functionName, description: 'Lambda function which will seed the data we need.' });

  }
}
