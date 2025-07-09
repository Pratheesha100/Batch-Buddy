import QuickChart from 'quickchart-js';

export async function generateChartImage(chartConfig, width = 600, height = 300) {
  const chart = new QuickChart();
  chart.setConfig(chartConfig);
  chart.setWidth(width);
  chart.setHeight(height);
  chart.setBackgroundColor('white');
  return await chart.toBinary();
}
