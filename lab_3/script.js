const W = 30; 
const n = 9; 
const weights = [2, 2, 3, 5, 4, 10, 4, 4, 6]; 
const values = [13, 3, 15, 6, 2, 12, 6, 5, 11];

const summaryBody = document.getElementById('summary-body');
const tableContainer = document.getElementById('table-container');

// Функція очищення екрану
document.getElementById('btn-clear').addEventListener('click', () => {
    summaryBody.innerHTML = '';
    tableContainer.innerHTML = '';
});

// Функція для додавання рядка з результатом у таблицю
function addResultRow(methodName, maxV, weight, items, time) {
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><strong>${methodName}</strong></td>
        <td>${maxV}</td>
        <td>${weight} / ${W}</td>
        <td>[${items.join(', ')}]</td>
        <td>${time.toFixed(4)}</td>
    `;
    summaryBody.appendChild(row);
}

// Функція для штучної затримки
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 1. Метод грубої сили
function bruteForceKnapsack() {
    let maxV = 0; 
    let bestWeight = 0; 
    let bestCombination = [];
    const totalCombinations = Math.pow(2, n); 
    
    for (let i = 0; i < totalCombinations; i++) {
        let currentW = 0; 
        let currentV = 0; 
        let currentCombo = [];
        
        for (let j = 0; j < n; j++) {
            if ((i & (1 << j)) !== 0) { 
                currentW += weights[j]; 
                currentV += values[j]; 
                currentCombo.push(j + 1); 
            }
        }
        
        if (currentW <= W && currentV > maxV) {
            maxV = currentV; 
            bestWeight = currentW; 
            bestCombination = currentCombo;
        }
    }
    return { totalV: maxV, currentW: bestWeight, selectedItems: bestCombination };
}

// 2. Жадібний алгоритм
function greedyKnapsack() {
    let items = [];
    for (let i = 0; i < n; i++) {
        items.push({ id: i + 1, w: weights[i], v: values[i], ratio: values[i] / weights[i] });
    }
    
    items.sort((a, b) => b.ratio - a.ratio);
    
    let currentW = 0; 
    let totalV = 0; 
    let selectedItems = [];
    
    for (let i = 0; i < n; i++) {
        if (currentW + items[i].w <= W) {
            currentW += items[i].w; 
            totalV += items[i].v; 
            selectedItems.push(items[i].id);
        }
    }
    return { totalV, currentW, selectedItems };
}

// 3. Рекурсивний метод
function recursiveKnapsack() {
    let bestV = 0; 
    let bestW = 0; 
    let bestItems = [];
    
    function solve(i, currentW, currentV, currentItems) {
        if (i === n || currentW === W) {
            if (currentV > bestV) { 
                bestV = currentV; 
                bestW = currentW; 
                bestItems = [...currentItems]; 
            }
            return;
        }
        
        solve(i + 1, currentW, currentV, currentItems);
        
        if (currentW + weights[i] <= W) {
            currentItems.push(i + 1); 
            solve(i + 1, currentW + weights[i], currentV + values[i], currentItems);
            currentItems.pop(); 
        }
    }
    
    solve(0, 0, 0, []);
    return { totalV: bestV, currentW: bestW, selectedItems: bestItems };
}

// 4. Метод гілок і меж
function bnbKnapsack() {
    let items = [];
    for (let i = 0; i < n; i++) {
        items.push({ id: i + 1, w: weights[i], v: values[i], ratio: values[i] / weights[i] });
    }
    items.sort((a, b) => b.ratio - a.ratio);
    
    let maxV = 0; 
    let bestW = 0; 
    let bestItems = [];

    function getBound(i, currentW, currentV) {
        if (currentW >= W) return 0;
        let profitBound = currentV; 
        let j = i; 
        let totWeight = currentW;
        
        while (j < n && totWeight + items[j].w <= W) {
            totWeight += items[j].w; 
            profitBound += items[j].v; 
            j++;
        }
        if (j < n) profitBound += (W - totWeight) * items[j].ratio;
        return profitBound;
    }

    function dfs(i, currentW, currentV, currentItems) {
        if (currentW <= W && currentV > maxV) { 
            maxV = currentV; 
            bestW = currentW; 
            bestItems = [...currentItems]; 
        }
        if (i === n) return;
        if (getBound(i, currentW, currentV) <= maxV) return; 
        
        if (currentW + items[i].w <= W) {
            currentItems.push(items[i].id);
            dfs(i + 1, currentW + items[i].w, currentV + items[i].v, currentItems);
            currentItems.pop();
        }
        dfs(i + 1, currentW, currentV, currentItems);
    }
    
    dfs(0, 0, 0, []);
    bestItems.sort((a, b) => a - b);
    return { totalV: maxV, currentW: bestW, selectedItems: bestItems };
}

// 5. Динамічне програмування
async function dpKnapsackAnimated() {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(btn => btn.disabled = true);

    tableContainer.innerHTML = '';
    
    const table = document.createElement('table');
    const tbody = document.createElement('tbody');
    
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const thEmpty = document.createElement('th');
    thEmpty.innerText = 'Предмет \\ Вага (w)';
    headerRow.appendChild(thEmpty);
    
    for (let w = 0; w <= W; w++) {
        const th = document.createElement('th');
        th.innerText = w;
        headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    let dp = Array(n + 1).fill().map(() => Array(W + 1).fill(0));
    let cells = Array(n + 1).fill().map(() => Array(W + 1).fill(null));

    for (let i = 0; i <= n; i++) {
        const tr = document.createElement('tr');
        const th = document.createElement('th');
        th.innerText = i === 0 ? '0' : `Предмет ${i}\n(w:${weights[i-1]}, v:${values[i-1]})`;
        tr.appendChild(th);

        for (let w = 0; w <= W; w++) {
            const td = document.createElement('td');
            td.innerText = ''; 
            tr.appendChild(td);
            cells[i][w] = td;
        }
        tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    tableContainer.appendChild(table);

    const t0 = performance.now();
    let pureDP = Array(n + 1).fill().map(() => Array(W + 1).fill(0));
    for (let i = 1; i <= n; i++) {
        for (let w = 1; w <= W; w++) {
            if (weights[i - 1] <= w) {
                pureDP[i][w] = Math.max(pureDP[i - 1][w], pureDP[i - 1][w - weights[i - 1]] + values[i - 1]);
            } else {
                pureDP[i][w] = pureDP[i - 1][w];
            }
        }
    }
    const t1 = performance.now();
    const execTime = t1 - t0;

    for (let i = 0; i <= n; i++) {
        for (let w = 0; w <= W; w++) {
            cells[i][w].classList.add('active-cell');
            
            if (i === 0 || w === 0) {
                dp[i][w] = 0;
            } else if (weights[i - 1] <= w) {
                dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - weights[i - 1]] + values[i - 1]);
            } else {
                dp[i][w] = dp[i - 1][w];
            }
            
            cells[i][w].innerText = dp[i][w];
            await sleep(10); 
            cells[i][w].classList.remove('active-cell');
        }
    }

    let resW = W;
    let selectedItems = [];
    let currentWeight = 0;

    for (let i = n; i > 0 && resW > 0; i--) {
        if (dp[i][resW] !== dp[i - 1][resW]) {
            selectedItems.push(i);
            currentWeight += weights[i - 1];
            
            cells[i][resW].style.backgroundColor = '#4caf50';
            cells[i][resW].style.color = 'white';
            cells[i][resW].style.fontWeight = 'bold';
            await sleep(100); 

            resW -= weights[i - 1];
        }
    }
    selectedItems.sort((a, b) => a - b);

    buttons.forEach(btn => btn.disabled = false);

    addResultRow('Динамічне програмування', dp[n][W], currentWeight, selectedItems, execTime);
}

// Обробники кнопок
document.getElementById('btn-brute').addEventListener('click', () => {
    const t0 = performance.now(); 
    const res = bruteForceKnapsack(); 
    const t1 = performance.now();
    addResultRow('Метод перебору', res.totalV, res.currentW, res.selectedItems, t1 - t0);
});

document.getElementById('btn-greedy').addEventListener('click', () => {
    const t0 = performance.now(); 
    const res = greedyKnapsack(); 
    const t1 = performance.now();
    addResultRow('Жадібний алгоритм', res.totalV, res.currentW, res.selectedItems, t1 - t0);
});

document.getElementById('btn-recursive').addEventListener('click', () => {
    const t0 = performance.now(); 
    const res = recursiveKnapsack(); 
    const t1 = performance.now();
    addResultRow('Рекурсивний метод', res.totalV, res.currentW, res.selectedItems, t1 - t0);
});

document.getElementById('btn-bnb').addEventListener('click', () => {
    const t0 = performance.now(); 
    const res = bnbKnapsack(); 
    const t1 = performance.now();
    addResultRow('Метод гілок і меж', res.totalV, res.currentW, res.selectedItems, t1 - t0);
});

document.getElementById('btn-dp').addEventListener('click', () => {
    dpKnapsackAnimated();
});