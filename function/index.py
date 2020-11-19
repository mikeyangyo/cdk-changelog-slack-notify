import json
import logging
import os
import re
from collections import defaultdict
from datetime import date
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urljoin
from urllib.request import Request, urlopen

import boto3

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

codecommit_client = boto3.client("codecommit",
                                 region_name=os.getenv("AWS_REGION"))

CHANGE_TYPE_MAPPING = {
    "feat":
    os.getenv("FEATURE_TYPE_DISPLAY_NAME") or "New Features",
    "fix":
    os.getenv("FIX_TYPE_DISPLAY_NAME") or "Bugs Fixed",
    "perf":
    os.getenv("PERFORMANCE_TYPE_DISPLAY_NAME") or "Performance Improvement",
    "BREAKING CHANGES":
    os.getenv("BREAKING_CHANGE_TYPE_DISPLAY_NAME") or "BREAKING CHANGES",
}
UNDEFINED_TYPE_DISPLAY_NAME = os.getenv(
    "UNDEFINED_TYPE_DISPLAY_NAME") or "Others"
CHANGELOG_PATH = os.getenv("CHANGELOG_PATH")
CATEGORIES = [
    ("fix", "fix"),
    ("breaking", "BREAKING CHANGES"),
    ("feat", "feat"),
    ("refactor", "refactor"),
    ("perf", "perf"),
    ("test", "test"),
    ("build", "build"),
    ("ci", "ci"),
    ("chore", "chore"),
]
CHANNEL_NAME = os.getenv("CHANNEL_NAME")


class GitCommit:
    def __init__(
        self,
        rev: str,
        title: str,
        body: str = "",
        footer: str = "",
        author: str = "",
        author_email: str = "",
    ):
        self.rev = rev.strip()
        self.title = title.strip()
        self.body = body.strip()
        self.footer = footer.strip()
        self.author = author.strip()
        self.author_email = author_email.strip()

    @property
    def message(self):
        return f"{self.title}\n\n{self.body}".strip()

    def __repr__(self):
        return f"{self.title} ({self.rev})"


def get_params(
    tree,
    repository_name,
    account_id,
    region,
    have_changelog,
    reference_full_name="",
    new_commit_id="",
    old_commit_id="",
):
    blocks = []
    for changelog_output in tree:
        version = changelog_output["version"]
        changes = changelog_output["changes"]
        blocks.append(
            get_header(
                "New Version Bumped Notification - {repo_name} | {region_name} | Account: {account_id}"
                .format(
                    repo_name=repository_name,
                    region_name=region,
                    account_id=account_id,
                )))
        text = "{version} release notes".format(version=version)
        codecommit_console_url = "https://console.aws.amazon.com/codesuite/codecommit/repositories/{repository_name}/".format(
            repository_name=repository_name)
        if have_changelog:
            url = urljoin(
                codecommit_console_url,
                "browse/{reference_full_name}/--/{changelog_path}".format(
                    reference_full_name=reference_full_name,
                    changelog_path=CHANGELOG_PATH,
                ),
            )
        else:
            url = urljoin(
                codecommit_console_url,
                "compare/{old_commit_id}/.../{new_commit_id}".format(
                    new_commit_id=new_commit_id,
                    old_commit_id=old_commit_id,
                ),
            )
        url += "?" + urlencode({"region": region})
        text = "<{url}| {display_text}>".format(
            url=url,
            display_text=text,
        )
        blocks.append(get_section(text))

        blocks.append(get_divider())
        render_order = ["BREAKING CHANGES", "feat", "fix", "perf", "others"]
        for order in render_order:
            if changes[order]:
                message_list = []
                icon, display_name = get_properties(order)
                message_list.append(f"{icon} *{display_name}*")
                for change in changes[order]:
                    scope = change["scope"]
                    message = change["message"]
                    if scope:
                        message_list.append(f"• *{scope}*: {message}")
                    elif message:
                        message_list.append(f"• {message}")
                blocks.append(get_section("\n".join(sorted(message_list))))
                blocks.append(get_divider())
    blocks = blocks[:-1]
    if len(blocks) > 50:
        blocks = blocks[:49]
    return {
        "channel":
        "#{}".format(CHANNEL_NAME),
        "text":
        "New Version Bumped Notification - {repo_name}".format(
            repo_name=repository_name),
        "icon_emoji":
        ":codecommit:",
        "username":
        "Amazon CodeCommit",
        "blocks":
        blocks,
    }


def get_properties(change_type):
    if change_type == "feat":
        icon = ":heavy_plus_sign:"
    elif change_type == "fix":
        icon = ":wrench:"
    elif change_type == "perf":
        icon = ":rocket:"
    elif change_type == "BREAKING CHANGES":
        icon = ":bangbang:"
    else:
        icon = ":gear:"
    return icon, CHANGE_TYPE_MAPPING.get(change_type) or "Others"


