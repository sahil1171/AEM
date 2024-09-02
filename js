<body>
    <script src="/libs/cq/ui/resources/cq-ui.js" type="text/javascript"></script>
    <h2>
        <%= actualTitle %>&nbsp;&nbsp;&nbsp;&nbsp;
        <input type="checkbox" id="groupexport" name="groupexport" value="group">
        <label for="groupexport">Group Report</label>&nbsp;&nbsp;&nbsp;&nbsp;
        <a href="javascript:exportCSV()">Export</a>
    </h2>

    <% if (description != null) { %>
        <p><%= description %></p>
    <% } %>

    <cq:include path="report" resourceType="<%= actualResourceType %>" />

    <script>
        function json2csv(json) {
            var data = typeof json !== 'object' ? JSON.parse(json) : json;
            var csv = '\r\n\n';
            var line = "";

            for (var index in data[0]) {
                line += index.slice(0, -3) + ',';
            }
            line = line.slice(0, -1);
            csv += line + '\r\n';

            for (var i = 0; i < data.length; i++) {
                var line = "";
                for (var index in data[i]) {
                    line += data[i][index] + ',';
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
                    clientFilterList[rep.columns[i].dataId] = rep.columns[i].definitions.data.clientfilter;
                }
            }
        }

        function downloadcsv(str) {
            if (navigator.appName !== 'Microsoft Internet Explorer') {
                window.open('data:text/csv;charset=utf-8,' + encodeURIComponent(str));
            } else {
                var popup = window.open('', '', 'width=600,height=400');
                popup.document.open();
                popup.document.write('<pre>' + str + '</pre>');
                popup.document.close();
            }
        }

        var clientFilterList = [];

        function normalizeRows(json, keys) {
            var data = typeof json !== 'object' ? JSON.parse(json) : json;
            var keys = [];

            for (var i = 0; i < data.length; ++i) {
                if (Object.keys(data[i]).length > keys.length) {
                    keys = Object.keys(data[i]);
                }
            }

            for (var i = 0; i < data.length; ++i) {
                if (keys.length > Object.keys(data[i]).length) {
                    var temp = jQuery.extend({}, data[i]);
                    for (var key in data[i]) {
                        temp[key] = data[i][key];
                    }
                    data[i] = temp;
                }
            }
            return data;
        }

        function exportCSV() {
            var rep = CQ.reports.Report.theInstance;

            CQ.HTTP.get(rep.reportPath + rep.reportSelector + CQ.HTTP.EXTENSION, function(options, success, response) {
                if (success) {
                    var repData = CQ.util.formatData(CQ.Ext.util.JSON.decode(response.repData.results), responseText);
                    var csv = 'result,';

                    findClientFilter(rep);
                    csv = json2csv(normalizeRows(CQ.Ext.util.JSON.encode(repData.hits), Object.keys(repData.dataTypes)));
                    downloadcsv(csv);
                }
            });
        }
    </script>
    <div id="Q">
        <div id="reportView">
        </div>
    </div>
</body>
