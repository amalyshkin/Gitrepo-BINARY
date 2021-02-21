## Description of Changes / Notes

_add a description of your changes or notes to the reviewer here_

**NOTE:** Before opening this pull request, please consider the following:

## Testing/documentation comprehensiveness
- [ ] Have any public APIs been updated/changed? \
Please refer to the REST API documentation for [Jira Server](https://bigbrassband.atlassian.net/wiki/spaces/GITSERVER/pages/265289750/REST+API) / [Jira Data Center](https://bigbrassband.atlassian.net/wiki/spaces/GIJDC/pages/380764385/REST+API) to look for the public APIs. \
If yes &mdash; please add corresponding notes in the ticket description: for testers about testing these APIs, for Shanmarc about documenting these changes.
- [ ] Have you changed any database tables? \
If yes &mdash; please add notes for testers about testing these changes in the ticket description.
- [ ] Have you added any migration or database upgrade routines? \
If yes &mdash; please add notes for testers about migration testing in the ticket description.
- [ ] (_for features_) Have you created a test plan subtask according to [GIT-3900](https://jira.bigbrassband.com/browse/GIT-3900)?

## Error clearance
- [ ] Have you fixed all Sonar Cloud errors and warnings?
- [ ] Have tests in Jenkins executed successfully on all applicable Jira versions?

## Security considerations
- [ ] Have you considered the security implications of the new code you wrote?  
_For example, did you add a new API that could be used to expose files on our servers? Or could it be used to connect to somewhere else remotely although we don't intend that? Or is exploited somehow else?_
