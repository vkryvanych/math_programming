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
let mnkCoeffs = [];
let activeMode = 'all';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

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
    });
}

// Математичне ядро Лагранжа
function lagrange(x, data) {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
        let p = 1;
        for (let j = 0; j < data.length; j++) {
            if (i !== j) p *= (x - data[j].x) / (data[i].x - data[j].x);
        }
        sum += data[i].y * p;
    }
    return sum;
}

// Математика МНК
function solveGauss(A, B) {
    let n = A.length;
    for (let i = 0; i < n; i++) {
        let maxEl = Math.abs(A[i][i]), maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(A[k][i]) > maxEl) { maxEl = Math.abs(A[k][i]); maxRow = k; }
        }
        for (let k = i; k < n; k++) {
            let tmp = A[maxRow][k]; A[maxRow][k] = A[i][k]; A[i][k] = tmp;
        }
        let tmp = B[maxRow]; B[maxRow] = B[i]; B[i] = tmp;
        for (let k = i + 1; k < n; k++) {
            let c = -A[k][i] / A[i][i];
            for (let j = i; j < n; j++) { if (i === j) { A[k][j] = 0; } else { A[k][j] += c * A[i][j]; } }
            B[k] += c * B[i];
        }
    }
    let x = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        x[i] = B[i] / A[i][i];
        for (let k = i - 1; k >= 0; k--) { B[k] -= A[k][i] * x[i]; }
    }
    return x;
}

function calculateMNK(data, m = 3) {
    let X = Array(m + 1).fill(0).map(() => Array(m + 1).fill(0));
    let Y = Array(m + 1).fill(0);
    for (let i = 0; i <= m; i++) {
        for (let j = 0; j <= m; j++) {
            X[i][j] = data.reduce((sum, p) => sum + Math.pow(p.x, i + j), 0);
        }
        Y[i] = data.reduce((sum, p) => sum + p.y * Math.pow(p.x, i), 0);
    }
    return solveGauss(X, Y);
}

function mnkValue(x, coeffs) {
    return coeffs.reduce((sum, c, i) => sum + c * Math.pow(x, i), 0);
}

function drawCurve(func, color) {
    if (!currentData.length) return;
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    const minX = currentData[0].x;
    const maxX = currentData[currentData.length - 1].x;
    for (let x = minX; x <= maxX; x += 0.05) {
        let sx = toScreenX(x), sy = toScreenY(func(x));
        if (x === minX) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
}

function renderStatic() {
    if(isAnimating) return;
    drawGrid();
    if (activeMode === 'all' || activeMode === 'lagrange') {
        drawCurve(x => lagrange(x, currentData), '#3b82f6');
    }
    if (activeMode === 'all' || activeMode === 'mnk') {
        if(!mnkCoeffs.length) mnkCoeffs = calculateMNK(currentData, 3);
        drawCurve(x => mnkValue(x, mnkCoeffs), '#b537f2');
    }
    drawPoints(currentData);
}

document.getElementById('dataset').addEventListener('change', (e) => {
    currentData = datasets[e.target.value];
    mnkCoeffs = []; calculateScale(); renderStatic();
});

document.querySelectorAll('input[name="mode"]').forEach(r => r.addEventListener('change', (e) => {
    activeMode = e.target.value;
    renderStatic();
}));