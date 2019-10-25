const fetch = require('node-fetch');
const fs = require('fs');

function createOwaspObject(key, title, subtasks, issuelinks) {
  
  var hasJavasubtask = "No";
  var hasJavaOpenTicket = false;
  var hasJavaClosedTicket = false;
  var hasCsharpsubtask = "No";
  var hasCsharpOpenTicket = false;
  var hasCsharpClosedTicket = false;
  var hasJssubtask = "No";
  var hasJsOpenTicket = false;
  var hasJsClosedTicket = false;
  var hasPythonsubtask = "No";
  var hasPythonOpenTicket = false;
  var hasPythonClosedTicket = false;
  var hasPhpsubtask = "No";
  var hasPhpOpenTicket = false;
  var hasPhpClosedTicket = false;
  var hasKotlinsubtask = "No";
  var hasKotlinOpenTicket = false;
  var hasKotlinClosedTicket = false;
  var hasCfamilysubtask = "No";
  var hasCfamilyOpenTicket = false;
  var hasCfamilyClosedTicket = false;
  var hasPlsqlsubtask = "No";
  var hasPlsqlOpenTicket = false;
  var hasPlsqlClosedTicket = false;
  
  if(typeof issuelinks !== 'undefined' && issuelinks !== null) {
    issuelinks.forEach(function(element) {
      if(element.type.inward === "is implemented by")
      {
        if(element.inwardIssue.key.toLowerCase().includes("java")) {
          if(element.inwardIssue.fields.status.name.toLowerCase().includes("open")) {
            hasJavaOpenTicket = true;
          }
          else if(element.inwardIssue.fields.status.name.toLowerCase().includes("closed")) {
            hasJavaClosedTicket = true;
          }
        }
        if(element.inwardIssue.key.toLowerCase().includes("c#")) {
          if(element.inwardIssue.fields.status.name.toLowerCase().includes("open")) {
            hasCsharpOpenTicket = true;
          }
          else if(element.inwardIssue.fields.status.name.toLowerCase().includes("closed")) {
            hasCsharpClosedTicket = true;
          }
        }
        if(element.inwardIssue.key.toLowerCase().includes("js")) {
          if(element.inwardIssue.fields.status.name.toLowerCase().includes("open")) {
            hasJsOpenTicket = true;
          }
          else if(element.inwardIssue.fields.status.name.toLowerCase().includes("closed")) {
            hasJsClosedTicket = true;
          }
        }
        if(element.inwardIssue.key.toLowerCase().includes("py")) {
          if(element.inwardIssue.fields.status.name.toLowerCase().includes("open")) {
            hasPythonOpenTicket = true;
          }
          else if(element.inwardIssue.fields.status.name.toLowerCase().includes("closed")) {
            hasPythonClosedTicket = true;
          }
        }
        if(element.inwardIssue.key.toLowerCase().includes("php")) {
          if(element.inwardIssue.fields.status.name.toLowerCase().includes("open")) {
            hasPhpOpenTicket = true;
          }
          else if(element.inwardIssue.fields.status.name.toLowerCase().includes("closed")) {
            hasPhpClosedTicket = true;
          }
        }
        if(element.inwardIssue.key.toLowerCase().includes("slang")) {
          if(element.inwardIssue.fields.status.name.toLowerCase().includes("open")) {
            hasKotlinOpenTicket = true;
          }
          else if(element.inwardIssue.fields.status.name.toLowerCase().includes("closed")) {
            hasKotlinClosedTicket = true;
          }
        }
        if(element.inwardIssue.key.toLowerCase().includes("cpp")) {
          if(element.inwardIssue.fields.status.name.toLowerCase().includes("open")) {
            hasCfamilyOpenTicket = true;
          }
          else if(element.inwardIssue.fields.status.name.toLowerCase().includes("closed")) {
            hasCfamilyClosedTicket = true;
          }
        }
        if(element.inwardIssue.key.toLowerCase().includes("plsql")) {
          if(element.inwardIssue.fields.status.name.toLowerCase().includes("open")) {
            hasPlsqlOpenTicket = true;
          }
          else if(element.inwardIssue.fields.status.name.toLowerCase().includes("closed")) {
            hasPlsqlClosedTicket = true;
          }
        }
      }
    });
  }
  
  subtasks.forEach(function(element) {
    if(element.fields.summary.toLowerCase().includes("javascript")) {
      if(hasJsClosedTicket && !hasJsOpenTicket) { 
        hasJssubtask = "<a href='https://jira.sonarsource.com/browse/"+element.key+"'><font color=green>"+element.key+"</font></a>";
      }
      else if(!hasJsClosedTicket && hasJsOpenTicket) { 
        hasJssubtask = "<a href='https://jira.sonarsource.com/browse/"+element.key+"'><font color=orange>"+element.key+"</font></a>";
      }
      else
      {
        hasJssubtask = "<a href='https://jira.sonarsource.com/browse/"+element.key+"'>"+element.key+"</a>";
      }
    }
    else if(element.fields.summary.toLowerCase() == "java") {
      if(hasJavaClosedTicket && !hasJavaOpenTicket) { 
        hasJavasubtask = "<a href='https://jira.sonarsource.com/browse/"+element.key+"'><font color=green>"+element.key+"</font></a>";
      }
      else if(!hasJavaClosedTicket && hasJavaOpenTicket) { 
        hasJavasubtask = "<a href='https://jira.sonarsource.com/browse/"+element.key+"'><font color=orange>"+element.key+"</font></a>";
      }
      else
      {
        hasJavasubtask = "<a href='https://jira.sonarsource.com/browse/"+element.key+"'>"+element.key+"</a>";
      }
    }
    else if(element.fields.summary.toLowerCase().includes("c#")) {
      if(hasCsharpClosedTicket && !hasCsharpOpenTicket) { 
        hasCsharpsubtask = "<a href='https://jira.sonarsource.com/browse/"+element.key+"'><font color=green>"+element.key+"</font></a>";
      }
      else if(!hasCsharpClosedTicket && hasCsharpOpenTicket) { 
        hasCsharpsubtask = "<a href='https://jira.sonarsource.com/browse/"+element.key+"'><font color=orange>"+element.key+"</font></a>";
      }
      else
      {
        hasCsharpsubtask = "<a href='https://jira.sonarsource.com/browse/"+element.key+"'>"+element.key+"</a>";
      }
    }
    else if(element.fields.summary.toLowerCase().includes("python")) {
      if(hasPythonClosedTicket && !hasPythonOpenTicket) { 
        hasPythonsubtask = "<a href='https://jira.sonarsource.com/browse/"+element.key+"'><font color=green>"+element.key+"</font></a>";
      }
      else if(!hasPythonClosedTicket && hasPythonOpenTicket) { 
        hasPythonsubtask = "<a href='https://jira.sonarsource.com/browse/"+element.key+"'><font color=orange>"+element.key+"</font></a>";
      }
      else
      {
        hasPythonsubtask = "<a href='https://jira.sonarsource.com/browse/"+element.key+"'>"+element.key+"</a>";
      }
    }
    else if(element.fields.summary.toLowerCase().includes("php")) {
      if(hasPhpClosedTicket && !hasPhpOpenTicket) { 
        hasPhpsubtask = "<a href='https://jira.sonarsource.com/browse/"+element.key+"'><font color=green>"+element.key+"</font></a>";
      }
      else if(!hasPhpClosedTicket && hasPhpOpenTicket) { 
        hasPhpsubtask = "<a href='https://jira.sonarsource.com/browse/"+element.key+"'><font color=orange>"+element.key+"</font></a>";
      }
      else
      {
        hasPhpsubtask = "<a href='https://jira.sonarsource.com/browse/"+element.key+"'>"+element.key+"</a>";
      }
    }
    else if(element.fields.summary.toLowerCase().includes("kotlin")) {
      
      if(hasKotlinClosedTicket && !hasKotlinOpenTicket) { 
        hasKotlinsubtask = "<a href='https://jira.sonarsource.com/browse/"+element.key+"'><font color=green>"+element.key+"</font></a>";
      }
      else if(!hasKotlinClosedTicket && hasKotlinOpenTicket) { 
        hasKotlinsubtask = "<a href='https://jira.sonarsource.com/browse/"+element.key+"'><font color=orange>"+element.key+"</font></a>";
      }
      else
      {
        hasKotlinsubtask = "<a href='https://jira.sonarsource.com/browse/"+element.key+"'>"+element.key+"</a>";
      }
    }
    else if(element.fields.summary.toLowerCase().includes("c-family")) {
      
      if(hasCfamilyClosedTicket && !hasCfamilyOpenTicket) { 
        hasCfamilysubtask = "<a href='https://jira.sonarsource.com/browse/"+element.key+"'><font color=green>"+element.key+"</font></a>";
      }
      else if(!hasCfamilyClosedTicket && hasCfamilyOpenTicket) { 
        hasCfamilysubtask = "<a href='https://jira.sonarsource.com/browse/"+element.key+"'><font color=orange>"+element.key+"</font></a>";
      }
      else
      {
        hasCfamilysubtask = "<a href='https://jira.sonarsource.com/browse/"+element.key+"'>"+element.key+"</a>";
      }
    }
    else if(element.fields.summary.toLowerCase().includes("pl/sql")) {
      
      if(hasPlsqlClosedTicket && !hasPlsqlOpenTicket) { 
        hasPlsqlsubtask = "<a href='https://jira.sonarsource.com/browse/"+element.key+"'><font color=green>"+element.key+"</font></a>";
      }
      else if(!hasPlsqlClosedTicket && hasPlsqlOpenTicket) { 
        hasPlsqlsubtask = "<a href='https://jira.sonarsource.com/browse/"+element.key+"'><font color=orange>"+element.key+"</font></a>";
      }
      else
      {
        hasPlsqlsubtask = "<a href='https://jira.sonarsource.com/browse/"+element.key+"'>"+element.key+"</a>";
      }
    }
  });
  
  var object = {
    "owaspcat": "not defined",
    "ruletitle": "<a href='https://jira.sonarsource.com/browse/"+key+"'>"+title+"</a>",
    "java": hasJavasubtask,
    "csharp": hasCsharpsubtask,
    "js": hasJssubtask,
    "python": hasPythonsubtask,
    "php": hasPhpsubtask,
    "kotlin": hasKotlinsubtask,
    "cfamily": hasCfamilysubtask,
    "plsql": hasPlsqlsubtask
  }
  
  return object;
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
            
            var newObj = createOwaspObject(element.key, element.fields.summary, element.fields.subtasks, element.fields.issuelinks);
            newObj.owaspcat = lab.trim();
            owaspStandard.push(newObj);
            owaspfound = true;
          }
        });
      }
      
      if(!owaspfound) {
        var newObj = createOwaspObject(element.key, element.fields.summary, element.fields.subtasks, element.fields.issuelinks);
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


fetch('https://jira.sonarsource.com/rest/api/2/search?jql=issuetype%20in%20(%22Security%20Hotspot%20Detection%22%2C%20%22Vulnerability%20Detection%22)&maxResults=5000')
    .then(res => res.json())
    .then(json => transformIssues(json));
    
    
