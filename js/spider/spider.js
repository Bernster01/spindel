import { convertData } from './data-converter.js';
export class SpiderGraph {
    constructor(name = 'Spider Graph') {
        this.name = name;
        this.nodes = [];
    }
    setContainer(container) {
        this.container = container;
    }
    getNodes() {
        return this.nodes;
    }

    addNode(node) {
        node[1] = parseFloat(node[1]);
        this.nodes.push(node);
    }

    removeNode(node) {
        this.nodes = this.nodes.filter(n => n !== node);
    }

    clearNodes() {
        this.nodes = [];
    }
}
export class SpiderManager {
    constructor(container = null, name = 'Spider Manager') {
        this.container = container;
        this.uuid = Math.random().toString(36).substring(7);
        this.name = name;
        this.graphs = [];
        this.selector = document.createElement('select');
        this.selector.id = 'spider_selector_' + this.uuid;
        //Add combined graph option
        const option = document.createElement('option');
        option.text = "Combined Graph (Avg)";
        this.selector.add(option);
        const option2 = document.createElement('option');
        option2.text = "Combined Graph (Overlay)";
        this.selector.add(option2);
        this.selector.onchange = () => {
            const id = this.selector.selectedIndex;
            this.mode = 'normal';
            if (id == 0) {
                const graph = this.getCombinedGraph();
                this.drawGraph(graph);

                return;
            }
            if (id == 1) {
                this.mode = 'overlay';
                this.drawGraph(this.getGraphs());
                return;
            }
            const graph = this.graphs[id - 2];

            this.drawGraph(graph);
        };
        this.container.appendChild(this.selector);

        this.canvas = document.createElement('canvas');
        this.canvas.id = 'spider_canvas_' + this.uuid;
        this.canvas.width = 1000;
        this.canvas.height = 1000;
        this.container.appendChild(this.canvas);
        this.currentGraph = null;
        this.fontSize = 12;
        this.settings = {
            thickness: 2,
            dotSize: 5,
            lineColor: 'black',
            dotColor: 'black',
            textColor: 'black',
            baselineThickness: 1,
            fill: true,
            fillColor: 'rgba(0, 0, 255, 0.3)'
        };
        this.mode = 'normal';
    }
    init() {
        this.drawGraph(this.getCombinedGraph());
        const css = `¨
        #${this.canvas.id}{
            border: 1px solid black;
        }
        #${this.selector.id}{
            margin-bottom: 10px;
        }
        #${this.container.id}{
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        `;
        const style = document.createElement('style');
        style.innerHTML = css;
        document.head.appendChild(style);
    }
    setSettings(settings) {
        this.settings = settings;
    }
    getSettings() {
        return this.settings;
    }
    setCanvasDimensions(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        if (this.currentGraph) {
            this.drawGraph(this.currentGraph);
        }
    }
    setName(name) {
        this.name = name;
    }
    setFontSize(size) {
        this.fontSize = size;
    }
    getName() {
        return this.name;
    }
    getGraphs() {
        return this.graphs;
    }

    addGraph(graph) {
        this.graphs.push(graph);
        const option = document.createElement('option');
        option.text = graph.name;
        this.selector.add(option);
    }

