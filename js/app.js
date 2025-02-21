import {SpiderManager} from './spider/spider.js';
import {convertData} from './spider/data-converter.js';

(async () => {
    const data = await convertData('../data/data.csv');
    const manager = new SpiderManager(document.getElementById('spider_graph_container'));
    manager.addGraphsFromData(data);
    manager.setCanvasDimensions(1000,1000);
    manager.setFontSize(14);
    const settings = manager.getSettings();
    manager.setSettings(settings);
    manager.init();
    const manager2 = new SpiderManager(document.getElementById('spider_graph_container_2'));
    const data2 = await convertData('../data/Test.csv',{firstRow:1,rows:1});
    manager2.addGraphsFromData(data2);
    manager2.setCanvasDimensions(1000,1000);
    manager2.setFontSize(14);
    manager2.init();
    console.log(manager2);
})()