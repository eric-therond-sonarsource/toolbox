# Driven by Sonarcloud data

## Installation
```
npm install
```

## Use

```
node stats.js days rule-type issue-type resolution statuses
```

where:
- *days* the analysis to considerer, not before now minus x days 
- *rule* type could be: VULNERABILITY,CODE_SMELL,SECURITY_HOTSPOT,BUG or a text file with rules separated by comma
- *issue* type could be: VULNERABILITY,CODE_SMELL,SECURITY_HOTSPOT,BUG
- *resolution* could be: ALL,NOTRESOLVED,WONTFIX,FALSE-POSITIVE,FIXED,REMOVED
- *statuses* is optional and could be: ALL,OPEN,CONFIRMED,REOPENED,RESOLVED,CLOSED,TO_REVIEW,IN_REVIEW,REVIEWED"


### Add your JWT-SESSION cookie to your env variable
Because this script use internal SonarCloud API, retrieve the value of the JWT-SESSION cookie and put it to the JWTSC environment variable:
```
export JWTSC="value of your JWT-SESSION cookie"
```

### Select rules
The above rule parameter could be a path to a file which contains rules separated by comma you want to have stats:
```
4423,4830,5527,5542,5547,3330,2092,4426,5659
```

### Select days
Depending on the above days parameter, this script will explore all analysis that took place until now minus x days.  
It is recommended to not stress SonarCloud to explore only for the last one day. 


### Examples
```
node stats.js 1 ./cryptorules.txt VULNERABILITY,SECURITY_HOTSPOT ALL
```
The above command will take approximatively 5 minutes to execute.

### Results
Open dashboard.html with your favorite web browser.
