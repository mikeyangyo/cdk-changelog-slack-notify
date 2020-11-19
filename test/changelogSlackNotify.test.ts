import '@aws-cdk/assert/jest';
import { App, Stack } from '@aws-cdk/core';
import { ChangelogSlackNotify } from '../src/index';

test('create the default changelog slack notification service', () => {
  // GIVEN
  const app = new App();
  const stack = new Stack(app, 'testing-stack');
  const repositoryName = 'test-repo';

  // WHEN
  new ChangelogSlackNotify(stack, 'changelogSlackNotify', {
    repositoryName: repositoryName,
    slackToken: 'slack-token',
    channelName: 'slack-channel-name',
  });

  // THEN

  expect(stack).toHaveResource('AWS::CodeCommit::Repository', {
    RepositoryDescription: 'A repo created by ChangelogSlackNotify lib',
    RepositoryName: repositoryName,
  });

  expect(stack).toHaveResource('AWS::Lambda::Permission', {
    Action: 'lambda:InvokeFunction',
    FunctionName: {
      'Fn::GetAtt': ['changelogSlackNotifylambdafun802F40CB', 'Arn'],
    },
    Principal: 'events.amazonaws.com',
    SourceArn: {
      'Fn::GetAtt': [
        'changelogSlackNotifyRepositoryCommitToMasterRuleC74E37BD',
        'Arn',
      ],
    },
  });

  expect(stack).toHaveResource('AWS::Events::Rule', {
    EventPattern: {
      'detail': {
        event: ['referenceCreated', 'referenceUpdated'],
        referenceName: ['master'],
      },
      'detail-type': ['CodeCommit Repository State Change'],
      'resources': [
        {
          'Fn::GetAtt': ['changelogSlackNotifyRepository1646AE5D', 'Arn'],
        },
      ],
      'source': ['aws.codecommit'],
    },
    State: 'ENABLED',
    Targets: [
      {
        Arn: {
          'Fn::GetAtt': ['changelogSlackNotifylambdafun802F40CB', 'Arn'],
        },
        Id: 'Target0',
      },
    ],
  });

  expect(stack).toHaveResource('AWS::Lambda::Function', {
    Environment: {
      Variables: {
        BREAKING_CHANGE_TYPE_DISPLAY_NAME: 'BREAKING CHANGES',
        CHANNEL_NAME: 'slack-channel-name',
        FEATURE_TYPE_DISPLAY_NAME: 'New Features',
        FIX_TYPE_DISPLAY_NAME: 'Bugs Fixed',
        PERFORMANCE_TYPE_DISPLAY_NAME: 'Performance Improvement',
        SLACK_TOKEN: 'slack-token',
        UNDEFINED_TYPE_DISPLAY_NAME: 'Others',
      },
    },
    Handler: 'index.handler',
    MemorySize: 128,
    Role: {
      'Fn::GetAtt': ['changelogSlackNotifylambdafunServiceRoleC94AD9DB', 'Arn'],
    },
    Runtime: 'python3.7',
    Timeout: 5,
  });

  expect(stack).toHaveResource('AWS::IAM::Role', {
    AssumeRolePolicyDocument: {
      Statement: [
        {
          Action: 'sts:AssumeRole',
          Effect: 'Allow',
          Principal: {
            Service: 'lambda.amazonaws.com',
          },
        },
      ],
      Version: '2012-10-17',
    },
    ManagedPolicyArns: [
      {
        'Fn::Join': [
          '',
          [
            'arn:',
            {
              Ref: 'AWS::Partition',
            },
            ':iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
          ],
        ],
      },
    ],
  });

  expect(stack).toHaveResource('AWS::IAM::Policy', {
    PolicyDocument: {
      Statement: [
        {
          Action: ['codecommit:GetDifferences', 'codecommit:GetCommit'],
          Effect: 'Allow',
          Resource: {
            'Fn::GetAtt': ['changelogSlackNotifyRepository1646AE5D', 'Arn'],
          },
        },
      ],
      Version: '2012-10-17',
    },
    PolicyName: 'changelogSlackNotifylambdafunServiceRoleDefaultPolicyD2073092',
    Roles: [
      {
        Ref: 'changelogSlackNotifylambdafunServiceRoleC94AD9DB',
      },
    ],
  });
});

