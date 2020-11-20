[![NPM version](https://badge.fury.io/js/cdk-changelog-slack-notify.svg)](https://badge.fury.io/js/cdk-changelog-slack-notify)
[![PyPI version](https://badge.fury.io/py/cdk-changelog-slack-notify.svg)](https://badge.fury.io/py/cdk-changelog-slack-notify)
![Release](https://github.com/mikeyangyo/cdk-changelog-slack-notify/workflows/Release/badge.svg)
[![codecov](https://codecov.io/gh/mikeyangyo/cdk-changelog-slack-notify/branch/main/graph/badge.svg?token=MNQ4CKJDLS)](https://codecov.io/gh/mikeyangyo/cdk-changelog-slack-notify)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli)

![Downloads](https://img.shields.io/badge/-DOWNLOADS:-brightgreen?color=grey)
![npm](https://img.shields.io/npm/dt/cdk-changelog-slack-notify?label=npm&color=orange)
![PyPI](https://img.shields.io/pypi/dm/cdk-changelog-slack-notify?label=pypi&color=blue)

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

# Screenshots

## without changelog:
![without changelog image](https://raw.githubusercontent.com/mikeyangyo/cdk-changelog-slack-notify/main/images/without_changelog.png "Demo image w/o changelog file")

## with changelog :
![with changelog image](https://raw.githubusercontent.com/mikeyangyo/cdk-changelog-slack-notify/main/images/with_changelog.png "Demo image w/ changelog file")

# Credits

This project a based heavily on work by the following:

* commitizen-tools for [commitizen]

[commitizen]: https://github.com/commitizen-tools/commitizen
