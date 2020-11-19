[![NPM version](https://badge.fury.io/js/cdk-changelog-slack-notify.svg)](https://badge.fury.io/js/cdk-changelog-slack-notify)
[![PyPI version](https://badge.fury.io/py/cdk-changelog-slack-notify.svg)](https://badge.fury.io/py/cdk-changelog-slack-notify)
![Release](https://github.com/clarencetw/cdk-changelog-slack-notify/workflows/Release/badge.svg)

# cdk-changelog-slack-notify

`cdk-changelog-slack-notify` is an AWS CDK construct library that allows you to send slack notification for new changes pushed to CodeCommit with AWS CDK in Typescript or Python.

# Sample

```ts
import * as cdk from '@aws-cdk/core';
import { ChangelogSlackNotify } from 'cdk-changelog-slack-notify';

const app = new cdk.App();

const env = {
    region: process.env.CDK_DEFAULT_REGION,
    account: process.env.CDK_DEFAULT_ACCOUNT,
};

const demoStack = new cdk.Stack(app, 'DemoStack', { env });

new ChangelogSlackNotify(testStack, 'ChangelogSlackNotify', {
    repositoryName: 'test-repo',
    slackToken: 'slack-token',
    channelName: 'slack-channel-name',
});
```

# Deploy

```sh
cdk deploy
```
