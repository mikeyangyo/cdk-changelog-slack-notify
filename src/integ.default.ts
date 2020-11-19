import * as cdk from '@aws-cdk/core';
import { ChangelogSlackNotify } from './index';

export class IntegTesting {
  readonly stacks: cdk.Stack[];

  constructor() {
    const app = new cdk.App();

    const env = {
      region: process.env.CDK_DEFAULT_REGION,
      account: process.env.CDK_DEFAULT_ACCOUNT,
    };

    const testStack = new cdk.Stack(app, 'test-stack', { env });
    new ChangelogSlackNotify(testStack, 'changelogSlackNotify', {
      repositoryName: 'test-repo',
      slackToken: 'slack-token',
	  channelName: 'slack-channel-name',
    });

    this.stacks = [testStack];
  }
}

new IntegTesting();
