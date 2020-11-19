import * as path from 'path';
import * as codecommit from '@aws-cdk/aws-codecommit';
import * as events_targets from '@aws-cdk/aws-events-targets';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';

export interface ChangelogSlackNotifyProps {
  /**
	 * repository name to track
	 */
  readonly repositoryName: string;
  /**
	 * Slack channel name for sending message
	 */
  readonly channelName: string;
  /**
	 * Slack secret token for sending message
	 */
  readonly slackToken: string;
  /**
	 * Branches which were tracking to send notification message
	 *
	 * @default - If this value is _not_ set, considers to track master branch
	 */
  readonly trackingBranches?: string[];
  /**
	 * Path of changelog file in repository
	 *
	 * @default - If this value is _not_ set,
	 * considers to read commits push in master on this time to build notification message
	 */
  readonly changelogPath?: string;
  /**
	 * Display name in notification message for feature changes
	 *
	 * @default - If this value is _not_ set, considers to New Features
	 */
  readonly featureTypeDisplayName?: string;
  /**
	 * Display name in notification message for fix changes
	 *
	 * @default - If this value is _not_ set, considers to Bugs Fixed
	 */
  readonly fixTypeDisplayName?: string;
  /**
	 * Display name in notification message for performance improvement changes
	 *
	 * @default - If this value is _not_ set, considers to Performance Improvement
	 */
  readonly performanceTypeDisplayName?: string;
  /**
	 * Display name in notification message for breaking changes
	 *
	 * @default - If this value is _not_ set, considers to BREAKING CHANGES
	 */
  readonly breakingChangeTypeDisplayName?: string;
  /**
	 * Display name in notification message for undefined type changes
	 *
	 * @default - If this value is _not_ set, considers to Others
	 */
  readonly undefinedTypeDisplayName?: string;
  /**
	 * set True to use $repositoryName to find exist repository.
	 *  on the other hand, create a repository named $repositoryName
	 *
	 * @default - If this value is _not_ set, considers to false
	 */
  readonly fromExistRepository?: boolean;
}

export class ChangelogSlackNotify extends cdk.Construct {
  constructor(
    scope: cdk.Construct,
    id: string,
    props: ChangelogSlackNotifyProps,
  ) {
    super(scope, id);
    let repo: codecommit.IRepository;

    if (props.fromExistRepository === undefined || !props.fromExistRepository) {
      repo = new codecommit.Repository(this, 'Repository', {
        repositoryName: props.repositoryName,
        description: 'A repo created by ChangelogSlackNotify lib',
      });
    } else {
      repo = codecommit.Repository.fromRepositoryName(
        this,
        'Repository',
        props.repositoryName,
      );
    }

    let environment: { [key: string]: string } = {
      FEATURE_TYPE_DISPLAY_NAME: props.featureTypeDisplayName || 'New Features',
      FIX_TYPE_DISPLAY_NAME: props.fixTypeDisplayName || 'Bugs Fixed',
      PERFORMANCE_TYPE_DISPLAY_NAME:
				props.performanceTypeDisplayName || 'Performance Improvement',
      UNDEFINED_TYPE_DISPLAY_NAME: props.undefinedTypeDisplayName || 'Others',
      BREAKING_CHANGE_TYPE_DISPLAY_NAME:
				props.breakingChangeTypeDisplayName || 'BREAKING CHANGES',
      CHANNEL_NAME: props.channelName,
      SLACK_TOKEN: props.slackToken,
    };
    if (props.changelogPath) {
      environment.CHANGELOG_PATH = props.changelogPath;
    }
    const lambdaFun = new lambda.Function(this, 'lambda_fun', {
      handler: 'index.handler',
      runtime: lambda.Runtime.PYTHON_3_7,
      code: lambda.Code.fromAsset(path.join(__dirname, '../function')),
      environment: environment,
      memorySize: 128,
      timeout: cdk.Duration.seconds(5),
    });

    let requirePermissions = [
      'codecommit:GetDifferences',
      'codecommit:GetCommit',
    ];
    if (props.changelogPath) {
      requirePermissions.push('codecommit:GetBlob');
    }
    const codecommitReadDifferenceAndCommitPolicyStatement = new iam.PolicyStatement(
      {
        actions: requirePermissions,
        resources: [repo.repositoryArn],
      },
    );
    lambdaFun.role!.addToPrincipalPolicy(
      codecommitReadDifferenceAndCommitPolicyStatement,
    );

    repo.onCommit('CommitToMasterRule', {
      branches: props.trackingBranches || ['master'],
      target: new events_targets.LambdaFunction(lambdaFun),
    });
  }
}
