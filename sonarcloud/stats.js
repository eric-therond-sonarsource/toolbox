const fetch = require('node-fetch');
const fs = require('fs');

var stats = [];
var rules = [];

function statsIssues(nb, rule) {
  var object = {
    "name": "<a href='https://jira.sonarsource.com/browse/RSPEC-"+rule.rspecnum+"' target=_blank>"+rule.name+"</a>",
    "nbissues": nb,
    "language": rule.language
  };
  
  stats.push(object);
}

function fetchIssues(idrule, type, resolution) {
  if(typeof rules[idrule] !== "undefined") {
    fetch('https://sonarcloud.io/api/issues/search?types='+type+'&resolutions='+resolution+'&rules='+rules[idrule].id)
        .then(res => res.json())
        .then(json => { 
        if (json.hasOwnProperty('total')) {
          statsIssues(json.total, rules[idrule]);
          fetchIssues(idrule + 1, type, resolution);
        }
    });
  }
  else {
    // end
    stats.sort((a, b) => (a.nbissues > b.nbissues) ? -1 : 1);
    
    var completeData = "var mydata = "+JSON.stringify(stats)+";";
    fs.writeFile("./data.json", completeData, function(err) {

      if(err) {
        return console.log(err);
      }

      console.log("The data was saved in data.json file!");
    });
  }
}

function statsRules(json) {
  
  var id = 0;
  if (json.hasOwnProperty('rules')) {
    json.rules.forEach(function(element) {
      
        var obj = {
          "name": element.name,
          "language": element.key.split(":")[0],
          "rspecnum":element.key.slice(-4),
          "id": element.key
        };
        
        rules[id] = obj;
        id ++;
    });
  }
}

function fetchRules(page, type, resolution) {
  // first page
  fetch('https://sonarcloud.io/api/rules/search?types='+type+'&ps=500&p='+page)
      .then(res => res.json())
      .then(json => { 
        
        statsRules(json);
        var whereiam = json.p * json.ps;
        
        if(json.total > whereiam) {
            fetchRules(page + 1, type, resolution);
        }
        else {
          // end
          fetchIssues(0, type, resolution);
        }
    });
}

if(process.argv.length < 4) {
  console.log("node stats.js type resolution");
  console.log("where type could be: VULNERABILITY, CODE_SMELL, SECURITY_HOTSPOT or BUG");
  console.log("where resolution could be: WONTFIX, FALSE-POSITIVE, FIXED or REMOVED");
}   
else {
  fetchRules(1, process.argv[2], process.argv[3]);
}




