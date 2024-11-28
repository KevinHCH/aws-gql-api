import { DeployableAwsCdkTypeScriptApp } from 'deployable-awscdk-app-ts';
import { NodePackageManager } from 'projen/lib/javascript';
const project = new DeployableAwsCdkTypeScriptApp({
  cdkVersion: '2.1.0',
  defaultReleaseBranch: 'main',
  devDeps: ['deployable-awscdk-app-ts', '@aws-sdk/client-dynamodb', '@aws-sdk/util-dynamodb'],
  name: 'aws-gql-api',
  projenrcTs: true,
  packageManager: NodePackageManager.NPM,
  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();