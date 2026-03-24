const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const SCALE = 4;

const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;
const CENTER_X = CANVAS_WIDTH / 2;
const CENTER_Y = CANVAS_HEIGHT / 2;

const DT = 0.1; // крок часу
const T_MAX = 10; // максимальний час моделювання

const drawButton = document.getElementById('drawButton');
const clearButton = document.getElementById('clearButton');
const form = document.getElementById('input-form');

// Відправлення форми
if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        drawTrajectory();
    });
}

// Запобігання стандартній поведінці кнопок
drawButton.addEventListener('click', (e) => {
    e.preventDefault(); 
    drawTrajectory();
});

clearButton.addEventListener('click', (e) => {
    e.preventDefault(); 
    clearCanvas();
});

// Очищення полотна
function clearCanvas() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawGrid(); 
}

// Малювання сітки та системи координат 
function drawGrid() {
    ctx.save();
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 0.5;

    for (let x = 0; x <= CANVAS_WIDTH / 2; x += 50) {
        ctx.beginPath(); ctx.moveTo(CENTER_X + x, 0); ctx.lineTo(CENTER_X + x, CANVAS_HEIGHT); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(CENTER_X - x, 0); ctx.lineTo(CENTER_X - x, CANVAS_HEIGHT); ctx.stroke();
    }

    for (let y = 0; y <= CANVAS_HEIGHT / 2; y += 50) {
        ctx.beginPath(); ctx.moveTo(0, CENTER_Y + y); ctx.lineTo(CANVAS_WIDTH, CENTER_Y + y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, CENTER_Y - y); ctx.lineTo(CANVAS_WIDTH, CENTER_Y - y); ctx.stroke();
    }

    // Головні осі X та Y
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;

    // Вісь X 
    ctx.beginPath();
    ctx.moveTo(0, CENTER_Y);
    ctx.lineTo(CANVAS_WIDTH, CENTER_Y);
    ctx.stroke();
    
    // Вісь Y 
    ctx.beginPath();
    ctx.moveTo(CENTER_X, 0);
    ctx.lineTo(CENTER_X, CANVAS_HEIGHT);
    ctx.stroke();

    // Підписи осей
    ctx.font = '12px Arial';
    ctx.fillStyle = '#333';
    
    // Підпис X
    ctx.textAlign = 'right';
    ctx.fillText('X (м)', CANVAS_WIDTH - 10, CENTER_Y - 10);
    
    // Підпис Y
    ctx.textAlign = 'left';
    ctx.fillText('Y (м)', CENTER_X + 10, 20);

    ctx.restore();
}

// Перевірка вхідних даних
function validateInputs(speed) {
    if (speed < 0) {
        alert('Початкова швидкість не може бути від\'ємною!');
        return false;
    }
    return true;
}

// Розрахунок точок траєкторії
function calculatePoints(x0, y0, angleDeg, speed, acceleration) {
    const points = [];

    // Переведення градусів в радіани
    const angleRad = angleDeg * Math.PI / 180;

    // Розклад векторів на компоненти 
    const v0x = speed * Math.cos(angleRad);
    const v0y = speed * Math.sin(angleRad);
    
    const ax = acceleration * Math.cos(angleRad);
    const ay = acceleration * Math.sin(angleRad);

    // Генерація точок з кроком DT
    for (let t = 0; t <= T_MAX; t += DT) {
        const x = x0 + v0x * t + (ax * t * t) / 2;
        const y = y0 + v0y * t + (ay * t * t) / 2;
        points.push({ x, y, t });
    }

    return points;
}

// Переведення у пікселі 
function convertToPixels(x, y) {
    const pixelX = CENTER_X + (x * SCALE);
    const pixelY = CENTER_Y - (y * SCALE); 
    return { x: pixelX, y: pixelY };
}

// Побудова траєкторії
function drawTrajectory() {

    const x0 = parseFloat(document.getElementById('x0').value) || 0;
    const y0 = parseFloat(document.getElementById('y0').value) || 0;
    let angle = parseFloat(document.getElementById('angle').value) || 0;
    const speed = parseFloat(document.getElementById('speed').value) || 0;
    const acceleration = parseFloat(document.getElementById('acceleration').value) || 0;
    const color = document.getElementById('color').value;

    
    angle = ((angle % 360) + 360) % 360;

    if(!validateInputs(speed)) {
        return;
    }

    // Розрахунок точок
    const points = calculatePoints(x0, y0, angle, speed, acceleration);

    // Конвертація точок та визначення траєкторії
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    
    // Штрих-пунктирна лінія
    ctx.setLineDash([10, 5, 3, 5]); 

    points.forEach((point, index) => {
        const pixel = convertToPixels(point.x, point.y);
        
        if (index === 0) {
            ctx.moveTo(pixel.x, pixel.y);
        } else {
            ctx.lineTo(pixel.x, pixel.y);
        }
    });
    
    ctx.stroke();
    ctx.setLineDash([]);

    // Створення початкової червоної точки
    if (points.length > 0) {
        const startPixel = convertToPixels(points[0].x, points[0].y);
        
        ctx.beginPath();
        ctx.fillStyle = 'red';
        ctx.arc(startPixel.x, startPixel.y, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.arc(startPixel.x, startPixel.y, 5, 0, 2 * Math.PI);
        ctx.stroke();
    }
}

drawGrid();