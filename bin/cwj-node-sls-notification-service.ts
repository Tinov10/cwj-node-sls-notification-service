#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CwjNodeSlsNotificationServiceStack } from '../lib/cwj-node-sls-notification-service-stack';

const app = new cdk.App();
new CwjNodeSlsNotificationServiceStack(
  app,
  'CwjNodeSlsNotificationServiceStack',
  {}
);
