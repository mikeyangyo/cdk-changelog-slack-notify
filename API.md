# API Reference

**Classes**

Name|Description
----|-----------
[ChangelogSlackNotify](#cdk-changelog-slack-notify-changelogslacknotify)|*No description*


**Structs**

Name|Description
----|-----------
[ChangelogSlackNotifyProps](#cdk-changelog-slack-notify-changelogslacknotifyprops)|*No description*



## class ChangelogSlackNotify  <a id="cdk-changelog-slack-notify-changelogslacknotify"></a>



__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-core-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable)
__Extends__: [Construct](#aws-cdk-core-construct)

### Initializer




```ts
new ChangelogSlackNotify(scope: Construct, id: string, props: ChangelogSlackNotifyProps)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  *No description*
* **id** (<code>string</code>)  *No description*
* **props** (<code>[ChangelogSlackNotifyProps](#cdk-changelog-slack-notify-changelogslacknotifyprops)</code>)  *No description*
  * **channelName** (<code>string</code>)  Slack channel name for sending message. 
  * **repositoryName** (<code>string</code>)  repository name to track. 
  * **slackToken** (<code>string</code>)  Slack secret token for sending message. 
  * **breakingChangeTypeDisplayName** (<code>string</code>)  Display name in notification message for breaking changes. __*Default*__: If this value is _not_ set, considers to BREAKING CHANGES
  * **changelogPath** (<code>string</code>)  Path of changelog file in repository. __*Default*__: If this value is _not_ set, considers to read commits push in master on this time to build notification message
  * **featureTypeDisplayName** (<code>string</code>)  Display name in notification message for feature changes. __*Default*__: If this value is _not_ set, considers to New Features
  * **fixTypeDisplayName** (<code>string</code>)  Display name in notification message for fix changes. __*Default*__: If this value is _not_ set, considers to Bugs Fixed
  * **fromExistRepository** (<code>boolean</code>)  set True to use $repositoryName to find exist repository. __*Default*__: If this value is _not_ set, considers to false
  * **performanceTypeDisplayName** (<code>string</code>)  Display name in notification message for performance improvement changes. __*Default*__: If this value is _not_ set, considers to Performance Improvement
  * **trackingBranches** (<code>Array<string></code>)  Branches which were tracking to send notification message. __*Default*__: If this value is _not_ set, considers to track master branch
  * **undefinedTypeDisplayName** (<code>string</code>)  Display name in notification message for undefined type changes. __*Default*__: If this value is _not_ set, considers to Others




## struct ChangelogSlackNotifyProps  <a id="cdk-changelog-slack-notify-changelogslacknotifyprops"></a>






Name | Type | Description 
-----|------|-------------
**channelName** | <code>string</code> | Slack channel name for sending message.
**repositoryName** | <code>string</code> | repository name to track.
**slackToken** | <code>string</code> | Slack secret token for sending message.
**breakingChangeTypeDisplayName**? | <code>string</code> | Display name in notification message for breaking changes.<br/>__*Default*__: If this value is _not_ set, considers to BREAKING CHANGES
**changelogPath**? | <code>string</code> | Path of changelog file in repository.<br/>__*Default*__: If this value is _not_ set, considers to read commits push in master on this time to build notification message
**featureTypeDisplayName**? | <code>string</code> | Display name in notification message for feature changes.<br/>__*Default*__: If this value is _not_ set, considers to New Features
**fixTypeDisplayName**? | <code>string</code> | Display name in notification message for fix changes.<br/>__*Default*__: If this value is _not_ set, considers to Bugs Fixed
**fromExistRepository**? | <code>boolean</code> | set True to use $repositoryName to find exist repository.<br/>__*Default*__: If this value is _not_ set, considers to false
**performanceTypeDisplayName**? | <code>string</code> | Display name in notification message for performance improvement changes.<br/>__*Default*__: If this value is _not_ set, considers to Performance Improvement
**trackingBranches**? | <code>Array<string></code> | Branches which were tracking to send notification message.<br/>__*Default*__: If this value is _not_ set, considers to track master branch
**undefinedTypeDisplayName**? | <code>string</code> | Display name in notification message for undefined type changes.<br/>__*Default*__: If this value is _not_ set, considers to Others



