var readdirp = require('readdirp');
var fs = require('fs');
var path = require('path');

let rootDir = "<ROOT Directory where the operation is to be performed>";
var modifiedFileContent;

var settings = {
    root: rootDir,
    entryType: 'all',
    // Filter files with js and json extension
    //fileFilter: [ '*.jsp' ],
    // Filter by directory
    //directoryFilter: [ '!.git', '!*modules' ],
    // Work with files up to 1 subdirectory deep
    //depth: 1
};

var allFilePaths = [];

// Iterate recursively through a folder
readdirp(settings)
    .on('data', function (entry) {
        // execute everytime a file is found in the provided directory

        // Store the fullPath of the file/directory in our custom array
        allFilePaths.push(
            entry.fullPath
        );

        fnReadFile(entry.fullPath);
    })
    .on('warn', function(warn){
        console.log("Warn: ", warn);
    })
    .on('error', function(err){
        console.log("Error: ", err);
    })
    .on('end', function(){
        console.log(allFilePaths);
    });

var fnReadFile = function(sPath) {
  fs.readFile(sPath, 'utf8', function (err, contents) {
    console.log("Reading File Content of : " + sPath);

    var aFileContent = contents.toString().split("\n");

    //logic to identify the pattern with location for HTML Tag
    var oPatternDetailsHTML = fnFindPatternWithLocation(aFileContent, "<html>");

    //Get iLocation of HTML instance and search only till that point for the DOCTYPE
    var oPatternDetailsDocType = fnFindPatternWithLocation(aFileContent, "<!DOCTYPE", oPatternDetailsHTML.iLocation);

    var bPatternFound = oPatternDetailsDocType.bPatternFound;

    if (!bPatternFound) {
      //Insert string at Zeroth Line
      modifiedFileContent = fnWriteLineAtLocation(aFileContent, "<!DOCTYPE html>", 0);
      fnWriteFile(sPath, modifiedFileContent);
    }
  });
}

var fnFindPatternWithLocation = function(sContent, sPattern, iThresholdLocation) {
  var bPatternFound = false;
  var bFoundIndex = -1;
  var regex = RegExp(sPattern + '*');
  var iThresholdLocation = iThresholdLocation || sContent.length;

  console.log("Looking for : " + sPattern);
  for (index in sContent) {
    if (index >= iThresholdLocation) {
      console.log("Threshold Met :" + iThresholdLocation);
      break;
    }

    var line = sContent[index];
    if(regex.test(line)) {
      console.log("Pattern Found " + line);
      bPatternFound = true;
      bFoundIndex = index;
      break;
    } else {
      bPatternFound = false;
    }
  }

  return {
    bPatternFound : bPatternFound,
    iLocation : bFoundIndex
    };
}

var fnWriteLineAtLocation = function(aFileContent, sTextToAdd, iLocation) {
  //Writing Text to File..
  aFileContent.splice(iLocation, 0, sTextToAdd);
  modifiedFileContent = aFileContent.join("\n");
  return modifiedFileContent;
}

var fnWriteFile = function(sPath, sContent) {
  //Writing Modified File Content..
  fs.writeFile(sPath, sContent, function(err) {
      if(err) {
          return console.log(err);
      }
      console.log("Saving File Content");
  });
}
