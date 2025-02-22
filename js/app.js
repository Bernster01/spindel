import {SpiderManager} from './spider/spider.js';
import {convertData} from './spider/data-converter.js';

(async () => {
    const data = await convertData('./data/data.csv');
    const manager = new SpiderManager(document.getElementById('spider_graph_container'));
    manager.addGraphsFromData(data);
    manager.setCanvasDimensions(1200,1200);
    manager.setFontSize(14);
    const settings = manager.getSettings();
    settings.gradient = true;
    settings.gradientColors = ['red', 'yellow', 'green'];
    settings.gradientColorsStep = true;
    settings.gradientColorsStepValues =[1, 0.5, 0];
    manager.setFontSize(20)
    manager.setSettings(settings);
    manager.init();
    const manager2 = new SpiderManager(document.getElementById('spider_graph_container_2'));
    const data2 = await convertData('./data/Test.csv',{firstRow:4,rows:4});
    manager2.addGraphsFromData(data2);
    manager2.setCanvasDimensions(1000,1000);
    manager2.setFontSize(14);
    manager2.init();
    console.log(manager2);
})()