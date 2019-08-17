var fs = require('fs');
var path = require('path');
var readdirp = require('readdirp');
var inquirer = require('inquirer');

let rootDir = "DIRECTORY_PATH"; // TODO: Replace DIRECTORY_PATH

var aAllFiles = [];
var aCheckedFiles = [];
var aCheckedHTMLNotFound = [];
var aCheckedModifiedFiles = [];
var aCheckedUnmodifiedFiles = [];
var bWriteMode = false;

var constants = {
  CHECK_FILES: "Check Files for DOCTYPE",
  CHECK_MODIFY_FILES: "Check Files for DOCTYPE & Modify them to include it"
};

inquirer.prompt([{
  type: 'list',
  name: 'action',
  message: 'What do you want to perform?',
  choices: [
    constants.CHECK_FILES,
    constants.CHECK_MODIFY_FILES
  ]
}]).then(answers => {
  initialize(answers);
});

var initialize = function(answers) {
  if (answers.action === constants.CHECK_MODIFY_FILES) {
    bWriteMode = true;
  }

  var settings = { //TODO: Alter Setting if required
    root: rootDir,
    entryType: 'files',
    // Filter files with js and json extension
    fileFilter: ['*.jsp'],
    // Filter by directory
    //directoryFilter: [ '!.git', '!*modules' ],
    // Work with files up to 1 subdirectory deep
    //depth: 1
  };

  // Read settings and recursively iterate over the directory
  readdirp(settings)
    .on('data', function(entry) {
      aAllFiles.push(entry.fullPath);
      // Async Read
      //fnReadFile(entry.fullPath);

      // Sync Read
      fnReadFileSync(entry.fullPath);
    })
    .on('warn', function(warn) {
      console.log("Warn: ", warn);
    })
    .on('error', function(err) {
      console.log("Error: ", err);
    })
    .on('end', function() {
      fnPrintResult(answers);
    });
}

// Function is called for every file which matches the criterion in the setting
var fnReadFile = function(sPath) {
  fs.readFile(sPath, 'utf8', function(err, contents) {
    var sModifiedFileContent;
    var aFileContent = contents && contents.toString().split("\n");
    // Custom Implementation Begins here
    // TODO: Update Custom Implementation if required

    //logic to identify the pattern with location for HTML Tag
    var oPatternDetailsHTML = fnFindPatternWithLocation(aFileContent, "<html>");

    //Get link number of HTML element and search only till that point for the DOCTYPE
    var oPatternDetailsDocType = fnFindPatternWithLocation(aFileContent, "<!DOCTYPE", oPatternDetailsHTML.iLocation);

    var bHTMLPatternFound = oPatternDetailsHTML.bPatternFound;
    var bDocTypePatternFound = oPatternDetailsDocType.bPatternFound;

    if (bHTMLPatternFound) { // When HTML is found
      if (bDocTypePatternFound) { // When DOCTYPE is found
        aCheckedFiles.push(sPath);
      } else { //When DOCTYPE is not found
        if (bWriteMode) { // Permission to write DOCTYPE
          sModifiedFileContent = fnWriteLineAtLocation(aFileContent, "<!DOCTYPE html>", 0); //TODO: Change the DOCTYPE Template if required
          fnWriteFile(sPath, sModifiedFileContent);
          aCheckedModifiedFiles.push(sPath);
        } else { // No Permission to write DOCTYPE
          aCheckedUnmodifiedFiles.push(sPath);
        }
      }
    } else { // When HTML is not found
        aCheckedHTMLNotFound.push(sPath);
    }

    // Custom Implementation Ends here
  });
}