test('add existing repo reuse support', () => {
  // GIVEN
  const app = new App();
  const stack = new Stack(app, 'testing-stack');
  const repositoryName = 'test-repo';

  // WHEN
  new ChangelogSlackNotify(stack, 'changelogSlackNotify', {
    repositoryName: repositoryName,
    slackToken: 'slack-token',
    channelName: 'slack-channel-name',
    fromExistRepository: true,
  });

  // THEN
  expect(stack).toHaveResource('AWS::Lambda::Permission', {
    Action: 'lambda:InvokeFunction',
    FunctionName: {
      'Fn::GetAtt': ['changelogSlackNotifylambdafun802F40CB', 'Arn'],
    },
    Principal: 'events.amazonaws.com',
    SourceArn: {
      'Fn::GetAtt': [
        'changelogSlackNotifyRepositoryCommitToMasterRuleC74E37BD',
        'Arn',
      ],
    },
  });

  expect(stack).toHaveResource('AWS::Events::Rule', {
    EventPattern: {
      'detail': {
        event: ['referenceCreated', 'referenceUpdated'],
        referenceName: ['master'],
      },
      'detail-type': ['CodeCommit Repository State Change'],
      'resources': [
        {
          'Fn::Join': [
            '',
            [
              'arn:',
              {
                Ref: 'AWS::Partition',
              },
              ':codecommit:',
              {
                Ref: 'AWS::Region',
              },
              ':',
              {
                Ref: 'AWS::AccountId',
              },
              `:${repositoryName}`,
            ],
          ],
        },
      ],
      'source': ['aws.codecommit'],
    },
    State: 'ENABLED',
    Targets: [
      {
        Arn: {
          'Fn::GetAtt': ['changelogSlackNotifylambdafun802F40CB', 'Arn'],
        },
        Id: 'Target0',
      },
    ],
  });

  expect(stack).toHaveResource('AWS::Lambda::Function', {
    Environment: {
      Variables: {
        BREAKING_CHANGE_TYPE_DISPLAY_NAME: 'BREAKING CHANGES',
        CHANNEL_NAME: 'slack-channel-name',
        FEATURE_TYPE_DISPLAY_NAME: 'New Features',
        FIX_TYPE_DISPLAY_NAME: 'Bugs Fixed',
        PERFORMANCE_TYPE_DISPLAY_NAME: 'Performance Improvement',
        SLACK_TOKEN: 'slack-token',
        UNDEFINED_TYPE_DISPLAY_NAME: 'Others',
      },
    },
    Handler: 'index.handler',
    MemorySize: 128,
    Role: {
      'Fn::GetAtt': ['changelogSlackNotifylambdafunServiceRoleC94AD9DB', 'Arn'],
    },
    Runtime: 'python3.7',
    Timeout: 5,
  });

  expect(stack).toHaveResource('AWS::IAM::Role', {
    AssumeRolePolicyDocument: {
      Statement: [
        {
          Action: 'sts:AssumeRole',
          Effect: 'Allow',
          Principal: {
            Service: 'lambda.amazonaws.com',
          },
        },
      ],
      Version: '2012-10-17',
    },
    ManagedPolicyArns: [
      {
        'Fn::Join': [
          '',
          [
            'arn:',
            {
              Ref: 'AWS::Partition',
            },
            ':iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
          ],
        ],
      },
    ],
  });

  expect(stack).toHaveResource('AWS::IAM::Policy', {
    PolicyDocument: {
      Statement: [
        {
          Action: ['codecommit:GetDifferences', 'codecommit:GetCommit'],
          Effect: 'Allow',
          Resource: {
            'Fn::Join': [
              '',
              [
                'arn:',
                {
                  Ref: 'AWS::Partition',
                },
                ':codecommit:',
                {
                  Ref: 'AWS::Region',
                },
                ':',
                {
                  Ref: 'AWS::AccountId',
                },
                `:${repositoryName}`,
              ],
            ],
          },
        },
      ],
      Version: '2012-10-17',
    },
    PolicyName: 'changelogSlackNotifylambdafunServiceRoleDefaultPolicyD2073092',
    Roles: [
      {
        Ref: 'changelogSlackNotifylambdafunServiceRoleC94AD9DB',
      },
    ],
  });
});

