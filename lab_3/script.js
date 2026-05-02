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