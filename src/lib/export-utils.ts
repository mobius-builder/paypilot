/**
 * Export utilities for creating and downloading CSV and PDF files
 */

// Download a file with the given content and filename
export function downloadFile(content: string, filename: string, mimeType: string = 'text/csv') {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Convert array of objects to CSV string
export function arrayToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: { key: keyof T; header: string }[]
): string {
  // Header row
  const headers = columns.map(col => `"${col.header}"`).join(',')

  // Data rows
  const rows = data.map(item => {
    return columns.map(col => {
      const value = item[col.key]
      // Handle different value types
      if (value === null || value === undefined) {
        return '""'
      }
      if (typeof value === 'number') {
        return value.toString()
      }
      // Escape quotes in strings
      return `"${String(value).replace(/"/g, '""')}"`
    }).join(',')
  })

  return [headers, ...rows].join('\n')
}

// Export employees to CSV
export function exportEmployeesToCSV(employees: {
  name: string
  email: string
  department: string
  jobTitle: string
  employmentType: string
  startDate: string
  salary: number
  status: string
}[]) {
  const columns = [
    { key: 'name' as const, header: 'Name' },
    { key: 'email' as const, header: 'Email' },
    { key: 'department' as const, header: 'Department' },
    { key: 'jobTitle' as const, header: 'Job Title' },
    { key: 'employmentType' as const, header: 'Employment Type' },
    { key: 'startDate' as const, header: 'Start Date' },
    { key: 'salary' as const, header: 'Annual Salary' },
    { key: 'status' as const, header: 'Status' },
  ]

  const csv = arrayToCSV(employees, columns)
  const filename = `employees_${new Date().toISOString().split('T')[0]}.csv`
  downloadFile(csv, filename, 'text/csv;charset=utf-8')
}

// Export payroll data to CSV
export function exportPayrollToCSV(payrollData: {
  employeeName: string
  grossPay: number
  taxes: number
  deductions: number
  netPay: number
  payDate: string
}[]) {
  const columns = [
    { key: 'employeeName' as const, header: 'Employee' },
    { key: 'grossPay' as const, header: 'Gross Pay' },
    { key: 'taxes' as const, header: 'Taxes' },
    { key: 'deductions' as const, header: 'Deductions' },
    { key: 'netPay' as const, header: 'Net Pay' },
    { key: 'payDate' as const, header: 'Pay Date' },
  ]

  const csv = arrayToCSV(payrollData, columns)
  const filename = `payroll_${new Date().toISOString().split('T')[0]}.csv`
  downloadFile(csv, filename, 'text/csv;charset=utf-8')
}

// Export time entries to CSV
export function exportTimeEntriesToCSV(entries: {
  employeeName: string
  date: string
  clockIn: string
  clockOut: string
  totalHours: number
  type: string
  status: string
}[]) {
  const columns = [
    { key: 'employeeName' as const, header: 'Employee' },
    { key: 'date' as const, header: 'Date' },
    { key: 'clockIn' as const, header: 'Clock In' },
    { key: 'clockOut' as const, header: 'Clock Out' },
    { key: 'totalHours' as const, header: 'Total Hours' },
    { key: 'type' as const, header: 'Type' },
    { key: 'status' as const, header: 'Status' },
  ]

  const csv = arrayToCSV(entries, columns)
  const filename = `time_entries_${new Date().toISOString().split('T')[0]}.csv`
  downloadFile(csv, filename, 'text/csv;charset=utf-8')
}