def get_header(header_text):
    return {
        "type": "header",
        "text": {
            "type": "plain_text",
            "text": header_text,
            "emoji": True
        },
    }


def get_divider():
    return {"type": "divider"}


def get_section(section_text):
    if len(section_text) >= 3001 - 4:
        return {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": section_text[:3001 - 4] + "..."
            },
        }
    return {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": section_text
        }
    }


def parse_scope_and_message_of_line(value):
    md_scope_parser = r"^- (\*\*(?P<scope>.*)\*\*: )?(?P<message>.*)$"
    m = re.search(md_scope_parser, value)
    if not m:
        return None, None
    return m.groupdict().get("scope"), m.groupdict().get("message")


def parse_version_from_markdown(value):
    version_parser = r"(?P<version>([0-9]+)\.([0-9]+)\.([0-9]+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+)?)"

    if not value.startswith("#"):
        return None
    m = re.search(version_parser, value)
    if not m:
        return None
    return m.groupdict().get("version")


def parse_title_type_of_line(value):
    md_title_parser = r"^(?P<title>#+)"
    m = re.search(md_title_parser, value)
    if not m:
        return None
    return m.groupdict().get("title")


def transform_change_type(change_type):
    # TODO: Use again to parse, for this we have to wait until the maps get
    # defined again.
    _change_type_lower = change_type.lower()
    for match_value, output in CATEGORIES:
        if re.search(match_value, _change_type_lower):
            return output
    else:
        raise ValueError(f"Could not match a change_type with {change_type}")


def generate_tree_from_commits(
    commits,
    commit_parser=r"^(?P<change_type>feat|fix|refactor|perf|BREAKING CHANGE)(?:\((?P<scope>[^()\r\n]*)\)|\()?(?P<breaking>!)?:\s(?P<message>.*)?",
    changelog_pattern=r"^(BREAKING[\-\ ]CHANGE|feat|fix|refactor|perf)(\(.+\))?(!)?",
    unreleased_version=None,
    change_type_map=CHANGE_TYPE_MAPPING,
    changelog_message_builder_hook=None,
):
    pat = re.compile(changelog_pattern)
    map_pat = re.compile(commit_parser, re.MULTILINE)

    current_tag_name: str = unreleased_version or "Unreleased"
    current_tag_date: str = ""
    if unreleased_version is not None:
        current_tag_date = date.today().isoformat()

    changes = defaultdict(list)
    for commit in commits:
        matches = pat.match(commit.message)
        if not matches:
            continue

        message = map_pat.match(commit.message)
        message_footer = map_pat.match(commit.footer)
        if message:
            parsed_message = message.groupdict()
            # change_type becomes optional by providing None
            change_type = parsed_message.pop("change_type",
                                             UNDEFINED_TYPE_DISPLAY_NAME)

            if changelog_message_builder_hook:
                parsed_message = changelog_message_builder_hook(
                    parsed_message, commit)
            changes[change_type].append(parsed_message)
        if message_footer:
            parsed_message_footer = message_footer.groupdict()
            change_type = parsed_message_footer.pop("change_type")
            changes[change_type].append(parsed_message_footer)

    yield {
        "version": current_tag_name,
        "date": current_tag_date,
        "changes": changes
    }


def read_from_commits(repository_name, newest_commit_id, last_commit_id):
    cur_commit_id = newest_commit_id
    commits = []
    while cur_commit_id != last_commit_id:
        response = codecommit_client.get_commit(repositoryName=repository_name,
                                                commitId=cur_commit_id)
        commit_response = response["commit"]
        message = commit_response["message"]
        message_footer = ""
        message_title, *message_body = message.split("\n\n")
        if len(message_body) >= 2:
            message_footer = message_body[-1]
        author = commit_response["author"]
        commits.append(
            GitCommit(
                rev=commit_response["commitId"].strip(),
                title=message_title.strip(),
                body="\n".join(message_body).strip(),
                footer=message_footer.strip(),
                author=author["name"].strip(),
                author_email=author["email"].strip(),
            ))
        if not commit_response["parents"]:
            break
        cur_commit_id = commit_response["parents"][-1]

    return commits


