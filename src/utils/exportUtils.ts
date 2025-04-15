
import * as XLSX from 'xlsx';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Set up the fonts for pdfMake correctly
// @ts-ignore - Ignoring type error as pdfMake expects this assignment
pdfMake.vfs = pdfFonts.pdfMake?.vfs || pdfFonts.vfs;

export const exportToExcel = (data: any[], fileName: string) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

export const exportToPdf = (title: string, data: any[]) => {
  if (!data.length) {
    console.error('No data to export');
    return;
  }

  const headers = Object.keys(data[0]).map(key => ({
    text: key.charAt(0).toUpperCase() + key.slice(1),
    style: 'tableHeader'
  }));
  
  const rows = data.map(item => 
    Object.values(item).map(value => ({
      text: value === null || value === undefined ? '-' : String(value),
      style: 'tableCell'
    }))
  );

  const docDefinition = {
    content: [
      { text: title, style: 'header' },
      {
        style: 'tableExample',
        table: {
          headerRows: 1,
          widths: Array(headers.length).fill('*'),
          body: [
            headers,
            ...rows
          ]
        },
        layout: {
          hLineWidth: function(i: number, node: any) {
            return (i === 0 || i === node.table.body.length) ? 1 : 0.5;
          },
          vLineWidth: function(i: number, node: any) {
            return (i === 0 || i === node.table.widths.length) ? 1 : 0.5;
          },
          hLineColor: function(i: number) {
            return i === 0 ? '#000' : '#aaa';
          },
          vLineColor: function(i: number) {
            return i === 0 ? '#000' : '#aaa';
          }
        }
      }
    ],
    styles: {
      header: {
        fontSize: 18,
        bold: true,
        margin: [0, 0, 0, 10]
      },
      tableExample: {
        margin: [0, 5, 0, 15]
      },
      tableHeader: {
        bold: true,
        fontSize: 12,
        color: 'black',
        fillColor: '#eeeeee'
      },
      tableCell: {
        fontSize: 10,
        color: '#333333'
      }
    }
  } as any; // Type assertion to avoid complex typing

  pdfMake.createPdf(docDefinition).download(`${title}.pdf`);
};
