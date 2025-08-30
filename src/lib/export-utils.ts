export function exportTableToCSV(
  tableElement: Element,
  filename: string = 'export'
): void {
  const rows = Array.from(tableElement.querySelectorAll('tr'));

  if (rows.length === 0) {
    alert('No data to export');
    return;
  }

  // Get headers from the first row
  const headers = Array.from(rows[0].querySelectorAll('th, td'))
    .map((cell) => {
      // Skip action columns (usually the last column)
      if (
        cell.textContent?.includes('Actions') ||
        cell.textContent?.includes('Action')
      ) {
        return null;
      }
      return cell.textContent?.trim() || '';
    })
    .filter((header) => header !== null);

  // Get data rows (skip header row)
  const dataRows = rows.slice(1).map((row) => {
    return Array.from(row.querySelectorAll('td'))
      .map((cell, index) => {
        // Skip action columns
        if (index === headers.length) {
          return null;
        }

        let cellText = cell.textContent?.trim() || '';

        // Handle badges and other complex content
        const badge = cell.querySelector('.badge, [class*="badge"]');
        if (badge) {
          cellText = badge.textContent?.trim() || '';
        }

        // Handle phone numbers (remove + prefix for cleaner export)
        if (cellText.startsWith('+')) {
          cellText = cellText.substring(1);
        }

        return cellText;
      })
      .filter((cell) => cell !== null);
  });

  // Combine headers and data
  const csvContent = [headers, ...dataRows]
    .map((row) =>
      row
        .map((cell) => {
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          const escaped = String(cell).replace(/"/g, '""');
          if (
            escaped.includes(',') ||
            escaped.includes('"') ||
            escaped.includes('\n')
          ) {
            return `"${escaped}"`;
          }
          return escaped;
        })
        .join(',')
    )
    .join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `${filename}-${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export function exportTableToExcel(
  tableElement: Element,
  filename: string = 'export'
): void {
  const rows = Array.from(tableElement.querySelectorAll('tr'));

  if (rows.length === 0) {
    alert('No data to export');
    return;
  }

  // Get headers from the first row
  const headers = Array.from(rows[0].querySelectorAll('th, td'))
    .map((cell) => {
      // Skip action columns (usually the last column)
      if (
        cell.textContent?.includes('Actions') ||
        cell.textContent?.includes('Action')
      ) {
        return null;
      }
      return cell.textContent?.trim() || '';
    })
    .filter((header) => header !== null);

  // Get data rows (skip header row)
  const dataRows = rows.slice(1).map((row) => {
    return Array.from(row.querySelectorAll('td'))
      .map((cell, index) => {
        // Skip action columns
        if (index === headers.length) {
          return null;
        }

        let cellText = cell.textContent?.trim() || '';

        // Handle badges and other complex content
        const badge = cell.querySelector('.badge, [class*="badge"]');
        if (badge) {
          cellText = badge.textContent?.trim() || '';
        }

        // Handle phone numbers (remove + prefix for cleaner export)
        if (cellText.startsWith('+')) {
          cellText = cellText.substring(1);
        }

        return cellText;
      })
      .filter((cell) => cell !== null);
  });

  // Create HTML table for Excel
  let htmlContent =
    '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
  htmlContent +=
    '<head><meta charset="utf-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Sheet1</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>';
  htmlContent += '<body><table>';

  // Add headers
  htmlContent += '<tr>';
  headers.forEach((header) => {
    htmlContent += `<th>${header}</th>`;
  });
  htmlContent += '</tr>';

  // Add data rows
  dataRows.forEach((row) => {
    htmlContent += '<tr>';
    row.forEach((cell) => {
      htmlContent += `<td>${cell}</td>`;
    });
    htmlContent += '</tr>';
  });

  htmlContent += '</table></body></html>';

  // Create and download file
  const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `${filename.replace('.xlsx', '')}-${new Date().toISOString().split('T')[0]}.xlsx`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Functions for DataTable components
export function exportDataTableToCSV<TData>(
  table: any,
  columns: Array<{
    accessorKey?: string;
    header: string | ((props: any) => string);
    id?: string;
  }>,
  filename: string = 'export'
): void {
  const data = table.getFilteredRowModel().rows.map((row: any) => row.original);

  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  // Extract headers
  const headers = columns
    .filter((col) => col.id !== 'actions' && col.accessorKey)
    .map((col) => {
      if (typeof col.header === 'function') {
        return col.accessorKey || col.id || 'Column';
      }
      return col.header;
    });

  // Extract data rows
  const rows = data.map((row: any) => {
    return columns
      .filter((col) => col.id !== 'actions' && col.accessorKey)
      .map((col) => {
        const value = (row as any)[col.accessorKey!];
        if (value === null || value === undefined) {
          return '';
        }

        if (value instanceof Date) {
          return value.toISOString().split('T')[0];
        }

        if (typeof value === 'object') {
          return JSON.stringify(value);
        }

        return String(value);
      });
  });

  // Combine headers and data
  const csvContent = [headers, ...rows]
    .map((row: any[]) =>
      row
        .map((cell: any) => {
          const escaped = String(cell).replace(/"/g, '""');
          if (
            escaped.includes(',') ||
            escaped.includes('"') ||
            escaped.includes('\n')
          ) {
            return `"${escaped}"`;
          }
          return escaped;
        })
        .join(',')
    )
    .join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `${filename}-${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export function exportDataTableToExcel<TData>(
  table: any,
  columns: Array<{
    accessorKey?: string;
    header: string | ((props: any) => string);
    id?: string;
  }>,
  filename: string = 'export'
): void {
  const data = table.getFilteredRowModel().rows.map((row: any) => row.original);

  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  // Extract headers
  const headers = columns
    .filter((col) => col.id !== 'actions' && col.accessorKey)
    .map((col) => {
      if (typeof col.header === 'function') {
        return col.accessorKey || col.id || 'Column';
      }
      return col.header;
    });

  // Extract data rows
  const rows = data.map((row: any) => {
    return columns
      .filter((col) => col.id !== 'actions' && col.accessorKey)
      .map((col) => {
        const value = (row as any)[col.accessorKey!];
        if (value === null || value === undefined) {
          return '';
        }

        if (value instanceof Date) {
          return value.toISOString().split('T')[0];
        }

        if (typeof value === 'object') {
          return JSON.stringify(value);
        }

        return String(value);
      });
  });

  // Create HTML table for Excel
  let htmlContent =
    '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
  htmlContent +=
    '<head><meta charset="utf-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Sheet1</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>';
  htmlContent += '<body><table>';

  // Add headers
  htmlContent += '<tr>';
  headers.forEach((header) => {
    htmlContent += `<th>${header}</th>`;
  });
  htmlContent += '</tr>';

  // Add data rows
  rows.forEach((row: any[]) => {
    htmlContent += '<tr>';
    row.forEach((cell: any) => {
      htmlContent += `<td>${cell}</td>`;
    });
    htmlContent += '</tr>';
  });

  htmlContent += '</table></body></html>';

  // Create and download file
  const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `${filename.replace('.xlsx', '')}-${new Date().toISOString().split('T')[0]}.xlsx`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export function getExportableData<TData>(
  table: any,
  includeSelectedOnly: boolean = false
): TData[] {
  if (includeSelectedOnly) {
    return table
      .getFilteredSelectedRowModel()
      .rows.map((row: any) => row.original);
  }
  return table.getFilteredRowModel().rows.map((row: any) => row.original);
}
