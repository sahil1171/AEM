<script>
    function json2csv(json) {
        var a = typeof json !== 'object' ? JSON.parse(json) : json;
        var csv = '\r\n\n';

        var line = "";
        for (var index in a[0]) {
            line += index.slice(0, -3) + ',';
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

    function downloadGroupCsv() {
        var checkbox = document.getElementById('groupexport');
        var url = '/bin/servlet/'; // Your AEM servlet URL
        var xhr = new XMLHttpRequest();
        
        xhr.open('GET', url, true);
        xhr.responseType = 'blob';

        xhr.onload = function() {
            if (xhr.status === 200) {
                var blob = xhr.response;
                var link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.download = 'groupreport.csv';
                link.click();
            } else {
                console.error('Failed to download CSV from servlet');
            }
        };

        xhr.send();
    }

    function downloadcsv(str) {
        if (navigator.appName !== 'Microsoft Internet Explorer') {
            window.open('data:text/csv;charset=utf-8,' + encodeURIComponent(str));
        } else {
            var popup = window.open('', 'popup');
            popup.document.body.innerHTML = '<pre>' + str + '</pre>';
        }
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
        var checkbox = document.getElementById('groupexport');

        if (checkbox.checked) {
            // Call the servlet to download the group report
            downloadGroupCsv();
        } else {
            // Proceed with regular CSV download
            var rep = CQ.reports.Report.theInstance;

            CQ.HTTP.get(rep.reportPath + rep.reportSelector + CQ.HTTP.EXTENSION, function(options, success, response) {
                if (success) {
                    var repData = CQ.util.formatData(CQ.Ext.util.JSON.decode(response.repData.results));
                    var csv = 'result,';
                    findClientFilter(rep);
                    csv += json2csv(normalizeRows(CQ.Ext.util.JSON.encode(repData.hits), Object.keys(repData.dataTypes)));
                    downloadcsv(csv);
                }
            });
        }
    }
</script>
