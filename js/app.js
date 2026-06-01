let excelData = null;

function processSheet2021(data) {
    const rows = [];
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row[0] && row[0].toString().trim() && 
            !row[0].toString().includes('Городское') && 
            !row[0].toString().includes('Указавшие')) {
            rows.push({
                'Национальность/Язык': row[0]?.toString().trim() || '',
                'Численность': row[1]?.toString() || ''
            });
        }
    }
    return rows;
}

function processSheet1939(data) {
    const rows = [];
    for (let i = 6; i < data.length; i++) {
        const row = data[i];
        if (row[0] && row[0].toString().trim() && 
            !row[0].toString().includes('всего') &&
            row[0].toString().trim() !== 'этнос' &&
            row[0].toString().trim() !== '') {
            rows.push({
                'Национальность': row[0]?.toString().trim() || '',
                'Численность': row[1]?.toString() || '0',
                'Доля': row[2]?.toString() || ''
            });
        }
    }
    return rows;
}

function processSheet1959(data) {
    const rows = [];
    for (let i = 6; i < data.length; i++) {
        const row = data[i];
        if (row[0] && row[0].toString().trim() && 
            !row[0].toString().includes('всего') &&
            row[0].toString().trim() !== 'этнос' &&
            row[0].toString().trim() !== '') {
            rows.push({
                'Национальность': row[0]?.toString().trim() || '',
                'Численность': row[1]?.toString() || '0',
                'Доля': row[2]?.toString() || ''
            });
        }
    }
    return rows;
}

function processSheet1897(data) {
    const rows = [];
    let currentSection = '';
    
    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0) continue;
        
        const firstCell = row[0]?.toString().trim() || '';
        
        if (firstCell === 'Языки') {
            currentSection = 'Языки';
            continue;
        }
        
        if (currentSection === 'Языки' && i > 0 && row[0] && row[1]) {
            const langGroup = row[0]?.toString().trim();
            const langName = row[1]?.toString().trim();
            const countCity = row[2]?.toString();
            const countCounty = row[3]?.toString();
            
            if (langName && langName !== '' && langName !== 'Всего') {
                rows.push({
                    'Группа': langGroup || '',
                    'Язык': langName,
                    'г. Нижний': countCity || '0',
                    'Уезд (без города)': countCounty || '0'
                });
            }
        }
    }
    
    return rows;
}

function calculateTotal2021(data) {
    let total = 0;
    for (const row of data) {
        const num = parseInt(row['Численность']?.replace(/\s/g, ''));
        if (!isNaN(num)) total += num;
    }
    return total.toLocaleString();
}

function findTotalRow(data) {
    const totalRow = data.find(r => r['Национальность'] === 'всего');
    if (totalRow && totalRow['Численность']) {
        return totalRow['Численность'].replace(/\s/g, '');
    }
    return null;
}

function renderTable(data, columns) {
    if (!data || data.length === 0) {
        return `<div class="error">📭 Нет данных для отображения</div>`;
    }
    
    let html = `<table class="data-table">
                <thead>
                    <tr>`;
    for (const col of columns) {
        html += `<th>${col}</th>`;
    }
    html += `</tr>
                </thead>
                <tbody>`;
    
    for (const row of data) {
        html += `<tr>`;
        for (const col of columns) {
            let value = row[col] || '';
            if (value === '0' || value === 0) value = '—';
            html += `<td title="${value}">${value}</td>`;
        }
        html += `</tr>`;
    }
    
    html += `</tbody>
            </table>`;
    
    return html;
}

function updateProgressBar(activeYear) {
    const years = ['1897', '1939', '1959', '2021'];
    const index = years.indexOf(activeYear);
    const progressPercent = (index / (years.length - 1)) * 100;
    const progressBar = document.querySelector('.timeline-progress');
    if (progressBar) {
        progressBar.style.width = `${progressPercent}%`;
    }
}

