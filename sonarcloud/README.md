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
<sup>
- *days*: the analysis to considerer (see below)
- *rule*: VULNERABILITY,CODE_SMELL,SECURITY_HOTSPOT,BUG or a text file (see below)
- *issue*: VULNERABILITY,CODE_SMELL,SECURITY_HOTSPOT,BUG
- *resolution*:  ALL,NOTRESOLVED,WONTFIX,FALSE-POSITIVE,FIXED,REMOVED
- *statuses* (optional): ALL,OPEN,CONFIRMED,REOPENED,RESOLVED,CLOSED
</sup>

#### Add your JWT-SESSION cookie to your environment
Because this script use internal SonarCloud APIs thus you should retrieve the value of your JWT-SESSION cookie and put it to the JWTSC environment variable:
```
export JWTSC="value of your JWT-SESSION cookie"
```

#### Rule parameter
The above rule parameter could be also a path to a file which contains rules separated by comma you want to have stats:
```
4423,4830,5527,5542,5547,3330,2092,4426,5659
```

#### Days parameter
Depending on the above days parameter, this script will explore all analysis that took place until now minus x days.  
It is recommended to not stress SonarCloud so to explore only for the last **one** day. 


#### Example
```
node stats.js 1 ./cryptorules.txt VULNERABILITY,SECURITY_HOTSPOT ALL
```
The above command will take approximatively 5 minutes to execute.

#### Results
Open dashboard.html with your favorite web browser.
