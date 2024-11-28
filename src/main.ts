
import { App, Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DataStack } from './stateful/data-stack';
import { GraphQLApi } from './stateless/gql-api';
import { AppStackProps } from './types/app-stack';
import { getStage, Stage } from './utils/env';

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);
    const dataStack = new DataStack(this, 'data-stack', props);
    const api = new GraphQLApi(this, 'api-stack', { ...props, dynamoTable: dataStack.table });

    api.node.addDependency(dataStack);
  }
}

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const stage = getStage(process.env.CDK_STAGE as Stage) as Stage;
const app = new App();

new AppStack(app, `aws-orders-api-${stage}`, { env, stage });

app.synth();