function displayYear(year) {
    const container = document.getElementById('table-container');
    const infoDiv = document.getElementById('info');
    
    if (!excelData) {
        container.innerHTML = '<div class="loading">⏳ Загрузка данных...</div>';
        return;
    }
    
    let data, columns;
    let infoText = '';
    
    switch(year) {
        case '2021':
            const raw2021 = excelData['2021'] || [];
            data = processSheet2021(raw2021);
            columns = ['Национальность/Язык', 'Численность'];
            const total2021 = calculateTotal2021(data);
            infoText = `📅 2021 год — Всероссийская перепись населения | Всего указавших родной язык: ${total2021} чел.`;
            break;
            
        case '1939':
            const raw1939 = excelData['1939'] || [];
            data = processSheet1939(raw1939);
            columns = ['Национальность', 'Численность', 'Доля'];
            const total1939 = findTotalRow(data);
            if (total1939) {
                infoText = `📅 1939 год — Всесоюзная перепись населения | Всего: ${parseInt(total1939).toLocaleString()} чел.`;
            } else {
                infoText = `📅 1939 год — Всесоюзная перепись населения`;
            }
            break;
            
        case '1959':
            const raw1959 = excelData['1959'] || [];
            data = processSheet1959(raw1959);
            columns = ['Национальность', 'Численность', 'Доля'];
            const total1959 = findTotalRow(data);
            if (total1959) {
                infoText = `📅 1959 год — Всесоюзная перепись населения | Всего: ${parseInt(total1959).toLocaleString()} чел.`;
            } else {
                infoText = `📅 1959 год — Всесоюзная перепись населения`;
            }
            break;
            
        case '1897':
            const raw1897 = excelData['1897'] || [];
            data = processSheet1897(raw1897);
            columns = ['Группа', 'Язык', 'г. Нижний', 'Уезд (без города)'];
            infoText = `📅 1897 год — Первая всеобщая перепись Российской империи | Данные по языкам`;
            break;
            
        default:
            container.innerHTML = '<div class="error">Неизвестный год</div>';
            return;
    }
    
    data = data.filter(row => {
        return Object.values(row).some(v => v && v.toString().trim() !== '');
    });
    
    if (data.length === 0) {
        container.innerHTML = '<div class="error">📭 Нет данных для этого года</div>';
        infoDiv.innerHTML = infoText;
        return;
    }
    
    container.innerHTML = renderTable(data, columns);
    infoDiv.innerHTML = infoText;
    
    const dots = document.querySelectorAll('.timeline-dot');
    for (const dot of dots) {
        if (dot.dataset.year === year) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    }
    
    updateProgressBar(year);
}

async function loadExcel() {
    try {
        const response = await fetch('data/Data_table.xlsx');
        if (!response.ok) {
            throw new Error(`Файл не найден (${response.status})`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        excelData = {};
        for (const sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName];
            excelData[sheetName] = XLSX.utils.sheet_to_json(worksheet, { 
                header: 1, 
                defval: '' 
            });
        }
        
        console.log('✅ Загружены листы:', Object.keys(excelData));
        return true;
        
    } catch (error) {
        console.error('❌ Ошибка загрузки:', error);
        
        const container = document.getElementById('table-container');
        const infoDiv = document.getElementById('info');
        
        container.innerHTML = `
            <div class="error">
                <strong>⚠️ Ошибка загрузки файла Excel</strong><br><br>
                ${error.message}<br><br>
                <strong>Проверь:</strong><br>
                • Файл <code>data/Data_table.xlsx</code> существует<br>
                • Запущен Live Server<br>
                • Открой консоль (F12)
            </div>
        `;
        infoDiv.innerHTML = '❌ Не удалось загрузить данные';
        return false;
    }
}

function setupEventListeners() {
    const dots = document.querySelectorAll('.timeline-dot');
    for (const dot of dots) {
        dot.addEventListener('click', () => {
            displayYear(dot.dataset.year);
        });
    }
}

async function init() {
    const success = await loadExcel();
    if (success) {
        setupEventListeners();
        displayYear('1897');
    }
}

init();