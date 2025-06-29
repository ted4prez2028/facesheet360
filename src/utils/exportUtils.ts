
import ExcelJS from 'exceljs';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

interface DataItem {
  [key: string]: unknown;
}

interface TableNode {
  table: {
    body: unknown[][];
    widths: unknown[];
  };
}

// Set up the fonts for pdfMake correctly
// @ts-expect-error - Ignoring type error as pdfMake expects this assignment
pdfMake.vfs = pdfFonts.pdfMake?.vfs || pdfFonts.vfs;

export const exportToExcel = async (data: DataItem[], fileName: string) => {
  if (!data.length) {
    console.error('No data to export');
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');

  // Add headers
  const headers = Object.keys(data[0]);
  worksheet.columns = headers.map(header => ({ header, key: header, width: 20 }));

  // Add rows
  worksheet.addRows(data);

  // Style the header
  worksheet.getRow(1).font = { bold: true };

  // Write to buffer and trigger download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${fileName}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPdf = (title: string, data: DataItem[]) => {
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
          hLineWidth: function(i: number, node: TableNode) {
            return (i === 0 || i === node.table.body.length) ? 1 : 0.5;
          },
          vLineWidth: function(i: number, node: TableNode) {
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
  }; // Type assertion to avoid complex typing

  pdfMake.createPdf(docDefinition).download(`${title}.pdf`);
};
