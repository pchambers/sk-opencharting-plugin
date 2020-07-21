const generateContour = require('./generateContour');
const fs = require('fs');

const uuid = 'eac717c9-4509-4547-8e32-ba6f99841ffa';

//thresholds as multiples of vessel draft (to be customized in plugin.schema)
//will add as optional 3rd argument for renderContour()
const thresholds = [0.6,1.2,1.8];

let testPlot = JSON.parse(fs.readFileSync('./plots/'+uuid+'.json'));

var contour = generateContour.formatPlot(testPlot);
contour = fillDummyDepthData(contour);
contour = generateContour.renderContour(contour, uuid);
fs.writeFileSync('contour.json',JSON.stringify(contour,null,3));


//
function fillDummyDepthData(contour){
    for(var i=0;i<contour.size.arrayLength;i++){
        contour.depth[i] = parseFloat((Math.random()*10+Math.random()).toFixed(2));
    }
    return contour;
}
