# Driven by Sonarcloud data

## Installation
```
npm install
```

## Use

```
node hotspotstats.js rules resolution statuses
```

where:
<sup>
- *resolution*: ALL,FIXED,SAFE
- *statuses* (optional): ALL,TO_REVIEW,REVIEWED
</sup>

#### Add your JWT-SESSION cookie to your environment
Because this script use internal SonarQube APIs thus you should retrieve the value of your JWT-SESSION cookie and put it to the JWTPEACH environment variable:
```
export JWTPEACH="value of your JWT-SESSION cookie"
```

#### Rules parameter
The above rule parameter should be a path to a file containing rules id separated by comma:
```
java:S5852,python:S1313
```

#### Example
```
node hotspotstats.js ./rules.txt ALL ALL
```
The above command will take approximatively 5 minutes to execute.

#### Results
Open dashboard.html with your favorite web browser.
