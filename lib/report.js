/* eslint-disable no-console */
exports.sortReport = function sortReport (reportLineA, reportLineB){
    if(reportLineA.browser !== reportLineB.browser){
        return (reportLineA.browser).localeCompare(reportLineB.browser);
    }
    if(reportLineA.filename !== reportLineB.filename){
        if(reportLineA.filename.split("/").length !== reportLineB.filename.split("/").length){
            return (reportLineA.filename.split("/").length - reportLineB.filename.split("/").length);
        }
        return (reportLineA.filename).localeCompare(reportLineB.filename);
    }
    if(reportLineA.line !== reportLineB.line){
        return reportLineA.line - reportLineB.line;
    }
};

exports.printReportLine = function printReportLine (reportLine) {
    console.log(`\t\t${reportLine.browser} incompatible - ${reportLine.fileName}#L${reportLine.line} - ${reportLine.featureName} ${(reportLine.featureVersion ? (" - minVer: " + reportLine.featureVersion) : " not implemented")}`);
};