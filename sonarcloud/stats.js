const fetch = require('node-fetch');
const fs = require('fs');

const organization = "agigleux";

var fetchConfig = { 
  method: 'GET',
  mode: 'cors',
  cache: 'default' 
};
                  
var stats = [];
var rules = [];
var project_strings = [];
var targeted_rules = [];
var current_project_strings = 0;
project_strings.push("");

var createdAfter = "";

function formatDate4API(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2)
      month = '0' + month;
  if (day.length < 2)
      day = '0' + day;

  return [year, month, day].join('-');
}

function statsIssues(rule, project, id_issue) {
  var object = {
    "rule_name": "<a href='https://jira.sonarsource.com/browse/RSPEC-"+rule.rspecnum+"' target=_blank>"+rule.name+"</a>",
    "project": "<a href='https://sonarcloud.io/dashboard?id="+project+"' target=_blank>"+project+"</a>",
    "issue_link": "<a href='https://sonarcloud.io/project/issues?id="+project+"&issues="+id_issue+"&open="+id_issue+"' target=_blank>issue link</a>",
    "language": rule.language,
    "type": rule.type
  };
  
  stats.push(object);
}

function fetchIssues(page, idrule, idproject, issuetypes, resolution, statuses) {
  
  
  if(typeof rules[idrule] !== "undefined") {
    if(resolution === "ALL") {
      var query = 'https://sonarcloud.io/api/issues/search?createdAfter='+createdAfter+'&componentKeys='+project_strings[idproject]+'&types='+issuetypes+'&statuses='+statuses+'&rules='+rules[idrule].id;
    }
    else if(resolution === "NOTRESOLVED") {
      var query = 'https://sonarcloud.io/api/issues/search?createdAfter='+createdAfter+'&componentKeys='+project_strings[idproject]+'&types='+issuetypes+'&resolved=false&statuses='+statuses+'&rules='+rules[idrule].id;
    }
    else {
      var query = 'https://sonarcloud.io/api/issues/search?createdAfter='+createdAfter+'&componentKeys='+project_strings[idproject]+'&types='+issuetypes+'&resolutions='+resolution+'&statuses='+statuses+'&rules='+rules[idrule].id;
    }
    
    query += ("&ps=500&p="+page);
    
    fetch(query, fetchConfig)
      .then(function(response) {
        var contentType = response.headers.get("content-type");
        if(contentType && contentType.indexOf("application/json") !== -1) {
          return response.json().then(function(json) {
            if (json.hasOwnProperty('total')) {
              
              json.issues.forEach(function(issue) {
                statsIssues(rules[idrule], issue.project, issue.key);
              });
                
              fetchIssues(1, idrule + 1, idproject, issuetypes, resolution, statuses);
            }
            else {
              fetchIssues(1, idrule + 1, idproject, issuetypes, resolution, statuses);
            }
          });
        } 
        else {
          fetchIssues(1, idrule + 1, idproject, issuetypes, resolution, statuses);
        }
      })
      .catch(function(error) {
        fetchIssues(1, 0, idproject + 1, issuetypes, resolution, statuses);
      }
    );
  }
  else {
    // we move to another project strings
    if(typeof project_strings[idproject] !== "undefined") {
      fetchIssues(1, 0, idproject + 1, issuetypes, resolution, statuses);
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
}

function statsRules(json) {
  
  var id = rules.length;
  if (json.hasOwnProperty('rules')) {
    json.rules.forEach(function(element) {
      var obj = {
        "name": element.name,
        "language": element.key.split(":")[0],
        "rspecnum":element.key.slice(-4),
        "id": element.key,
        "type": element.type
      };
      
      if(targeted_rules.length > 0) {
        targeted_rules.forEach(function(rulet) {
          if(element.key.includes(rulet)) {
            rules[id] = obj;
            id ++;
          }
        });
      }
      else {
        rules[id] = obj;
        id ++;
      }
    });
  }
}

function statsProjects(json) {
  if (json.hasOwnProperty('components')) {
    
    for(var i = 0; i < json.components.length; i ++) {
      var element = json.components[i];
      var analysisDate = new Date(element.analysisDate);
      
      if(analysisDate.getTime() < start_date.getTime()) {
        project_strings[current_project_strings] = project_strings[current_project_strings].slice(0, -1);
        return false;
      }
      
      project_strings[current_project_strings] = project_strings[current_project_strings] + element.key  + ",";
      
      // only 30 projects each time
      if(i % 30 == 0 && i > 0) {
        project_strings[current_project_strings] = project_strings[current_project_strings].slice(0, -1);
        project_strings.push("");
        current_project_strings ++;
        
      }
    }
  }
  
  return true;
}

function fetchProjects(page, start_date, ruletypes, issuetypes, resolution, statuses) {

  fetch('https://sonarcloud.io/api/components/search_projects?f=analysisDate&s=analysisDate&asc=false&ps=500&p='+page, fetchConfig)
    .then(res => res.json())
    .then(json => { 
      var continueProjects = statsProjects(json);
      var whereiam = json.paging.pageIndex * json.paging.pageSize;
        
      if(json.paging.total > whereiam && continueProjects) {
        fetchProjects(page + 1, start_date, ruletypes, issuetypes, resolution, statuses);
      }
      else {
        // end
        fetchIssues(1, 0, 0, issuetypes, resolution, statuses);
      }
    })
    .catch(function(error) {
      fetchIssues(1, 0, 0, issuetypes, resolution, statuses);
    }
  );
}

// https://sonarcloud.io/api/issues/search?componentKeys=SonarSource_sonarcloud-core&types=VULNERABILITY&statuses=OPEN,CONFIRMED,REOPENED,RESOLVED,CLOSED,TO_REVIEW,IN_REVIEW,REVIEWED&rules=java:S5542
function fetchRules(page, start_date, ruletypes, issuetypes, resolution, statuses="OPEN,CONFIRMED,REOPENED,RESOLVED,CLOSED,TO_REVIEW,IN_REVIEW,REVIEWED") {
  // first page
  if(statuses === "ALL") {
    statuses = "OPEN,CONFIRMED,REOPENED,RESOLVED,CLOSED,TO_REVIEW,IN_REVIEW,REVIEWED";
  }
  
  fetch('https://sonarcloud.io/api/rules/search?types='+ruletypes+'&organization='+organization+'&ps=500&p='+page, fetchConfig)
    .then(res => res.json())
    .then(json => { 
      var whereiam = json.p * json.ps;

      statsRules(json);

      if(json.total > whereiam) {
        fetchRules(page + 1, start_date, ruletypes, issuetypes, resolution, statuses);
      }
      else {
        // end
        fetchProjects(1, start_date, ruletypes, issuetypes, resolution, statuses);
      }
    })
    .catch(function(error) {
      fetchProjects(1, start_date, ruletypes, issuetypes, resolution, statuses);
    }
  );
}
    
if(process.argv.length < 6 || process.argv.length > 8) {
  console.log("node stats.js days rule-type issue-type resolution statuses\n");
  
  console.log("where *days* the analysis to considerer, not before now minus x days ");
  console.log("where rule type could be: VULNERABILITY,CODE_SMELL,SECURITY_HOTSPOT,BUG or a text file with rules separated by comma");
  console.log("where issue type could be: VULNERABILITY,CODE_SMELL,SECURITY_HOTSPOT,BUG");
  console.log("where resolution could be: ALL,NOTRESOLVED,WONTFIX,FALSE-POSITIVE,FIXED,REMOVED");
  console.log("where statuses is optional and could be: ALL,OPEN,CONFIRMED,REOPENED,RESOLVED,CLOSED,TO_REVIEW,IN_REVIEW,REVIEWED");
}   
else {
  
  
  if(typeof process.env.JWTSC !== "undefined") {
    var headers = {
      "Cookie": "JWT-SESSION="+process.env.JWTSC
    };

    var fetchConfig = { 
      method: 'GET',
      headers: headers,
      mode: 'cors',
      cache: 'default' 
    };
  }
  
  try {
    // try if third parameter is a file
    if (fs.existsSync(process.argv[3])) {
      var data = fs.readFileSync(process.argv[3], 'utf8').trim();
      if(data.includes(',')) {
        targeted_rules = data.split(",");
      }
      else {
        targeted_rules.push(data);
      }
    }
    console.log("Targeted Rules: " + targeted_rules);
  }
  catch(err) {
    console.error(err)
  }
  
  if(targeted_rules.length > 0) {
    process.argv[3] = "VULNERABILITY,CODE_SMELL,SECURITY_HOTSPOT,BUG";
  }

  var start_date = new Date(); // now
  start_date.setDate(start_date.getDate() - process.argv[2]);

  createdAfter = formatDate4API(start_date);

  console.log("Looking for issues created after: " + start_date);

  if(process.argv.length == 6) {
    fetchRules(1, start_date, process.argv[3], process.argv[4], process.argv[5]);
  }
  else if(process.argv.length == 7) {
    fetchRules(1, start_date, process.argv[3], process.argv[4], process.argv[5], process.argv[6]);
  }
}
