const fetch = require('node-fetch');
const fs = require('fs');

function createOwaspObject(key, title, subtasks) {
  
  var hasJavasubtask = "No";
  var hasCsharpsubtask = "No";
  var hasJssubtask = "No";
  var hasPythonsubtask = "No";
  var hasPhpsubtask = "No";
  var hasKotlinsubtask = "No";
  var hasCfamilysubtask = "No";
  var hasPlsqlsubtask = "No";
  
  subtasks.forEach(function(element) {
    if(element.fields.summary.toLowerCase().includes("java")) {
      hasJavasubtask = "<a href='https://jira.sonarsource.com/browse/"+element.key+"'>"+element.key+"</a>";
    }
    else if(element.fields.summary.toLowerCase().includes("c#")) {
      hasCsharpsubtask = "<a href='https://jira.sonarsource.com/browse/"+element.key+"'>"+element.key+"</a>";
    }
    else if(element.fields.summary.toLowerCase().includes("javascript")) {
      hasJssubtask = "<a href='https://jira.sonarsource.com/browse/"+element.key+"'>"+element.key+"</a>";
    }
    else if(element.fields.summary.toLowerCase().includes("python")) {
      hasPythonsubtask = "<a href='https://jira.sonarsource.com/browse/"+element.key+"'>"+element.key+"</a>";
    }
    else if(element.fields.summary.toLowerCase().includes("php")) {
      hasPhpsubtask = "<a href='https://jira.sonarsource.com/browse/"+element.key+"'>"+element.key+"</a>";
    }
    else if(element.fields.summary.toLowerCase().includes("kotlin")) {
      hasKotlinsubtask = "<a href='https://jira.sonarsource.com/browse/"+element.key+"'>"+element.key+"</a>";
    }
    else if(element.fields.summary.toLowerCase().includes("c-family")) {
      hasCfamilysubtask = "<a href='https://jira.sonarsource.com/browse/"+element.key+"'>"+element.key+"</a>";
    }
    else if(element.fields.summary.toLowerCase().includes("pl/sql")) {
      hasPlsqlsubtask = "<a href='https://jira.sonarsource.com/browse/"+element.key+"'>"+element.key+"</a>";
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
      element.fields.labels.forEach(function(lab) {
        if(lab.includes("owasp")) {
          
          var newObj = createOwaspObject(element.key, element.fields.summary, element.fields.subtasks);
          newObj.owaspcat = lab;
          owaspStandard.push(newObj);
        }
        else {
          
          var newObj = createOwaspObject(element.key, element.fields.summary, element.fields.subtasks);
          owaspStandard.push(newObj);
        }
      });
    });
    
    owaspStandard.sort((a, b) => (a.owaspcat > b.owaspcat) ? 1 : -1);
    
    var completeData = "var mydata =  "+JSON.stringify(owaspStandard)+";";
    fs.writeFile("./data.js", completeData, function(err) {

        if(err) {
            return console.log(err);
        }

        console.log("The data file was saved!");
    });
  }
}


fetch('https://jira.sonarsource.com/rest/api/2/search?jql=issuetype%20in%20(%22Security%20Hotspot%20Detection%22%2C%20%22Vulnerability%20Detection%22)&maxresults=5000')
    .then(res => res.json())
    .then(json => transformIssues(json));
    
    