def read_from_changelog(
    changelog_path,
    repository_name,
    newest_commit_id,
    last_commit_id,
):
    blob_id: str = ""
    next_token: str
    if last_commit_id:
        params = dict(
            repositoryName=repository_name,
            beforeCommitSpecifier=newest_commit_id,
            afterCommitSpecifier=last_commit_id,
            MaxResults=1,
        )
    else:
        params = dict(
            repositoryName=repository_name,
            afterCommitSpecifier=newest_commit_id,
            MaxResults=1,
        )
    while 1:
        response = codecommit_client.get_differences(**params)
        differences = response["differences"]
        if not differences:
            break
        next_token = response.get("NextToken")
        if next_token:
            params["NextToken"] = next_token
        for difference in differences:
            if difference.get("beforeBlob") and difference["beforeBlob"][
                    "path"] == changelog_path:
                blob_id = difference["beforeBlob"]["blobId"]
                break
            elif difference.get("afterBlob") and difference["afterBlob"][
                    "path"] == changelog_path:
                blob_id = difference["afterBlob"]["blobId"]
                break
        if blob_id:
            break
    if not blob_id:
        return []

    response = codecommit_client.get_blob(repositoryName=repository_name,
                                          blobId=blob_id)

    changelog_content = response["content"].decode("utf-8")
    current_tag_name = ""
    cur_change_type = ""
    changes = defaultdict(list)
    for line in changelog_content.split("\n"):
        line = line.strip().lower()

        unreleased = None
        if "unreleased" in line:
            unreleased = parse_title_type_of_line(line)
        if unreleased:
            break

        # Try to find the latest release done
        version = parse_version_from_markdown(line)
        if version:
            if current_tag_name:
                break
            current_tag_name = f"v{version}"
        elif line:
            title_type = parse_title_type_of_line(line) or ""
            if len(title_type) == 3:
                try:
                    cur_change_type = transform_change_type(line)
                except ValueError:
                    pass
                else:
                    if not cur_change_type or cur_change_type not in [
                            "feat",
                            "fix",
                            "perf",
                            "BREAKING CHANGES",
                    ]:
                        cur_change_type = "others"
                    continue
            scope, message = parse_scope_and_message_of_line(line)
            changes[cur_change_type].append({
                "change_type": None,
                "scope": scope,
                "breaking": None,
                "message": message,
            })
    yield {"version": current_tag_name, "date": None, "changes": changes}


def handler(event, context):
    result = []
    logger.info("====event====")
    logger.info(event)

    detail = event["detail"]
    logger.info("====event.detail====")
    logger.info(detail)

    account_id = event["account"]
    logger.info("====event.account====")
    logger.info(account_id)

    region = event["region"]
    logger.info("====event.region====")
    logger.info(region)

    reference_full_name = detail["referenceFullName"]
    logger.info("====detail.referenceFullName====")
    logger.info(reference_full_name)

    repository_name = detail["repositoryName"]
    logger.info("====detail.repositoryName====")
    logger.info(repository_name)

    newest_commit_id = detail["commitId"]
    logger.info("====detail.commitId====")
    logger.info(newest_commit_id)

    last_commit_id = detail.get("oldCommitId") or ''
    logger.info("====detail.oldCommitId====")
    logger.info(last_commit_id)

    have_changelog: bool = True
    func_args = dict(
        repository_name=repository_name,
        account_id=account_id,
        region=region,
        have_changelog=have_changelog,
    )
    message = {}
    if CHANGELOG_PATH:
        result = read_from_changelog(
            changelog_path=CHANGELOG_PATH,
            repository_name=repository_name,
            newest_commit_id=newest_commit_id,
            last_commit_id=last_commit_id,
        )
        func_args["tree"] = result
        func_args["reference_full_name"] = reference_full_name
        message = get_params(**func_args)
    if not message.get('blocks'):
        have_changelog = False
        commits = read_from_commits(
            repository_name=repository_name,
            newest_commit_id=newest_commit_id,
            last_commit_id=last_commit_id,
        )
        result = generate_tree_from_commits(commits)
        func_args["tree"] = result
        func_args["have_changelog"] = have_changelog
        func_args["old_commit_id"] = last_commit_id
        func_args["new_commit_id"] = newest_commit_id
        message = get_params(**func_args)
    logger.info("====message====")
    logger.info(json.dumps(message, ensure_ascii=False))
    req = Request(
        "https://slack.com/api/chat.postMessage",
        json.dumps(message, ensure_ascii=False).encode("utf-8"),
        headers={
            "Authorization": "Bearer {}".format(os.getenv("SLACK_TOKEN")),
            "Content-Type": "application/json",
        },
    )
    response = {"message": "fail"}
    try:
        with urlopen(req) as res:
            logger.info(res.read().decode("utf-8"))
            logger.info("Message posted.")
    except HTTPError as err:
        logger.error("Request failed: %d %s", err.code, err.reason)
    except URLError as err:
        logger.error("Server connection failed: %s", err.reason)
    else:
        response["message"] = "success"

    return response
