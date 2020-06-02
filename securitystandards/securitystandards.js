const fetch = require('node-fetch');
const fs = require('fs');

function createOwaspObject(key, title, subtasks, issuelinks, type) {
  
  if(typeof issuelinks !== 'undefined' && issuelinks !== null) {
    
    // 0: name of ticket 1: name of subtask
    // correct order to avoid conflict "javascript" "java"
    var subtaskslang = [["js", "javascript"], ["java", "java"], ["c#", "c#"], ["py", "python"], ["php", "php"], ["cpp", "c-family"]];
    
    var statesubtasks = [];
    
    subtaskslang.forEach(function(lang) {
          statesubtasks[lang[0]] = [];
          statesubtasks[lang[0]]["hassubtask"] = "No";
          statesubtasks[lang[0]]["hasopenticket"] = false;
          statesubtasks[lang[0]]["hasclosedticket"] = false;
    });
    
    issuelinks.forEach(function(element) {
      if(element.type.inward === "is implemented by")
      {
        
        subtaskslang.forEach(function(lang) {
          if(element.inwardIssue.key.toLowerCase().includes(lang[0])) {
            if(element.inwardIssue.fields.status.name.toLowerCase().includes("open")) {
              statesubtasks[lang[0]]["hasopenticket"] = true;
            }
            else if(element.inwardIssue.fields.status.name.toLowerCase().includes("closed")) {
              statesubtasks[lang[0]]["hasclosedticket"] = true;
            }
          }
        });
      }
    });
  }
    
  subtasks.forEach(function(element) {
    
    subtaskslang.forEach(function(lang) {
      
      if(element.fields.summary.toLowerCase().includes(lang[1])) {
        var numberofcode = "<span class='badge badge-danger'>0</span>";
        if(typeof savedDescriptions[""+element.key+""] !== 'undefined' && savedDescriptions[""+element.key+""] !== null) {
          numberofcode = ((savedDescriptions[""+element.key+""].match(/{code/g)||[]).length) / 2;
            
          if(numberofcode >= 0 && numberofcode < 3) {
              numberofcode = "<span class='badge badge-danger'>"+numberofcode+"</span>";
          }
          else if(numberofcode >= 3 && numberofcode < 6) {
              numberofcode = "<span class='badge badge-warning'>"+numberofcode+"</span>";
          }
          else if(numberofcode >= 6) {
              numberofcode = "<span class='badge badge-success'>"+numberofcode+"</span>";
          }
        }
        
        if(statesubtasks[lang[0]]["hasclosedticket"] && !statesubtasks[lang[0]]["hasopenticket"]) { 
          statesubtasks[lang[0]]["hassubtask"] = "<a href='https://jira.sonarsource.com/browse/"+element.key+"'><font color=green>"+element.key+"</font></a> "+numberofcode+"";
        }
        else if(!statesubtasks[lang[0]]["hasclosedticket"] && statesubtasks[lang[0]]["hasopenticket"]) { 
          statesubtasks[lang[0]]["hassubtask"] = "<a href='https://jira.sonarsource.com/browse/"+element.key+"'><font color=orange>"+element.key+"</font></a> "+numberofcode+"";
        }
        else
        {
          statesubtasks[lang[0]]["hassubtask"] = "<a href='https://jira.sonarsource.com/browse/"+element.key+"'>"+element.key+"</a> "+numberofcode+"";
        }
        
        return;
      }
    });
  });
  
  var object = {
    "owaspcat": "not defined",
    "ruletitle": "<a href='https://jira.sonarsource.com/browse/"+key+"'>"+title+"</a>",
    "type": type,
    "java": statesubtasks["java"]["hassubtask"],
    "csharp": statesubtasks["c#"]["hassubtask"],
    "js": statesubtasks["js"]["hassubtask"],
    "python": statesubtasks["py"]["hassubtask"],
    "php": statesubtasks["php"]["hassubtask"],
    "cfamily": statesubtasks["cpp"]["hassubtask"]
  }
  
  return object;
}

var savedDescriptions = [];

function transformSubtasks(json) {
  json.issues.forEach(function(element) {
    if(typeof element.key !== 'undefined' && element.key !== null) {
      savedDescriptions[""+element.key+""] = element.fields.description;
    }
  });
}

function transformIssues(json) {
  if (json.hasOwnProperty('issues')) {
    
    var owaspStandard = [];
    
    json.issues.forEach(function(element) {
      var owaspfound = false;
      var owaspfield = element.fields.customfield_10253;
      
      if(typeof owaspfield !== 'undefined' && owaspfield !== null) {
        //var cwefield = element.fields.customfield_10251.split(",");
        
        owaspfield.split(",").forEach(function(lab) {
          if(lab.includes("A")) {
            
            var newObj = createOwaspObject(element.key, element.fields.summary, element.fields.subtasks, element.fields.issuelinks, element.fields.issuetype.name);
            newObj.owaspcat = lab.trim();
            owaspStandard.push(newObj);
            owaspfound = true;
          }
        });
      }
      
      if(!owaspfound) {
        var newObj = createOwaspObject(element.key, element.fields.summary, element.fields.subtasks, element.fields.issuelinks, element.fields.issuetype.name);
        owaspStandard.push(newObj);
      }
    });
    
    owaspStandard.sort((a, b) => (a.owaspcat > b.owaspcat) ? 1 : -1);
    
    var completeData = "var mydata =  "+JSON.stringify(owaspStandard)+";";
    fs.writeFile("./data.json", completeData, function(err) {

        if(err) {
            return console.log(err);
        }

        console.log("The data file was saved!");
    });
  }
}

// first page

fetch('https://jira.sonarsource.com/rest/api/2/search?jql=project%20=%20RSPEC%20AND%20issuetype%20in%20subTaskIssueTypes()%20AND%20resolution%20=%20Unresolved%20ORDER%20BY%20updated%20DESC&maxResults=5000')
    .then(res => res.json())
    .then(json => {
      
      transformSubtasks(json);
      // second page
      fetch('https://jira.sonarsource.com/rest/api/2/search?jql=project%20=%20RSPEC%20AND%20issuetype%20in%20subTaskIssueTypes()%20AND%20resolution%20=%20Unresolved%20ORDER%20BY%20updated%20DESC&maxResults=5000&startAt=1000')
          .then(res => res.json())
          .then(json => {
            
            transformSubtasks(json);
          
            // third page
            fetch('https://jira.sonarsource.com/rest/api/2/search?jql=project%20=%20RSPEC%20AND%20issuetype%20in%20subTaskIssueTypes()%20AND%20resolution%20=%20Unresolved%20ORDER%20BY%20updated%20DESC&maxResults=5000&startAt=2000')
                .then(res => res.json())
                .then(json => {
                  
                  transformSubtasks(json);  
                
                  // in last
                  fetch('https://jira.sonarsource.com/rest/api/2/search?jql=issuetype%20in%20(%22Security%20Hotspot%20Detection%22%2C%20%22Vulnerability%20Detection%22) %26 status %3D Active&maxResults=5000')
                      .then(res => res.json())
                      .then(json => transformIssues(json));
                });
                
          });
    });
    
