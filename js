<%@ page import="com.day.cq.commons.jcr.JcrConstants, com.day.cq.reporting.SnapshotType, com.day.cq.reporting.helpers.Const, org.apache.sling.api.resource.NonExistingResource, org.apache.sling.api.resource.Resource, org.apache.sling.api.resource.ResourceResolver, org.apache.sling.api.resource.ResourceUtil, org.apache.sling.api.resource.ValueMap, com.day.cq.reporting.helpers.Util, org.apache.commons.lang3.StringEscapeUtils" %>
<%@ page session="false" %>
<%@ include file="/libs/foundation/global.jsp" %>

<%
Resource pageRsc = (Resource) resource;

// Required for IntelliJ code completion
// Resolve correct component type
ResourceResolver resolver = pageRsc.getResourceResolver();
Resource report = resolver.getResource(pageRsc.getPath() + "/report");

String actualResourceType = (report == null || report instanceof NonExistingResource) ? 
    "cq/reporting/components/reportbase" : report.getResourceType();

String description = currentPage.getProperties().get("jcr:description", String.class);
ValueMap reportProps = ResourceUtil.getValueMap(report);
String snapshotMode = reportProps.get(Const.PN_SNAPSHOTS, String.class);

String actualTitle = currentPage.getTitle();
actualTitle = (actualTitle != null ? actualTitle : currentPage.getName());
actualTitle = reportProps.get(JcrConstants.JCR_TITLE, actualTitle);
description = reportProps.get(JcrConstants.JCR_DESCRIPTION, description);

boolean hasSnapshots = (snapshotMode != null && !snapshotMode.equals(SnapshotType.NEVER.toString()));
String switchSnapshot = hasSnapshots ? "cq-reports-snapshots-on" : "cq-reports-snapshots-off";
%>

<body>
    <script src="/libs/cq/ui/resources/cq-ui.js" type="text/javascript"></script>
    <h2>
        <%= actualTitle %>&nbsp;&nbsp;&nbsp;&nbsp;
        <input type="checkbox" id="groupexport" name="groupexport" value="group">
        <label for="groupexport">Group Report</label>&nbsp;&nbsp;&nbsp;&nbsp;
        <a href="javascript:downloadgroupcsv()">Export</a>
    </h2>

    <%
    if (description != null) {
    %>
        <p><%= description %></p>
    <%
    }
    %>

    <cq:include path="report" resourceType="<%= actualResourceType %>" />

    <script>
        function json2csv(json) {
            var a = typeof json !== 'object' ? JSON.parse(json) : json;
            var csv = '\r\n\n';

            var line = "";
            for (var index in a[0]) {
                line += index + ',';
            }
            line = line.slice(0, -1);
            csv += line + '\r\n';

            for (var i = 0; i < a.length; i++) {
                var line = "";
                for (var index in a[i]) {
                    line += a[i][index] + ',';
                }
                line = line.slice(0, -1);
                csv += line + '\r\n';
            }

            return csv;
        }

        function checkApplyClientFilter(val, index) {
            var retStr = val;
            if (clientFilterList[index]) {
                retStr = clientFilterList[index](val);
            }
            return retStr;
        }

        function findClientFilter(rep) {
            for (var i = 0; i < rep.columns.length; i++) {
                if (rep.columns[i].definitions.data && rep.columns[i].definitions.data.clientfilter) {
                    clientFilterList[rep.columns[i].dataId] = rep.columns[i].definitions.data.clientFilter;
                }
            }
        }

        function downloadcsv(str) {
            if (navigator.appName != 'Microsoft Internet Explorer') {
                window.open('data:text/csv;charset=utf-8,' + encodeURIComponent(str));
            } else {
                var popup = window.open('', '', 'width=600,height=400');
                popup.document.open();
                popup.document.write('<pre>' + str + '</pre>');
                popup.document.close();
            }
        }

        function downloadgroupcsv() {
            var isGroupChecked = document.getElementById('groupexport').checked;
            if (isGroupChecked) {
                // Call the servlet to get the CSV file
                var xhr = new XMLHttpRequest();
                xhr.open('GET', '/bin/servlet', true);
                xhr.responseType = 'blob';
                xhr.onload = function () {
                    if (xhr.status === 200) {
                        var blob = new Blob([xhr.response], { type: 'text/csv' });
                        var link = document.createElement('a');
                        link.href = window.URL.createObjectURL(blob);
                        link.download = 'group_report.csv';
                        link.click();
                    }
                };
                xhr.send();
            } else {
                exportCSV();
            }
        }

        var clientFilterList = [];

        function normalizeRows(json, keys) {
            var a = typeof json !== 'object' ? JSON.parse(json) : json;
            var keys = [];
            for (var i = 0; i < a.length; ++i) {
                if (Object.keys(a[i]).length > keys.length) {
                    keys = Object.keys(a[i]);
                }
            }

            for (var i = 0; i < a.length; ++i) {
                var temp = {};
                for (var j = 0; j < keys.length; ++j) {
                    temp[keys[j]] = "";
                }
                for (var key in a[i]) {
                    temp[key] = a[i][key];
                }
                a[i] = temp;
            }

            return a;
        }

        function exportCSV() {
            var rep = CQ.reports.Report.theInstance;
            var repUrl = rep.reportPath + rep.reportSelector + CQ.HTTP.EXTENSION;

            CQ.HTTP.get(repUrl, function(options, success, response) {
                if (success) {
                    var repData = CQ.util.formatData(CQ.Ext.util.JSON.decode(response.responseText));
                    var csv = 'result,';
                    findClientFilter(rep);
                    csv += json2csv(normalizeRows(CQ.Ext.util.JSON.encode(repData.hits), Object.keys(repData.dataTypes)));
                    downloadcsv(csv);
                }
            });
        }
    </script>

    <div id="Q">
        <div id="reportView"></div>
    </div>
</body>
