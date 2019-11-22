# Driven by Sonarcloud data

## Installation

```
npm install
```

## Use

```
node stats.js type resolution statuses fromhotspot
where rule type could be: VULNERABILITY,CODE_SMELL,SECURITY_HOTSPOT,BUG
where issue type could be: VULNERABILITY,CODE_SMELL,SECURITY_HOTSPOT,BUG
where resolution could be: ALL,NOTRESOLVED,WONTFIX,FALSE-POSITIVE,FIXED,REMOVED
where statuses is optional and could be: ALL,OPEN,CONFIRMED,REOPENED,RESOLVED,CLOSED,TO_REVIEW,IN_REVIEW,REVIEWED
where fromhotspot is optional and could be: false,true
```
And next open dashboard.html with your favorite internet browser.
