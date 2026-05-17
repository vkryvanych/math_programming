const datasets = {
    '5': [{x:1,y:10.5}, {x:2,y:8.2}, {x:3,y:6.1}, {x:4,y:4.3}, {x:5,y:2.1}],
    '9': [{x:0,y:10}, {x:1,y:8.5}, {x:2,y:7.1}, {x:3,y:5.8}, {x:4,y:4.6}, {x:5,y:3.5}, {x:6,y:2.5}, {x:7,y:1.6}, {x:8,y:0.8}],
    '20': [
        {x:1,y:10}, {x:2,y:9.5}, {x:3,y:8.8}, {x:4,y:7.9}, {x:5,y:6.8}, 
        {x:6,y:5.5}, {x:7,y:4.1}, {x:8,y:2.6}, {x:9,y:1.0}, {x:10,y:-0.6}, 
        {x:11,y:-2.2}, {x:12,y:-3.8}, {x:13,y:-5.3}, {x:14,y:-6.8}, {x:15,y:-8.2}, 
        {x:16,y:-9.5}, {x:17,y:-10.7}, {x:18,y:-11.8}, {x:19,y:-12.8}, {x:20,y:-13.7}
    ]
};

let currentData = [];
let isAnimating = false;
let activeMode = 'all';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const tooltip = document.getElementById('tooltip');

const padding = 60;
let scaleX = 1, scaleY = 1, offsetX = 0, offsetY = 0;

function calculateScale() {
    if (!currentData.length) return;
    const xs = currentData.map(p => p.x);
    const ys = currentData.map(p => p.y);
    const minX = Math.min(...xs, 0); const maxX = Math.max(...xs);
    const minY = Math.min(...ys); const maxY = Math.max(...ys, 12);
    
    scaleX = (canvas.width - padding * 2) / (maxX - minX || 1);
    scaleY = (canvas.height - padding * 2) / (maxY - minY || 1);
    offsetX = -minX * scaleX + padding;
    offsetY = maxY * scaleY + padding;
}

function toScreenX(x) { return x * scaleX + offsetX; }
function toScreenY(y) { return offsetY - y * scaleY; }

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1e293b'; 
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, offsetY); ctx.lineTo(canvas.width, offsetY); 
    ctx.moveTo(toScreenX(0), 0); ctx.lineTo(toScreenX(0), canvas.height); 
    ctx.stroke();
}

function drawPoints(data, activeIndex = -1) {
    data.forEach((p, i) => {
        ctx.beginPath();
        ctx.arc(toScreenX(p.x), toScreenY(p.y), i === activeIndex ? 7 : 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        if (i === activeIndex) {
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    });
}

function renderStatic() {
    if(isAnimating) return;
    drawGrid();
    drawPoints(currentData);
}

document.getElementById('dataset').addEventListener('change', (e) => {
    currentData = datasets[e.target.value];
    calculateScale(); 
    renderStatic();
});