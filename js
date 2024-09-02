<body>
 
<script src="/libs/cq/ui/resources/cq-ui.js" type="text/javascript"></script> <h2><%= actualTitle %>&nbsp;&nbsp;&nbsp;&nbsp;
 
<input type="checkbox" id="groupexport" name="groupexport" value="group"> <label for="groupexport">Group Report</label>&nbsp;&nbsp;&nbsp;&nbsp;
 
<a href="javascript:exportCSV()">Export</a></h2>
 
<%
 
if (description != null) { %><p><%= description %></p><%
 
}
 
%>
 
<cq:include path="report" resourceType="<%= actualResourceType %>" />
 
 
<script>
 
function json2csv(json) {
 
var a= typeof json != 'object'? JSON.parse(json) json;
var csv = '\r\n\n';
 
var line = "";
 
for (var index in a[0])
 
line += index.slice(0, -3) + ','; line.slice(0,-1);
 
csv += line + '\r\n';
 
for (var i = 0; i < a.length; i++) { var line = "";
 
for (var index in a[i]) {
 
line += '"'+ a[i][index] + '",';
 
}
 
line.slice(0, line.length - 1);
 
csv += line + '\r\n';
 
return csV;
 
}
 
function checkApplyClientFilter(val, index) {
 
var retStr = val;
 
if(clientFilterList [index]) {
 
retStr = clientFilterList[index](val);
 
}
 
return retStr;
 
}
 
function findClientFilter(rep) {
 
for (var i = 0; i < rep.columns.length; i++) {
 
if(rep.columns[i].definitions.data && rep.columns[i].definitions.data.clientFilter){
 
clientFilterList[rep.columns[i].dataId] = rep.columns[i].definitions.data.clientFilter;
 
}
 
}
}
function downloadcsv(str){
 
if (navigator.appName != 'Microsoft Internet Explorer')
 
{
 
window.open('data:text/csv;charset=utf-8,' + escape(str));
 
}else{
 
var popup = window.open('','csv','');
 
popup.document.body.innerHTML = '<pre>' + str + '</pre>';
 
}
 
}
 
clientFilterList = [];
 
function normalizeRows(json, keys) {
 
var a = typeof json != 'object'? JSON.parse(json): json;
var m = {};
 
for (var i = 0; i != keys.length; ++i) m[keys[i]] = "";
 
for (var i = 0; i != a.length; ++i)
 
if (keys.length > Object.keys(a[i]).length) { var temp = jQuery.extend({}, m);
 
for (var key in a[i]) {
 
temp[key] = a[i][key]
 
} a[i] = temp;
 
}
 
return a;
}
 
function exportCSV(){
 
var rep CQ.reports.Report. theInstance;
 
var repurl= rep.reportPath + '.' rep.reportSelector CQ.HTTP.EXTENSION_JSON; CQ.HTTP.get(repurl, function(options, success, response) {
 
if (success) {
 
var repData = CQ.Util.formatData(CQ.Ext.util.JSON.decode(response.responseText)); var csv 'result,' + repData.results + '\r\n';
 
findClientFilter(rep);
 
csv += json2csv(normalizeRows(CQ.Ext.util.JSON.encode(repData.hits), Object.keys(repData.dataTypes)));
 
downloadcsv(csv);
 
} ), this);
 
}
 
</script>
 
<div id="CQ">
 
<div id="reportView">
 
</div>
 
</div>
 
</body>
