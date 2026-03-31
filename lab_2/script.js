const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const SCALE = 10; 

const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

const ORIGIN_X = 50;
const ORIGIN_Y = CANVAS_HEIGHT - 50;

const DT = 0.05; // крок часу
const G = 9.81;  // прискорення вільного падіння

const drawButton = document.getElementById('drawButton');
const clearButton = document.getElementById('clearButton');
const form = document.getElementById('input-form');

// Елементи для виводу результатів
const resTime = document.getElementById('res-time');
const resHeight = document.getElementById('res-height');
const resDistance = document.getElementById('res-distance');

let animationId;

// Відправлення форми
if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        drawTrajectory();
    });
}

clearButton.addEventListener('click', (e) => {
    e.preventDefault(); 
    clearCanvas();
});

// Очищення полотна
function clearCanvas() {
    cancelAnimationFrame(animationId);
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawGrid(); 
    resTime.textContent = '0.00';
    resHeight.textContent = '0.00';
    resDistance.textContent = '0.00';
}

// Малювання сітки та системи координат 
function drawGrid() {
    ctx.save();
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 0.5;

    // Вертикальні лінії
    for (let x = ORIGIN_X; x <= CANVAS_WIDTH; x += 50) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_HEIGHT); ctx.stroke();
    }
    // Горизонтальні лінії
    for (let y = ORIGIN_Y; y >= 0; y -= 50) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_WIDTH, y); ctx.stroke();
    }

    // Головні осі X та Y
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;

    // Вісь X 
    ctx.beginPath();
    ctx.moveTo(0, ORIGIN_Y);
    ctx.lineTo(CANVAS_WIDTH, ORIGIN_Y);
    ctx.stroke();
    
    // Вісь Y 
    ctx.beginPath();
    ctx.moveTo(ORIGIN_X, 0);
    ctx.lineTo(ORIGIN_X, CANVAS_HEIGHT);
    ctx.stroke();

    // Підписи осей
    ctx.font = '14px Arial';
    ctx.fillStyle = '#333';
    
    ctx.textAlign = 'right';
    ctx.fillText('X (м)', CANVAS_WIDTH - 10, ORIGIN_Y - 10);
    
    ctx.textAlign = 'left';
    ctx.fillText('Y (м)', ORIGIN_X + 10, 20);
    
    // Позначка початку координат
    ctx.fillText('0', ORIGIN_X - 15, ORIGIN_Y + 15);

    ctx.restore();
}

// Перевірка вхідних даних
function validateInputs(speed, angle) {
    if (speed < 0) {
        alert('Початкова швидкість не може бути від\'ємною!');
        return false;
    }
    if (angle < 0 || angle > 90) {
        alert('Кут кидання має бути в межах від 0 до 90 градусів!');
        return false;
    }
    return true;
}

// Розрахунок точок траєкторії та вихідних параметрів
function calculatePoints(angleDeg, speed) {
    const points = [];
    
    // Переведення градусів в радіани
    const angleRad = angleDeg * Math.PI / 180;

    // Розрахунок теоретичних величин
    const tFlight = (2 * speed * Math.sin(angleRad)) / G;
    const hMax = (Math.pow(speed, 2) * Math.pow(Math.sin(angleRad), 2)) / (2 * G);
    const lMax = (Math.pow(speed, 2) * Math.sin(2 * angleRad)) / G;

    // Виведення результатів на екран з округленням до 2 знаків
    resTime.textContent = tFlight.toFixed(2);
    resHeight.textContent = hMax.toFixed(2);
    resDistance.textContent = lMax.toFixed(2);

    // Генерація точок 
    for (let t = 0; t <= tFlight + DT; t += DT) {
        const x = speed * Math.cos(angleRad) * t;
        const y = speed * Math.sin(angleRad) * t - (G * t * t) / 2;
        
        // Перевірка, чи тіло не вийшло за поле
        if (y < 0 && t > 0) {
            points.push({ x: lMax, y: 0 });
            break;
        }
        points.push({ x, y });
    }

    return points;
}

// Переведення метрів у пікселі 
function convertToPixels(x, y) {
    const pixelX = ORIGIN_X + (x * SCALE);
    const pixelY = ORIGIN_Y - (y * SCALE); 
    return { x: pixelX, y: pixelY };
}

// Головна функція, яка отримує дані та викликає анімацію
function drawTrajectory() {
    const speed = parseFloat(document.getElementById('speed').value) || 0;
    const angle = parseFloat(document.getElementById('angle').value) || 0;
    const color = document.getElementById('color').value;

    if(!validateInputs(speed, angle)) {
        return;
    }

    const points = calculatePoints(angle, speed);

    if (points.length > 0) {
        animateTrajectory(points, color);
    }
}

// Функція анімації
function animateTrajectory(points, color) {
    cancelAnimationFrame(animationId); 
    
    let currentIndex = 0;

    // Створення початкової червоної точки
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
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    // Функція для малювання кожного наступного кадру
    function drawNextSegment() {
        if (currentIndex < points.length - 1) {
            const p1 = convertToPixels(points[currentIndex].x, points[currentIndex].y);
            const p2 = convertToPixels(points[currentIndex + 1].x, points[currentIndex + 1].y);

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();

            currentIndex++;
            animationId = requestAnimationFrame(drawNextSegment);
        }
    }
    
    drawNextSegment();
}

drawGrid();