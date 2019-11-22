const fetch = require('node-fetch');
const fs = require('fs');

var stats = [];
var rules = [];

function statsIssues(nb, rule) {
  var object = {
    "name": "<a href='https://jira.sonarsource.com/browse/RSPEC-"+rule.rspecnum+"' target=_blank>"+rule.name+"</a>",
    "nbissues": nb,
    "language": rule.language,
    "type": rule.type
  };
  
  stats.push(object);
}

function fetchIssues(page, idrule, issuetypes, resolution, statuses, fromhotspot = "notdefined", totalsofar = 0) {
  if(typeof rules[idrule] !== "undefined") {
    
    if(resolution === "ALL") {
      var query = 'https://sonarcloud.io/api/issues/search?types='+issuetypes+'&statuses='+statuses+'&rules='+rules[idrule].id;
    }
    else if(resolution === "NOTRESOLVED") {
      var query = 'https://sonarcloud.io/api/issues/search?types='+issuetypes+'&resolved=false&statuses='+statuses+'&rules='+rules[idrule].id;
    }
    else {
      var query = 'https://sonarcloud.io/api/issues/search?types='+issuetypes+'&resolutions='+resolution+'&statuses='+statuses+'&rules='+rules[idrule].id;
    }
    
    if(fromhotspot !== "notdefined") {
      query += ("&ps=500&p="+page);
    }
    
    fetch(query)
        .then(res => res.json())
        .then(json => { 
        if (json.hasOwnProperty('total')) {
          var whereiam = json.p * json.ps;
          
          json.issues.forEach(function(element) {
              if((element.fromHotspot && fromhotspot == "true") || (!element.fromHotspot && fromhotspot == "false") ) {
                totalsofar ++;
              }
          });
        
          if(json.total > whereiam && fromhotspot !== "notdefined") {
            fetchIssues(page + 1, idrule, issuetypes, resolution, statuses, fromhotspot, totalsofar);
          }
          else {
            // end
            if(fromhotspot !== "notdefined") {
              statsIssues(totalsofar, rules[idrule]);
            }
            else {
              statsIssues(json.total, rules[idrule]);
            }
            
            fetchIssues(1, idrule + 1, issuetypes, resolution, statuses, fromhotspot, 0);
          }
        }
        else {
          if(fromhotspot !== "notdefined") {
            statsIssues(totalsofar, rules[idrule]);
          }
          else {
            statsIssues(0, rules[idrule]);
          }
            
          fetchIssues(1, idrule + 1, issuetypes, resolution, statuses, fromhotspot, 0);
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
          "id": element.key,
          "type": element.type
        };
        
        rules[id] = obj;
        id ++;
    });
  }
}

function fetchRules(page, ruletypes, issuetypes, resolution, statuses="OPEN,CONFIRMED,REOPENED,RESOLVED,CLOSED,TO_REVIEW,IN_REVIEW,REVIEWED", fromhotspot="notdefined") {
  // first page
  if(statuses === "ALL") {
    statuses = "OPEN,CONFIRMED,REOPENED,RESOLVED,CLOSED,TO_REVIEW,IN_REVIEW,REVIEWED";
  }
  
  fetch('https://sonarcloud.io/api/rules/search?types='+ruletypes+'&ps=500&p='+page)
      .then(res => res.json())
      .then(json => { 
        
        statsRules(json);
        var whereiam = json.p * json.ps;
        
        if(json.total > whereiam) {
            fetchRules(page + 1, ruletypes, issuetypes, resolution, statuses);
        }
        else {
          // end
          fetchIssues(1, 0, issuetypes, resolution, statuses, fromhotspot);
        }
    });
}
    
if(process.argv.length < 5 || process.argv.length > 8) {
  console.log("node stats.js type resolution statuses fromhotspot");
  console.log("where rule type could be: VULNERABILITY,CODE_SMELL,SECURITY_HOTSPOT,BUG");
  console.log("where issue type could be: VULNERABILITY,CODE_SMELL,SECURITY_HOTSPOT,BUG");
  console.log("where resolution could be: ALL,NOTRESOLVED,WONTFIX,FALSE-POSITIVE,FIXED,REMOVED");
  console.log("where statuses is optional and could be: ALL,OPEN,CONFIRMED,REOPENED,RESOLVED,CLOSED,TO_REVIEW,IN_REVIEW,REVIEWED");
  console.log("where fromhotspot is optional and could be: false,true");
}   
else if(process.argv.length == 5) {
  fetchRules(1, process.argv[2], process.argv[3], process.argv[4]);
}
else if(process.argv.length == 6) {
  fetchRules(1, process.argv[2], process.argv[3], process.argv[4], process.argv[5]);
}
else if(process.argv.length == 7) {
  fetchRules(1, process.argv[2], process.argv[3], process.argv[4], process.argv[5], process.argv[6]);
}