// Function is called for every file which matches the criterion in the setting
var fnReadFileSync = function(sPath) {
  var sModifiedFileContent;
  var contents = fs.readFileSync(sPath, 'utf8');

  var aFileContent = contents && contents.toString().split("\n");

  // Custom Implementation Begins here
  // TODO: Update Custom Implementation if required

  //logic to identify the pattern with location for HTML Tag
  var oPatternDetailsHTML = fnFindPatternWithLocation(aFileContent, "<html>");

  //Get link number of HTML element and search only till that point for the DOCTYPE
  var oPatternDetailsDocType = fnFindPatternWithLocation(aFileContent, "<!DOCTYPE", oPatternDetailsHTML.iLocation);

  var bHTMLPatternFound = oPatternDetailsHTML.bPatternFound;
  var bDocTypePatternFound = oPatternDetailsDocType.bPatternFound;

  if (bHTMLPatternFound) { // When HTML is found
    if (bDocTypePatternFound) { // When DOCTYPE is found
      aCheckedFiles.push(sPath);
    } else { //When DOCTYPE is not found
      if (bWriteMode) { // Permission to write DOCTYPE
        sModifiedFileContent = fnWriteLineAtLocation(aFileContent, "<!DOCTYPE html>", 0); //TODO: Change the DOCTYPE Template if required
        fnWriteFile(sPath, sModifiedFileContent);
        aCheckedModifiedFiles.push(sPath);
      } else { // No Permission to write DOCTYPE
        aCheckedUnmodifiedFiles.push(sPath);
      }
    }
  } else { // When HTML is not found
      aCheckedHTMLNotFound.push(sPath);
  }

  // Custom Implementation Ends here
}

var fnFindPatternWithLocation = function(aContent, sPattern, iThresholdLocation) {
  var bPatternFound = false;
  var bFoundIndex = -1;
  var regex = RegExp(sPattern + '*');
  var iThresholdLocation = iThresholdLocation || aContent.length;
  for (index in aContent) {
    // Condition to break when the threshold is met
    if (index >= iThresholdLocation) {
      break;
    }

    if (regex.test(aContent[index])) {
      bPatternFound = true;
      bFoundIndex = index;
      break;
    } else {
      bPatternFound = false;
    }
  }

  return {
    bPatternFound: bPatternFound, // true/false
    iLocation: bFoundIndex // line number of the found element or -1 if not found
  };
}


var fnWriteLineAtLocation = function(aFileContent, sTextToAdd, iLocation) {
  var sModifiedFileContent;
  aFileContent && aFileContent.splice(iLocation, 0, sTextToAdd);
  sModifiedFileContent = aFileContent.join("\n");
  return sModifiedFileContent;
}

var fnWriteFile = function(sPath, sModifiedFileContent) {
  fs.writeFile(sPath, sModifiedFileContent, function(err) {
    if (err) {
      return console.log(err);
    }
  });
}

var fnPrintResult = function(answers) {
  console.log("\nTotal Number of Files Read : " + aAllFiles.length);
  console.log("\nPrinting Results");
  if (aCheckedFiles && aCheckedFiles.length > 0) {
    console.log("\nFiles Checked & Found Good: " + aCheckedFiles.length);
  }

  if (answers.action === constants.CHECK_FILES) {
    if (aCheckedUnmodifiedFiles && aCheckedUnmodifiedFiles.length > 0) {
      console.log("\nFiles Checked & Missing DOCTYPE : " + aCheckedUnmodifiedFiles.length);
      console.log(aCheckedUnmodifiedFiles);
    }
  } else if (answers.action === constants.CHECK_MODIFY_FILES) {
    if (aCheckedUnmodifiedFiles && aCheckedUnmodifiedFiles.length > 0) {
      console.log("\nFiles Checked & Missing DOCTYPE : " + aCheckedUnmodifiedFiles.length);
      console.log(aCheckedUnmodifiedFiles);
    }

    if (aCheckedModifiedFiles && aCheckedModifiedFiles.length > 0) {
      console.log("\nFiles Checked & Added DOCTYPE : " + aCheckedModifiedFiles.length);
      console.log(aCheckedModifiedFiles);
    } else {
      console.log("\nNo Files Found to Modify!");
    }
  }

  console.log("\nFiles Checked : " + aAllFiles.length);
  console.log("Files Checked & Missing DOCTYPE : " + aCheckedUnmodifiedFiles.length);
  console.log("Files Checked & Added DOCTYPE : " + aCheckedModifiedFiles.length);
  console.log("Files Checked & Missing HTML : " + aCheckedHTMLNotFound.length);
}
