# sk-opencharting-plugin
Save depth data and generate GeoJSON contours

Right now this only has functionality to test run testing with a local sample data set. 
'npm run test' to generate geoJson file from test data. 

To minimize load during the run: 

Plot Object: 

1. Boat is saving plot[lat][long].depth as the kalman filter over the array of plot[lat][long].all
  
  a. At each delta if the plugin has recent depth and position data it will first push the most recent sounding to plot[lat][long].all and then run a kalman filter over the .all array and save to the .depth value.
  
  b. The '.all' array is limited to the most recent 20 values to limit file size and minimize noise. 
  
  c. Each plot is titled by a UUID unique to each mission or trip. 
  
  d. At the end of the trip the plot is saved locally to './plots/<UUID>.json'
  
  e. The resolution is 0.00001' or approximately 1m x 1m at 0'x0'
  
  f. Depth is assumed to be recorded in meteres below the waterline.
  
2. The plot object is then converted to a rectangular data set to be analyzed by the d3-contour package.

3. The GeoJSON Multipolygon object is saved as './contours/<UUID>.json
