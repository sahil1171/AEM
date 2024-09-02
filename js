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
