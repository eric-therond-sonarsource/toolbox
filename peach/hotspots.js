const fetch = require('node-fetch');
const fs = require('fs');

var fetchConfig = { 
  method: 'GET',
  mode: 'cors',
  cache: 'default' 
};
                  
var stats = [];
var project_strings = [];
var targeted_rules = [];
var current_project_strings = 0;
project_strings.push("");

function statsIssues(rule, project, id_issue) {
  var object = {
    "rule_name": "<a href='https://jira.sonarsource.com/browse/RSPEC-"+rule.slice(-4)+"' target=_blank>"+rule+"</a>",
    "project": "<a href='https://peach.sonarsource.com/dashboard?id="+project+"' target=_blank>"+project+"</a>",
    "issue_link": "<a href='https://peach.sonarsource.com/security_hotspots?id="+project+"&hotspots="+id_issue+"' target=_blank>issue link</a>",
    "language": rule.split(":")[0]
  };
  
  stats.push(object);
}

function fetchIssues(page, idproject, resolution, statuses) {
  if(typeof project_strings[idproject] !== "undefined") {
    if(resolution === "ALL") {
      var query = 'https://peach.sonarsource.com/api/hotspots/search?projectKey='+project_strings[idproject]+'&sinceLeakPeriod=false&onlyMine=false&statuses='+statuses;
    }
    else if(resolution === "NOTRESOLVED") {
      var query = 'https://peach.sonarsource.como/api/hotspots/search?projectKey='+project_strings[idproject]+'&sinceLeakPeriod=false&onlyMine=false&resolved=false&statuses='+statuses;
    }
    else {
      var query = 'https://peach.sonarsource.com/api/hotspots/search?projectKey='+project_strings[idproject]+'&sinceLeakPeriod=false&onlyMine=false&resolutions='+resolution+'&statuses='+statuses;
    }
    
    query += ("&ps=500&p="+page);
    
    fetch(query, fetchConfig)
      .then(function(response) {
        var contentType = response.headers.get("content-type");
        if(contentType && contentType.indexOf("application/json") !== -1) {
          return response.json().then(function(json) {
            if (json.hasOwnProperty('paging')) {
              
              if (json.paging.hasOwnProperty('total')) {
                json.hotspots.forEach(function(issue) {
                    fetch('https://peach.sonarsource.com/api/hotspots/show?hotspot='+issue.key, fetchConfig)
                      .then(function(responsebis) {
                        var contentType = responsebis.headers.get("content-type");
                        if(contentType && contentType.indexOf("application/json") !== -1) {
                          return responsebis.json().then(function(jsonbis) {
                            if (jsonbis.hasOwnProperty('key')) {
                              for(var i = 0; i < targeted_rules.length; i ++) {
                                if(targeted_rules[i] == jsonbis.rule.key) {
                                  statsIssues(targeted_rules[i], issue.project, issue.key);
                                }
                              }
                            }
                          });
                        }
                        
                        //fetchIssues(1, idproject + 1, resolution, statuses);
                        
                      }).catch(function(error) {
                        //fetchIssues(1, idproject + 1, resolution, statuses);
                      });
                });
                  
                //fetchIssues(1, idproject + 1, resolution, statuses);
              }
            }
            
            fetchIssues(1, idproject + 1, resolution, statuses);
          });
        } 
        else {
          fetchIssues(1, idproject + 1, resolution, statuses);
        }
      })
      .catch(function(error) {
        fetchIssues(1, idproject + 1, resolution, statuses);
      }
    );
  }
  else {
    // we move to another project strings
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

function statsProjects(json) {
  if (json.hasOwnProperty('components')) {
    
    for(var i = 0; i < json.components.length; i ++) {
      var element = json.components[i];
      var analysisDate = new Date(element.analysisDate);
      
      project_strings[current_project_strings] = element.key;
      current_project_strings ++;
    }
  }
  
  return true;
}

function fetchProjects(page, resolution, statuses) {

  fetch('https://peach.sonarsource.com/api/components/search_projects?f=analysisDate&s=analysisDate&asc=false&ps=500&p='+page, fetchConfig)
    .then(res => res.json())
    .then(json => { 
      var continueProjects = statsProjects(json);
      var whereiam = json.paging.pageIndex * json.paging.pageSize;
        
      if(json.paging.total > whereiam && continueProjects) {
        fetchProjects(page + 1, resolution, statuses);
      }
      else {
        // end
        fetchIssues(1, 0, resolution, statuses);
      }
    })
    .catch(function(error) {
      fetchIssues(1, 0, resolution, statuses);
    }
  );
}
    
if(process.argv.length != 5) {
  console.log("node hotspots.js rules resolution statuses\n");
  
  console.log("where rules is a text file with rules separated by comma");
  console.log("where resolution could be: ALL,FIXED,SAFE");
  console.log("where statuses is optional and could be: ALL,TO_REVIEW,REVIEWED");
}   
else {
  
  
  if(typeof process.env.JWTPEACH !== "undefined") {
    var headers = {
      "Cookie": "JWT-SESSION="+process.env.JWTPEACH
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
    if (fs.existsSync(process.argv[2])) {
      var data = fs.readFileSync(process.argv[2], 'utf8').trim();
      if(data.includes(',')) {
        targeted_rules = data.split(",");
      }
      else {
        targeted_rules.push(data);
      }
      
      console.log("Targeted Rules: " + targeted_rules);
      fetchProjects(1, process.argv[3], process.argv[4]);
    }
    else {
      console.log("file "+process.argv[3]+" cannot be read");
    }
  }
  catch(err) {
    console.error(err)
  }
}
