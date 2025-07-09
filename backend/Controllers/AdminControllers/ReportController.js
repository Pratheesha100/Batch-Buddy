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
  const startX = doc.page.margins.left;
  const pageEndY = doc.page.height - doc.page.margins.bottom;
  const defaultColWidth = (doc.page.width - doc.page.margins.left - doc.page.margins.right) / headers.length; // Distribute width if not specified

  // Use provided colWidths or default
  if (!Array.isArray(colWidths) || colWidths.length !== headers.length || colWidths.some(isNaN)) {
    colWidths = Array(headers.length).fill(defaultColWidth);
  }

  // Defensive: If no rows, skip drawing table
  if (!Array.isArray(rows) || rows.length === 0) {
    // doc.moveDown(1); // Don't move down if nothing was drawn
    return;
  }

  const headerHeight = doc.heightOfString(headers.join(' '), { 
      width: colWidths.reduce((a, b) => a + b, 0), 
      align: 'left' 
  }) + 10; // Estimate header height with padding
  const firstRowHeight = doc.heightOfString(rows[0].join(' '), { 
      width: colWidths.reduce((a, b) => a + b, 0), 
      align: 'left' 
  }) + 5; // Estimate first row height

  // Check if header + first row fit, if not, add page
  if (doc.y + headerHeight + firstRowHeight > pageEndY) {
    doc.addPage();
    doc.y = doc.page.margins.top; // Reset y position
  }

  let currentY = doc.y;

  // Function to draw header (reusable for page breaks)
  const drawHeader = (yPos) => {
    doc.font('Helvetica-Bold').fontSize(10);
    let currentX = startX;
    headers.forEach((header, i) => {
      doc.text(header, currentX, yPos, { width: colWidths[i], align: 'left' });
      currentX += colWidths[i];
    });
    const headerBottomY = doc.y + 5; // Get y after header text is potentially wrapped
    // Draw line below header
    doc.moveTo(startX, headerBottomY).lineTo(startX + colWidths.reduce((a, b) => a + b, 0), headerBottomY).stroke();
    return headerBottomY + 2; // Return Y position below the header line
  };

  // Draw initial header
  currentY = drawHeader(currentY);
  doc.y = currentY; // Update doc's y position

  // Rows
  doc.font('Helvetica').fontSize(10);
  rows.forEach((row, rowIndex) => {
    let cellHeights = [];
    // Measure cell heights for the current row
    row.forEach((cell, i) => {
      const cellText = cell == null ? '' : String(cell);
      const options = { width: colWidths[i], align: 'left' /* Default left, adjust if needed */ };
      let height = 12; // Min height
      try {
        height = doc.heightOfString(cellText, options);
      } catch (e) { /* ignore error */ }
      cellHeights.push(Math.max(height, 12)); // Ensure minimum height
    });
    const rowHeight = Math.max(...cellHeights) + 4; // Max height + padding

    // Check if the current row fits on the page
    if (currentY + rowHeight > pageEndY) {
      doc.addPage();
      currentY = doc.page.margins.top; // Reset Y for new page
      currentY = drawHeader(currentY); // Redraw header on new page
      doc.y = currentY; // Update doc's y position
    }

    // Draw the row content
    let currentX = startX;
    row.forEach((cell, i) => {
      const cellText = cell == null ? '' : String(cell);
      const options = { width: colWidths[i], align: typeof cell === 'number' ? 'right' : 'left' }; // Align numbers right
      doc.text(cellText, currentX, currentY, options);
      currentX += colWidths[i];
    });

    currentY += rowHeight; // Move Y down by the calculated row height
    doc.y = currentY; // Update doc's y position after drawing row
  });

  doc.moveDown(1); // Add space after the entire table
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
             doc.image(logoPath, 50, 40, { width: 120 }); // Set Y back near top (e.g., 40)
        } else {
            console.warn("Logo file not found at:", logoPath);
        }
    } catch (imgErr) {
        console.error("Error adding logo:", imgErr);
    }

    // Header Text (aligned considering margin)
    doc.fontSize(18).font('Helvetica-Bold').text('University Attendance Analysis Report', doc.page.margins.left, 60, { align: 'center' });
    doc.fontSize(10).font('Helvetica').text(`Generated on: ${moment().format('YYYY-MM-DD HH:mm')}`, doc.page.margins.left, 85, { align: 'center' });
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
                anchor: 'end',
                align: 'end',
                formatter: (value, context) => {
                    return value > 0 ? value : '';
                },
                color: '#555',
                font: {
                    weight: 'normal',
                    size: 9
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
                anchor: 'end',
                align: 'end',
                formatter: (value, context) => {
                    return value > 0 ? value.toFixed(1) + '%' : '';
                },
                color: '#555',
                font: {
                    weight: 'normal',
                    size: 9
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
