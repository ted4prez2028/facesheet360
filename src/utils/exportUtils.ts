
import * as XLSX from 'xlsx';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

export const exportToExcel = (data: any[], fileName: string) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

export const exportToPdf = (title: string, data: any[]) => {
  const docDefinition = {
    content: [
      { text: title, style: 'header' },
      {
        table: {
          headerRows: 1,
          body: [
            Object.keys(data[0]),
            ...data.map(item => Object.values(item))
          ]
        }
      }
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10]
      }
    }
  };

  pdfMake.createPdf(docDefinition).download(`${title}.pdf`);
};
