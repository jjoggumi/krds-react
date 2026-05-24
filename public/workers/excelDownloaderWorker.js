importScripts('https://cdn.jsdelivr.net/npm/xlsx-populate/browser/xlsx-populate.min.js');

self.onmessage = function(event) {
  const { excelBuffer, password } = event.data;

  XlsxPopulate.fromDataAsync(excelBuffer)
    .then(workbook => {
      return workbook.outputAsync({ password });
    })
    .then(encryptedBuffer => {
      const blob = new Blob([encryptedBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      self.postMessage(blob);
    })
    .catch(error => {
      console.error('Error generating encrypted Excel:', error);
      self.postMessage({ error: error.message });
    });
};