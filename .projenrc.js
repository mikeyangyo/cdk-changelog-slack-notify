const { AwsCdkConstructLibrary } = require("projen");

const AWS_CDK_LATEST_RELEASE = "1.74.0";
const PROJECT_NAME = "cdk-changelog-slack-notify";
const MODULE_NAME = "cdk_changelog_slack_notify";
const PROJECT_DESCRIPTION =
	"A JSII construct lib to deploy a service to send new changes pushed to codecommit to slack channel";

const project = new AwsCdkConstructLibrary({
	authorAddress: "perryvm06vm06@gmail.com",
	authorName: "mikeyangyo",
	cdkVersion: AWS_CDK_LATEST_RELEASE,
	name: PROJECT_NAME,
	repository: "https://github.com/mikeyangyo/cdk-changelog-slack-notify.git",
	description: PROJECT_DESCRIPTION,
	license: "MIT",
	deps: [
		"@aws-cdk/core",
		"@aws-cdk/aws-codecommit",
		"@aws-cdk/aws-iam",
		"@aws-cdk/aws-lambda",
		"@aws-cdk/aws-events-targets",
	],
	peerDeps: [
		"@aws-cdk/core",
		"@aws-cdk/aws-codecommit",
		"@aws-cdk/aws-iam",
		"@aws-cdk/aws-lambda",
		"@aws-cdk/aws-events-targets",
	],
	keywords: ["aws", "cdk", "codecommit", "slack", "changelog"],
	python: {
		distName: PROJECT_NAME,
		module: MODULE_NAME,
	},
  defaultReleaseBranch: "main",
  codeCov: true,
  codeCovTokenSecret: 'CODECOV_TOKEN'
});

const common_exclude = [
	"cdk.out",
	"cdk.context.json",
	"images",
	"yarn-error.log",
	".env",
	'.vscode'
];
project.npmignore.exclude(...common_exclude);
project.gitignore.exclude(...common_exclude);

project.synth();
