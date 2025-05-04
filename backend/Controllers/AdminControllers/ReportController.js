import PDFDocument from 'pdfkit';
import fs from 'fs'; // Node.js file system module (optional, for saving temporarily)
import path from 'path'; // Node.js path module
import moment from 'moment';
import { fileURLToPath } from 'url'; // Needed to resolve __dirname in ES modules

// Import ALL necessary functions from AnalyticsController using correct names
import {
  generateAttendanceRecommendations,
  calculateParticipationTrends,
  getStudentEnrollmentSummary, // Correct function name
  getAttendanceByDayOfWeek,
  getModuleAttendanceSummary,
  // ... add imports for any other data you want in the report
} from './AnalyticsController.js';

// Import the function to get the AI summary
import { getGeminiInsights } from './AIInsightsController.js';

// Import the utility to generate chart images
import { generateChartImage } from '../../Utils/chartImageGenerator.js';

// Calculate __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to format section titles
const addSectionTitle = (doc, title) => {
  doc.moveDown(1.5)
    .fontSize(12)
    .font('Helvetica-Bold')
    .text(title, { underline: true, align: 'left' })
    .moveDown(0.5)
    .fontSize(10)
    .font('Helvetica');
};

// Helper to format list items (basic)
const addListItem = (doc, text) => {
    doc.text(` • ${text}`, { continued: false, indent: 15 }).moveDown(0.3);
};

// Helper for improved tables
const addTable = (doc, headers, rows, colWidths = []) => {
  const startX = 50;
  let y = doc.y;
  const defaultColWidth = 120;
  // Defensive: Ensure colWidths is valid
  if (!Array.isArray(colWidths) || colWidths.length !== headers.length) {
    colWidths = Array(headers.length).fill(defaultColWidth);
  }

  // Defensive: If no rows, skip drawing table
  if (!Array.isArray(rows) || rows.length === 0) {
    doc.moveDown(1);
    return;
  }

  // Header
  doc.font('Helvetica-Bold').fontSize(10);
  let x = startX;
  headers.forEach((header, i) => {
    doc.text(header, x, y, { width: colWidths[i], align: 'left' });
    x += colWidths[i];
  });
  y = doc.y + 5;

  // Defensive: Only draw line if y and colWidths are valid
  const totalWidth = colWidths.reduce((a, b) => (isNaN(a) ? 0 : a) + (isNaN(b) ? 0 : b), 0);
  if (!isNaN(y) && !isNaN(totalWidth) && totalWidth > 0) {
    doc.moveTo(startX, y).lineTo(startX + totalWidth, y).stroke();
  }
  y += 2;

  // Rows
  doc.font('Helvetica').fontSize(10);
  rows.forEach(row => {
    let x = startX;
    let cellHeights = [];
    // First, measure the height of each cell
    row.forEach((cell, i) => {
      const cellText = cell == null ? '' : String(cell);
      const options = { width: colWidths[i], align: typeof cell === 'number' || /^\d/.test(cellText) ? 'right' : 'left' };
      let height = 0;
      try {
        height = doc.heightOfString(cellText, options);
      } catch (e) {
        height = 12; // fallback height
      }
      if (isNaN(height) || height <= 0) height = 12;
      cellHeights.push(height);
    });
    const rowHeight = Math.max(...cellHeights, 12);

    // Now, actually render each cell at the same y
    x = startX;
    row.forEach((cell, i) => {
      const cellText = cell == null ? '' : String(cell);
      const options = { width: colWidths[i], align: typeof cell === 'number' || /^\d/.test(cellText) ? 'right' : 'left' };
      doc.text(cellText, x, y, options);
      x += colWidths[i];
    });
    y += rowHeight + 2; // Add a little space between rows
    doc.y = y; // Ensure doc.y is always at the bottom of the table
  });
  doc.moveDown(1);
};