test('add reading changelog file support', () => {
  // GIVEN
  const app = new App();
  const stack = new Stack(app, 'testing-stack');
  const repositoryName = 'test-repo';

  // WHEN
  new ChangelogSlackNotify(stack, 'changelogSlackNotify', {
    repositoryName: repositoryName,
    slackToken: 'slack-token',
    channelName: 'slack-channel-name',
    changelogPath: 'CHANGELOG.md',
  });

  // THEN
  expect(stack).toHaveResource('AWS::CodeCommit::Repository', {
    RepositoryDescription: 'A repo created by ChangelogSlackNotify lib',
    RepositoryName: repositoryName,
  });

  expect(stack).toHaveResource('AWS::Lambda::Permission', {
    Action: 'lambda:InvokeFunction',
    FunctionName: {
      'Fn::GetAtt': ['changelogSlackNotifylambdafun802F40CB', 'Arn'],
    },
    Principal: 'events.amazonaws.com',
    SourceArn: {
      'Fn::GetAtt': [
        'changelogSlackNotifyRepositoryCommitToMasterRuleC74E37BD',
        'Arn',
      ],
    },
  });

  expect(stack).toHaveResource('AWS::Events::Rule', {
    EventPattern: {
      'detail': {
        event: ['referenceCreated', 'referenceUpdated'],
        referenceName: ['master'],
      },
      'detail-type': ['CodeCommit Repository State Change'],
      'resources': [
        {
          'Fn::GetAtt': ['changelogSlackNotifyRepository1646AE5D', 'Arn'],
        },
      ],
      'source': ['aws.codecommit'],
    },
    State: 'ENABLED',
    Targets: [
      {
        Arn: {
          'Fn::GetAtt': ['changelogSlackNotifylambdafun802F40CB', 'Arn'],
        },
        Id: 'Target0',
      },
    ],
  });

  expect(stack).toHaveResource('AWS::Lambda::Function', {
    Environment: {
      Variables: {
        BREAKING_CHANGE_TYPE_DISPLAY_NAME: 'BREAKING CHANGES',
        CHANNEL_NAME: 'slack-channel-name',
        FEATURE_TYPE_DISPLAY_NAME: 'New Features',
        FIX_TYPE_DISPLAY_NAME: 'Bugs Fixed',
        PERFORMANCE_TYPE_DISPLAY_NAME: 'Performance Improvement',
        SLACK_TOKEN: 'slack-token',
        UNDEFINED_TYPE_DISPLAY_NAME: 'Others',
        CHANGELOG_PATH: 'CHANGELOG.md',
      },
    },
    Handler: 'index.handler',
    MemorySize: 128,
    Role: {
      'Fn::GetAtt': ['changelogSlackNotifylambdafunServiceRoleC94AD9DB', 'Arn'],
    },
    Runtime: 'python3.7',
    Timeout: 5,
  });

  expect(stack).toHaveResource('AWS::IAM::Role', {
    AssumeRolePolicyDocument: {
      Statement: [
        {
          Action: 'sts:AssumeRole',
          Effect: 'Allow',
          Principal: {
            Service: 'lambda.amazonaws.com',
          },
        },
      ],
      Version: '2012-10-17',
    },
    ManagedPolicyArns: [
      {
        'Fn::Join': [
          '',
          [
            'arn:',
            {
              Ref: 'AWS::Partition',
            },
            ':iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
          ],
        ],
      },
    ],
  });

  expect(stack).toHaveResource('AWS::IAM::Policy', {
    PolicyDocument: {
      Statement: [
        {
          Action: [
            'codecommit:GetDifferences',
            'codecommit:GetCommit',
            'codecommit:GetBlob',
          ],
          Effect: 'Allow',
          Resource: {
            'Fn::GetAtt': ['changelogSlackNotifyRepository1646AE5D', 'Arn'],
          },
        },
      ],
      Version: '2012-10-17',
    },
    PolicyName: 'changelogSlackNotifylambdafunServiceRoleDefaultPolicyD2073092',
    Roles: [
      {
        Ref: 'changelogSlackNotifylambdafunServiceRoleC94AD9DB',
      },
    ],
  });
});