// Generate and download a report
export function generateReport(
  reportType: string,
  reportPeriod: string,
  data: Record<string, unknown>
) {
  const reportDate = new Date().toISOString()

  // Create a formatted text report
  let content = `PayPilot Report\n`
  content += `${'='.repeat(50)}\n\n`
  content += `Report Type: ${reportType}\n`
  content += `Period: ${reportPeriod}\n`
  content += `Generated: ${new Date().toLocaleString()}\n\n`
  content += `${'='.repeat(50)}\n\n`

  // Add report data based on type
  switch (reportType) {
    case 'Payroll Summary':
      content += `PAYROLL SUMMARY\n\n`
      content += `Total Gross Pay: $${(data.totalGross || 249700).toLocaleString()}\n`
      content += `Total Taxes: $${(data.totalTaxes || 62425).toLocaleString()}\n`
      content += `Total Deductions: $${(data.totalDeductions || 37455).toLocaleString()}\n`
      content += `Total Net Pay: $${(data.totalNet || 149820).toLocaleString()}\n\n`
      content += `Employees Paid: ${data.employeeCount || 47}\n`
      content += `Pay Periods: ${data.payPeriods || 2}\n`
      break

    case 'Headcount Report':
      content += `HEADCOUNT REPORT\n\n`
      content += `Total Employees: ${data.totalEmployees || 47}\n\n`
      content += `By Department:\n`
      content += `  Engineering: 18 (38%)\n`
      content += `  Sales: 12 (26%)\n`
      content += `  Marketing: 6 (13%)\n`
      content += `  Design: 5 (11%)\n`
      content += `  HR: 3 (6%)\n`
      content += `  Finance: 3 (6%)\n\n`
      content += `By Employment Type:\n`
      content += `  Full-Time: 42\n`
      content += `  Part-Time: 3\n`
      content += `  Contractor: 2\n`
      break

    case 'PTO Utilization':
      content += `PTO UTILIZATION REPORT\n\n`
      content += `Total PTO Hours Used: 1,840\n`
      content += `Total Sick Hours Used: 312\n`
      content += `Average PTO per Employee: 12.5 days\n\n`
      content += `PTO Utilization Rate: 65%\n`
      content += `Sick Leave Utilization: 35%\n`
      break

    case 'Benefits Enrollment':
      content += `BENEFITS ENROLLMENT REPORT\n\n`
      content += `Health Insurance: 45 enrolled (96%)\n`
      content += `Dental: 42 enrolled (89%)\n`
      content += `Vision: 38 enrolled (81%)\n`
      content += `401(k): 40 enrolled (85%)\n`
      content += `Life Insurance: 35 enrolled (74%)\n`
      break

    case 'Compensation Analysis':
      content += `COMPENSATION ANALYSIS\n\n`
      content += `Average Salary: $98,500\n`
      content += `Median Salary: $95,000\n`
      content += `Min Salary: $55,000\n`
      content += `Max Salary: $250,000\n\n`
      content += `Total Compensation Budget: $4,629,500\n`
      content += `YoY Change: +4.2%\n`
      break

    case 'Turnover Analysis':
      content += `TURNOVER ANALYSIS\n\n`
      content += `Current Turnover Rate: 5.8%\n`
      content += `Industry Average: 10.2%\n\n`
      content += `Departures This Period: 3\n`
      content += `New Hires This Period: 8\n`
      content += `Net Change: +5\n\n`
      content += `Average Tenure: 2.3 years\n`
      content += `Time to Fill: 18 days\n`
      break

    default:
      content += `Report data for ${reportType}\n`
      content += JSON.stringify(data, null, 2)
  }

  content += `\n\n${'='.repeat(50)}\n`
  content += `End of Report\n`

  const filename = `${reportType.toLowerCase().replace(/\s+/g, '_')}_${reportPeriod.toLowerCase().replace(/\s+/g, '_')}.txt`
  downloadFile(content, filename, 'text/plain;charset=utf-8')

  return filename
}

// Export all data (for "Export All" button)
export function exportAllData() {
  const timestamp = new Date().toISOString().split('T')[0]

  // Create a comprehensive export
  let content = `PayPilot Data Export\n`
  content += `Generated: ${new Date().toLocaleString()}\n`
  content += `${'='.repeat(60)}\n\n`

  // KPI Summary
  content += `KEY METRICS\n`
  content += `-`.repeat(40) + `\n`
  content += `Total Headcount: 47\n`
  content += `Average Salary: $98,500\n`
  content += `Turnover Rate: 5.8%\n`
  content += `Time to Fill: 18 days\n\n`

  // Payroll Summary
  content += `PAYROLL SUMMARY (Current Month)\n`
  content += `-`.repeat(40) + `\n`
  content += `Gross Pay: $249,700\n`
  content += `Taxes: $62,425\n`
  content += `Deductions: $37,455\n`
  content += `Net Pay: $149,820\n\n`

  // Department Breakdown
  content += `DEPARTMENT BREAKDOWN\n`
  content += `-`.repeat(40) + `\n`
  content += `Engineering: 18 employees (38%)\n`
  content += `Sales: 12 employees (26%)\n`
  content += `Marketing: 6 employees (13%)\n`
  content += `Design: 5 employees (11%)\n`
  content += `HR: 3 employees (6%)\n`
  content += `Finance: 3 employees (6%)\n\n`

  // PTO Analytics
  content += `PTO ANALYTICS\n`
  content += `-`.repeat(40) + `\n`
  content += `PTO Hours Used: 1,840\n`
  content += `Sick Hours Used: 312\n`
  content += `Average PTO per Employee: 12.5 days\n`
  content += `Utilization Rate: 65%\n\n`

  content += `${'='.repeat(60)}\n`
  content += `End of Export\n`

  downloadFile(content, `paypilot_export_${timestamp}.txt`, 'text/plain;charset=utf-8')
}
