import { StackProps } from 'aws-cdk-lib';
import { Stage } from '../utils/env';
export interface AppStackProps extends StackProps {
  stage: Stage;
}