test('add tracking other branches support', () => {
  // GIVEN
  const app = new App();
  const stack = new Stack(app, 'testing-stack');
  const repositoryName = 'test-repo';

  // WHEN
  new ChangelogSlackNotify(stack, 'changelogSlackNotify', {
    repositoryName: repositoryName,
    slackToken: 'slack-token',
    channelName: 'slack-channel-name',
    trackingBranches: ['dev', 'master'],
  });

  // THEN
  expect(stack).toHaveResource('AWS::CodeCommit::Repository', {
    RepositoryDescription: 'A repo created by ChangelogSlackNotify lib',
    RepositoryName: repositoryName,
  });

  expect(stack).toHaveResource('AWS::Lambda::Permission', {
    Action: 'lambda:InvokeFunction',
    FunctionName: {
      'Fn::GetAtt': ['changelogSlackNotifylambdafun802F40CB', 'Arn'],
    },
    Principal: 'events.amazonaws.com',
    SourceArn: {
      'Fn::GetAtt': [
        'changelogSlackNotifyRepositoryCommitToMasterRuleC74E37BD',
        'Arn',
      ],
    },
  });

  expect(stack).toHaveResource('AWS::Events::Rule', {
    EventPattern: {
      'detail': {
        event: ['referenceCreated', 'referenceUpdated'],
        referenceName: ['dev', 'master'],
      },
      'detail-type': ['CodeCommit Repository State Change'],
      'resources': [
        {
          'Fn::GetAtt': ['changelogSlackNotifyRepository1646AE5D', 'Arn'],
        },
      ],
      'source': ['aws.codecommit'],
    },
    State: 'ENABLED',
    Targets: [
      {
        Arn: {
          'Fn::GetAtt': ['changelogSlackNotifylambdafun802F40CB', 'Arn'],
        },
        Id: 'Target0',
      },
    ],
  });

  expect(stack).toHaveResource('AWS::Lambda::Function', {
    Environment: {
      Variables: {
        BREAKING_CHANGE_TYPE_DISPLAY_NAME: 'BREAKING CHANGES',
        CHANNEL_NAME: 'slack-channel-name',
        FEATURE_TYPE_DISPLAY_NAME: 'New Features',
        FIX_TYPE_DISPLAY_NAME: 'Bugs Fixed',
        PERFORMANCE_TYPE_DISPLAY_NAME: 'Performance Improvement',
        SLACK_TOKEN: 'slack-token',
        UNDEFINED_TYPE_DISPLAY_NAME: 'Others',
      },
    },
    Handler: 'index.handler',
    MemorySize: 128,
    Role: {
      'Fn::GetAtt': ['changelogSlackNotifylambdafunServiceRoleC94AD9DB', 'Arn'],
    },
    Runtime: 'python3.7',
    Timeout: 5,
  });

  expect(stack).toHaveResource('AWS::IAM::Role', {
    AssumeRolePolicyDocument: {
      Statement: [
        {
          Action: 'sts:AssumeRole',
          Effect: 'Allow',
          Principal: {
            Service: 'lambda.amazonaws.com',
          },
        },
      ],
      Version: '2012-10-17',
    },
    ManagedPolicyArns: [
      {
        'Fn::Join': [
          '',
          [
            'arn:',
            {
              Ref: 'AWS::Partition',
            },
            ':iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
          ],
        ],
      },
    ],
  });

  expect(stack).toHaveResource('AWS::IAM::Policy', {
    PolicyDocument: {
      Statement: [
        {
          Action: ['codecommit:GetDifferences', 'codecommit:GetCommit'],
          Effect: 'Allow',
          Resource: {
            'Fn::GetAtt': ['changelogSlackNotifyRepository1646AE5D', 'Arn'],
          },
        },
      ],
      Version: '2012-10-17',
    },
    PolicyName: 'changelogSlackNotifylambdafunServiceRoleDefaultPolicyD2073092',
    Roles: [
      {
        Ref: 'changelogSlackNotifylambdafunServiceRoleC94AD9DB',
      },
    ],
  });
});

