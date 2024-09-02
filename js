 <script>
        function exportCSV() {
            // Check if the 'group' checkbox is selected
            var groupChecked = document.getElementById('groupCheckbox').checked;

            if (groupChecked) {
                // Create a link element
                var link = document.createElement('a');
                link.href = '/bin/exportcsv'; // The path to your servlet
                link.download = 'export.csv'; // Optional: you can specify the default filename here

                // Append link to the body
                document.body.appendChild(link);

                // Programmatically click the link to trigger download
                link.click();

                // Remove link from the body
                document.body.removeChild(link);
            } else {
                alert('Please select the group checkbox to export.');
            }
        }
    </script>