    removeGraph(graph) {
        this.graphs = this.graphs.filter(g => g !== graph);
    }
    getCombinedGraph() {
        const combinedGraph = new SpiderGraph("Combined Graph");
        const nodes = [];
        // Avg the Values
        const graphCount = this.graphs.length;
        const nodeCount = this.graphs[0].getNodes().length;
        const precision = 10;
        for (let i = 0; i < nodeCount; i++) {
            let sum = 0;
            let label = this.graphs[0].getNodes()[i][0];

            for (let j = 0; j < graphCount; j++) {
                sum += parseFloat(this.graphs[j].getNodes()[i][1]);
            }

            nodes.push([label, Math.round((sum / graphCount) * precision) / precision]);
        }
        combinedGraph.nodes = nodes;

        return combinedGraph;
    }
    clearGraphs() {
        this.graphs = [];
    }
    addGraphsFromData(data) {
        const graphs = [];
        for (const i in data) {
            if (i == 0) {
                continue;
            }
            const graph = new SpiderGraph(data[i][0]);

            for (const n in data[i]) {
                if (n == 0) {
                    continue;
                }
                graph.addNode([data[0][n], data[i][n]]);
            }
            graphs.push(graph);
        }
        for (const graph of graphs) {
            this.addGraph(graph);
        }
    }
    drawBase(angle, radius, centerX, centerY, amount, thickness) {
        const ctx = this.canvas.getContext('2d');
        ctx.fillStyle = 'black';
        ctx.beginPath();
        const offsetAngle = -Math.PI / 2; // Rotate to start at the top
        for (let i = 0; i < amount; i++) {
            const x = centerX + Math.cos(offsetAngle + angle * i) * radius;
            const y = centerY + Math.sin(offsetAngle + angle * i) * radius;
            ctx.strokeStyle = 'black';
            ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.lineWidth = thickness + 1;
        ctx.stroke();
        //Draw the inner lines
        for (let i = 0; i < 5; i++) {
            const innerRadius = radius / 5 * (i + 1);
            ctx.beginPath();
            for (let j = 0; j < amount; j++) {
                const x = centerX + Math.cos(offsetAngle + angle * j) * innerRadius;
                const y = centerY + Math.sin(offsetAngle + angle * j) * innerRadius;
                ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.lineWidth = thickness;
            ctx.strokeStyle = 'black';
            ctx.stroke();
        }
        //Draw the center lines
        for (let i = 0; i < amount; i++) {
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            const x = centerX + Math.cos(offsetAngle + angle * i) * radius;
            const y = centerY + Math.sin(offsetAngle + angle * i) * radius;
            ctx.lineTo(x, y);
            ctx.closePath();
            ctx.lineWidth = thickness;
            ctx.strokeStyle = 'black';
            ctx.stroke();
        }
        //Draw the questions
        ctx.font = `${this.fontSize}px Arial`;
        for (let i = 0; i < amount; i++) {
            let textWidth = ctx.measureText(this.currentGraph.getNodes()[i][0]).width;
            let textHeight = this.fontSize;
            const isOnLeft = i < amount / 2;
            const isOnTop = i < amount / 4 || i > amount * 0.75;
            let x = centerX + Math.cos(offsetAngle + angle * i) * radius;
            let y = centerY + Math.sin(offsetAngle + angle * i) * radius;
            let xIsMid = x == centerX;
            let yIsMid = y == centerY;
            if (!xIsMid) {


                if (isOnLeft) {
                    ctx.textAlign = 'right';
                    x += textWidth + this.fontSize;
                } else {
                    ctx.textAlign = 'left';
                    x -= textWidth + this.fontSize;
                }
            } else {
                ctx.textAlign = 'center';
            }
            if (!yIsMid) {
                if (isOnTop) {
                    ctx.textBaseline = 'bottom';
                    y -= textHeight;
                } else {
                    ctx.textBaseline = 'top';
                    y += textHeight;
                }
            } else {
                ctx.textBaseline = 'middle';
            }
            ctx.fillStyle = 'black';
            ctx.fillText(this.currentGraph.getNodes()[i][0], x, y);
        }
        //Draw the name of the graph
        ctx.font = `${this.fontSize * 2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'black';
        const y = centerY - (radius * 1.5);
        ctx.fillText(this.currentGraph.name, centerX,y);

        ctx.closePath();
    }
    //thickness = 2, dotSize = 5, lineColor = 'black', dotColor = 'black', baselineThickness = 1, fill = true, fillColor = 'rgba(0, 0, 255, 0.3)'
    drawGraph(graphs) {
        let thickness = this.settings.thickness;
        let dotSize = this.settings.dotSize;
        let lineColor = this.settings.lineColor;
        let dotColor = this.settings.dotColor;
        let baselineThickness = this.settings.baselineThickness;
        let fill = this.settings.fill;
        let fillColor = this.settings.fillColor;
        if (this.mode == 'normal') {
            graphs = [graphs];
        }
        this.currentGraph = graphs[0];
        const ctx = this.canvas.getContext('2d');
        //Clear the canvas
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const angle = Math.PI * 2 / graphs[0].getNodes().length;
        const radius = (this.canvas.width - (this.canvas.width * 0.1)) / 3;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        this.drawBase(angle, radius, centerX, centerY, graphs[0].getNodes().length, baselineThickness);
        for (const graph of graphs) {
            this.currentGraph = graph
            //Draw the value dots
            ctx.beginPath();
            const offsetAngle = -Math.PI / 2; // Rotate to start at the top
            const nodes = graph.getNodes();
            const positions = []; // Store dot positions

            // First loop: Calculate and store positions
            for (let i = 0; i < nodes.length; i++) {
                const value = parseFloat(nodes[i][1]);
                const normalizedValue = value / 10; // Normalize value
                const x = centerX + Math.cos(offsetAngle + angle * i) * radius * normalizedValue;
                const y = centerY + Math.sin(offsetAngle + angle * i) * radius * normalizedValue;

                positions.push({ x, y });
            }
            // **Fill the shape inside the lines**
            if (fill) {
                ctx.beginPath();
                for (let i = 0; i < positions.length; i++) {
                    const { x, y } = positions[i];
                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
            }
            ctx.closePath();
            ctx.fillStyle = fillColor // Light blue fill with transparency
            ctx.fill();
            // **Draw lines first (under dots)**
            ctx.beginPath();
            ctx.lineJoin = 'round'; // Makes corners smooth and prevents sharp overlaps
            for (let i = 0; i < positions.length; i++) {
                const { x, y } = positions[i];
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath(); // Ensures the shape closes properly
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = thickness;
            ctx.stroke();

            // **Draw dots on top**
            for (let i = 0; i < positions.length; i++) {
                const { x, y } = positions[i];
                ctx.beginPath();
                ctx.arc(x, y, dotSize, 0, Math.PI * 2);
                ctx.fillStyle = dotColor;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}