test('add custom display name of change type support', () => {
  // GIVEN
  const app = new App();
  const stack = new Stack(app, 'testing-stack');
  const repositoryName = 'test-repo';

  // WHEN
  new ChangelogSlackNotify(stack, 'changelogSlackNotify', {
    repositoryName: repositoryName,
    slackToken: 'slack-token',
    channelName: 'slack-channel-name',
    featureTypeDisplayName: 'feat',
    fixTypeDisplayName: 'fix',
    performanceTypeDisplayName: 'perf',
    breakingChangeTypeDisplayName: 'bc',
    undefinedTypeDisplayName: 'others',
  });

  // THEN
  expect(stack).toHaveResource('AWS::CodeCommit::Repository', {
    RepositoryDescription: 'A repo created by ChangelogSlackNotify lib',
    RepositoryName: repositoryName,
  });

  expect(stack).toHaveResource('AWS::Lambda::Permission', {
    Action: 'lambda:InvokeFunction',
    FunctionName: {
      'Fn::GetAtt': ['changelogSlackNotifylambdafun802F40CB', 'Arn'],
    },
    Principal: 'events.amazonaws.com',
    SourceArn: {
      'Fn::GetAtt': [
        'changelogSlackNotifyRepositoryCommitToMasterRuleC74E37BD',
        'Arn',
      ],
    },
  });

  expect(stack).toHaveResource('AWS::Events::Rule', {
    EventPattern: {
      'detail': {
        event: ['referenceCreated', 'referenceUpdated'],
        referenceName: ['master'],
      },
      'detail-type': ['CodeCommit Repository State Change'],
      'resources': [
        {
          'Fn::GetAtt': ['changelogSlackNotifyRepository1646AE5D', 'Arn'],
        },
      ],
      'source': ['aws.codecommit'],
    },
    State: 'ENABLED',
    Targets: [
      {
        Arn: {
          'Fn::GetAtt': ['changelogSlackNotifylambdafun802F40CB', 'Arn'],
        },
        Id: 'Target0',
      },
    ],
  });

  expect(stack).toHaveResource('AWS::Lambda::Function', {
    Environment: {
      Variables: {
        FEATURE_TYPE_DISPLAY_NAME: 'feat',
        FIX_TYPE_DISPLAY_NAME: 'fix',
        PERFORMANCE_TYPE_DISPLAY_NAME: 'perf',
        BREAKING_CHANGE_TYPE_DISPLAY_NAME: 'bc',
        UNDEFINED_TYPE_DISPLAY_NAME: 'others',
        SLACK_TOKEN: 'slack-token',
        CHANNEL_NAME: 'slack-channel-name',
      },
    },
    Handler: 'index.handler',
    MemorySize: 128,
    Role: {
      'Fn::GetAtt': ['changelogSlackNotifylambdafunServiceRoleC94AD9DB', 'Arn'],
    },
    Runtime: 'python3.7',
    Timeout: 5,
  });

  expect(stack).toHaveResource('AWS::IAM::Role', {
    AssumeRolePolicyDocument: {
      Statement: [
        {
          Action: 'sts:AssumeRole',
          Effect: 'Allow',
          Principal: {
            Service: 'lambda.amazonaws.com',
          },
        },
      ],
      Version: '2012-10-17',
    },
    ManagedPolicyArns: [
      {
        'Fn::Join': [
          '',
          [
            'arn:',
            {
              Ref: 'AWS::Partition',
            },
            ':iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
          ],
        ],
      },
    ],
  });

  expect(stack).toHaveResource('AWS::IAM::Policy', {
    PolicyDocument: {
      Statement: [
        {
          Action: ['codecommit:GetDifferences', 'codecommit:GetCommit'],
          Effect: 'Allow',
          Resource: {
            'Fn::GetAtt': ['changelogSlackNotifyRepository1646AE5D', 'Arn'],
          },
        },
      ],
      Version: '2012-10-17',
    },
    PolicyName: 'changelogSlackNotifylambdafunServiceRoleDefaultPolicyD2073092',
    Roles: [
      {
        Ref: 'changelogSlackNotifylambdafunServiceRoleC94AD9DB',
      },
    ],
  });
});