export const generateAnalysisReport = async (req, res) => {
  console.log("Generating Analysis PDF Report...");
  try {
    // --- 1. Fetch ALL Data for the Report ---
    const [
      recommendations,
      participationData,
      studentSummary,
      attendanceByDay,
      moduleSummary,
      aiSummary // Fetch the AI summary as well
    ] = await Promise.all([
      generateAttendanceRecommendations(),
      calculateParticipationTrends(),
      getStudentEnrollmentSummary(), // Call correct function
      getAttendanceByDayOfWeek(),
      getModuleAttendanceSummary(),
      getGeminiInsights() // Call the AI summary function
    ]);

    // Extract topModules data if available
    const topModules = recommendations?.topModules || [];

    // --- 2. Create PDF Document ---
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Set Headers for Download
    const filename = `Analysis-Report-${moment().format('YYYY-MM-DD')}.pdf`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf');

    // Pipe the PDF output directly to the response stream
    doc.pipe(res);

    // --- 3. Add Content to PDF ---

    // Logo
    // IMPORTANT: Adjust this path relative to your *backend controllers* directory!
    const logoPath = path.join(__dirname, '../../../frontend/src/assets/logo.png'); 
    try {
        if (fs.existsSync(logoPath)) {
             doc.image(logoPath, 50, 35, { width: 120 }); // Increased width for bigger logo
        } else {
            console.warn("Logo file not found at:", logoPath);
        }
    } catch (imgErr) {
        console.error("Error adding logo:", imgErr);
    }
  
    // Header Text (position adjusted for logo)
    doc.fontSize(18).font('Helvetica-Bold').text('University Attendance Analysis Report', 50, 60, { align: 'center' });
    doc.fontSize(10).font('Helvetica').text(`Generated on: ${moment().format('YYYY-MM-DD HH:mm')}`, { align: 'center' });
    doc.moveDown(3); // More space after header

    // AI Summary Section
    addSectionTitle(doc, 'AI Generated Summary');
    // Basic text formatting for the AI summary (replace newlines)
    const formattedAiSummary = aiSummary.replace(/\*\*/g, '').replace(/##/g, '').replace(/###/g, '').replace(/^\s*\*/gm, ' • '); // Basic cleanup
    doc.fontSize(10).text(formattedAiSummary || "AI Summary could not be generated.");
    doc.moveDown(1);

    // --- Improved Data Summaries Section ---

    // Participation Trends Table
    if (participationData && participationData.length > 0) {
      addSectionTitle(doc, 'Participation Trends (Last 5 Weeks)');
      const last5 = participationData.slice(-5);
      const rows = last5.map(week => [
        `Week ${week.week}`,
        week.present,
        week.total,
        `${week.rate.toFixed(1)}%`
      ]);
      addTable(doc, ['Week', 'Present', 'Total', 'Participation Rate (%)'], rows, [70, 60, 60, 120]);
      let totalPresent = 0, totalPossible = 0;
      participationData.forEach(week => { totalPresent += week.present || 0; totalPossible += week.total || 0; });
      const avg = totalPossible === 0 ? 0 : ((totalPresent / totalPossible) * 100);
      doc.font('Helvetica-Bold').text(`Overall Average: ${avg.toFixed(1)}%`).moveDown(1);
    }

    // Student Distribution Table
    if (studentSummary && studentSummary.byFaculty && studentSummary.byFaculty.length > 0) {
      addSectionTitle(doc, 'Student Distribution by Faculty');
      const rows = studentSummary.byFaculty.map(faculty => [
        faculty._id || 'Unknown',
        faculty.count
      ]);
      addTable(doc, ['Faculty', 'Student Count'], rows, [200, 100]);
    }

    // Attendance by Day Table
    if (attendanceByDay && attendanceByDay.length > 0) {
      addSectionTitle(doc, 'Average Attendance Rate by Day');
      const rows = attendanceByDay.map(dayData => [
        dayData.day,
        `${dayData.rate.toFixed(1)}%`
      ]);
      addTable(doc, ['Day', 'Avg. Attendance Rate (%)'], rows, [120, 150]);
    }

    // Top Modules Table
    if (topModules && topModules.length > 0) {
      addSectionTitle(doc, 'Top 5 Attended Modules (Lectures)');
      const rows = topModules.map(m => [
        m.moduleName,
        m.lecturerName || 'N/A',
        m.attendanceCount
      ]);
      addTable(doc, ['Module', 'Lecturer', 'Present Count'], rows, [150, 120, 80]);
    }

    // --- Chart Configs (MOVED INSIDE FUNCTION) ---
    // 1. Participation Rate (Line Chart)
    const participationChartConfig = {
      type: 'line',
      data: {
        labels: participationData.map(week => `W${week.week}`),
        datasets: [{
          label: 'Participation Rate (%)',
          data: participationData.map(week => week.rate),
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }]
      },
      options: {
        plugins: { legend: { display: true } },
        scales: { y: { beginAtZero: true, max: 100 } }
      }
    };

    // 2. Student Distribution by Faculty (Pie Chart)
    const facultyLabels = (studentSummary?.byFaculty || []).map(f => f._id || 'Unknown');
    const facultyCounts = (studentSummary?.byFaculty || []).map(f => f.count);
    const facultyColors = [
      '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#e6fcf5', '#fff4e6'
    ];
    const studentPieChartConfig = {
      type: 'pie',
      data: {
        labels: facultyLabels,
        datasets: [{
          label: 'Student Count',
          data: facultyCounts,
          backgroundColor: facultyColors
        }]
      },
      options: {
        plugins: { legend: { display: true, position: 'bottom' } }
      }
    };

    // 3. Top 5 Most Attended Modules (Bar Chart)
    const topModuleLabels = topModules.map(m => m.moduleName);
    const topModuleCounts = topModules.map(m => m.attendanceCount);
    const moduleColors = [
      '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c'
    ];
    const topModulesBarChartConfig = {
      type: 'bar',
      data: {
        labels: topModuleLabels,
        datasets: [{
          label: 'Present Count',
          data: topModuleCounts,
          backgroundColor: moduleColors
        }]
      },
      options: {
        scales: { y: { beginAtZero: true } },
        plugins: {
            legend: { display: true },
            datalabels: {
                anchor: 'center',
                align: 'center',
                formatter: (value, context) => {
                    return value > 0 ? value : '';
                },
                color: '#ffffff',
                font: {
                    weight: 'bold'
                }
            }
        }
      }
    };

    // 4. Attendance by Day (Bar Chart)
    const attendanceByDayLabels = (attendanceByDay || []).map(d => d.day);
    const attendanceByDayRates = (attendanceByDay || []).map(d => d.rate);
    const dayColors = [
      '#e6fcf5', '#fff4e6', '#f3e8ff', '#dfeeff', '#ffebe6', '#f0f0f0', '#e0e0e0'
    ];
    const attendanceByDayBarChartConfig = {
      type: 'bar',
      data: {
        labels: attendanceByDayLabels,
        datasets: [{
          label: 'Avg. Attendance Rate (%)',
          data: attendanceByDayRates,
          backgroundColor: dayColors
        }]
      },
      options: {
        scales: { y: { beginAtZero: true, max: 100 } },
        plugins: {
           legend: { display: true },
           datalabels: {
                anchor: 'center',
                align: 'center',
                formatter: (value, context) => {
                    return value > 5 ? value.toFixed(1) + '%' : '';
                },
                color: '#333',
                font: {
                    weight: 'bold'
                }
            }
        }
      }
    };

    // --- 4. Add Charts to PDF ---
    addSectionTitle(doc, 'Visualizations');

    let currentY = doc.y;
    const pageHeight = doc.page.height - doc.page.margins.top - doc.page.margins.bottom;
    const chartHeight = 150; // Height of each chart image
    const titleHeight = 30; // Approximate height for title + spacing
    const spacing = 20; // Space between charts

    const addChart = (title, imageBuffer) => {
        const requiredHeight = titleHeight + chartHeight + spacing;
        // Check if there's enough space for this chart on the current page
        if (currentY + requiredHeight > pageHeight + doc.page.margins.top && doc.y !== doc.page.margins.top) {
            doc.addPage();
            currentY = doc.page.margins.top; // Reset Y for the new page
            addSectionTitle(doc, 'Visualizations (Continued)'); // Add continued title if needed
        } else {
           // Add a bit of space before the next chart if not on a new page start
           if (doc.y > doc.page.margins.top + 20) { // Avoid adding space right at the top
              doc.moveDown(1); // Add some space before the chart title
              currentY = doc.y;
           }
        }

        doc.fontSize(12).font('Helvetica-Bold').text(title, 50, currentY);
        currentY += titleHeight - 10; // Adjust Y after title

        if (imageBuffer) {
           try {
              doc.image(imageBuffer, 50, currentY, { width: 400, height: chartHeight }); // Slightly wider chart
              currentY += chartHeight + spacing;
              doc.y = currentY; // Explicitly set doc.y to the bottom of the added chart
           } catch (imgErr) {
               console.error(`Error adding chart image for "${title}":`, imgErr);
               doc.fillColor('red').text(`Error rendering chart: ${title}`, 50, currentY);
               currentY += 20; // Move down past error message
               doc.y = currentY;
               doc.fillColor('black'); // Reset color
           }

        } else {
           doc.fillColor('red').text(`Chart data unavailable for: ${title}`, 50, currentY);
           currentY += 20;
           doc.y = currentY;
           doc.fillColor('black');
        }
    };

    console.log("Generating chart images...");
    const [
      participationChartImage,
      studentPieChartImage,
      topModulesBarChartImage,
      attendanceByDayBarChartImage
    ] = await Promise.all([
      generateChartImage(participationChartConfig, 400, 150), // Match width
      generateChartImage(studentPieChartConfig, 400, 150),
      generateChartImage(topModulesBarChartConfig, 400, 150),
      generateChartImage(attendanceByDayBarChartConfig, 400, 150)
    ]);
    console.log("Chart images generated.");

    console.log("Adding charts to PDF...");
    addChart('Participation Rate Trend', participationChartImage);
    addChart('Student Distribution by Faculty', studentPieChartImage);
    addChart('Top 5 Attended Modules (Lectures)', topModulesBarChartImage);
    addChart('Average Attendance Rate by Day', attendanceByDayBarChartImage);
    console.log("Charts added to PDF.");

    // --- 5. Finalize PDF ---
    console.log("Finalizing PDF report stream.");
    doc.end();

  } catch (error) {
    console.error("Error generating PDF report:", error);
    // If headers haven't been sent, send an error response
    if (!res.headersSent) {
        res.status(500).json({ message: "Failed to generate report", error: error.message });
    } else {
        // If headers were sent, we can't send JSON, just end the response
        res.end();
    }
  }
};
