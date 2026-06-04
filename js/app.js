let excelData = null;
let previousData = {};

function processSheet2021(data) {
    const rows = [];
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row[0] && row[0].toString().trim() && 
            !row[0].toString().includes('Городское') && 
            !row[0].toString().includes('Указавшие')) {
            rows.push({
                'Национальность/Язык': row[0]?.toString().trim() || '',
                'Численность': row[1]?.toString() || '0'
            });
        }
    }
    return rows;
}

function processSheet1939(data) {
    const rows = [];
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row[0] && row[0].toString().trim() && 
            row[0].toString().trim() !== 'Этнос' &&
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
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (row[0] && row[0].toString().trim() && 
            row[0].toString().trim() !== 'Этнос' &&
            row[0].toString().trim() !== 'всего' &&
            row[0].toString().trim() !== 'этнос' &&
            row[0].toString().trim() !== 'указали' &&
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
    const languages = [];
    const foreigners = [];
    const religions = [];
    
    for (let i = 2; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0) continue;
        
        const langGroup = row[0] ? row[0].toString().trim() : '';
        const langName = row[1] ? row[1].toString().trim() : '';
        const langCity = row[2];
        const langCounty = row[3];
        
        const foreignCountry = row[5] ? row[5].toString().trim() : '';
        const foreignCount = row[6];
        
        const religionName = row[8] ? row[8].toString().trim() : '';
        const religionCity = row[9];
        const religionCounty = row[10];
        
        if (langName && langName !== '' && langName !== 'Нижний' && langName !== 'уезд без города') {
            languages.push({
                'Группа': langGroup || '',
                'Язык': langName,
                'г. Нижний': langCity !== undefined && langCity !== '' ? langCity : '0',
                'Уезд (без города)': langCounty !== undefined && langCounty !== '' ? langCounty : '0'
            });
        }
        
        if (foreignCountry && foreignCountry !== '' && foreignCountry !== 'Страна' && foreignCountry !== 'Нижний') {
            foreigners.push({
                'Страна': foreignCountry,
                'г. Нижний': foreignCount !== undefined && foreignCount !== '' ? foreignCount : '0'
            });
        }
        
        if (religionName && religionName !== '' && religionName !== 'Религия' && religionName !== 'Нижний' && religionName !== 'уезд без города') {
            religions.push({
                'Религия': religionName,
                'г. Нижний': religionCity !== undefined && religionCity !== '' ? religionCity : '0',
                'Уезд (без города)': religionCounty !== undefined && religionCounty !== '' ? religionCounty : '0'
            });
        }
    }
    
    return { languages, foreigners, religions };
}

function getEventsHTML(year) {
    const events = {
        '1897': [
            { year: '1552', desc: 'Присоединение Казанского ханства', impact: '📈 Рост русского населения' },
            { year: '1817', desc: 'Перенос ярмарки в Нижний Новгород', impact: '📈 Экономический рост, приток купцов' }
        ],
        '1939': [
            { year: '1920-е', desc: 'Политика Коренизации', impact: '📈 Развитие национальных школ' },
            { year: '1932', desc: 'Строительство завода ГАЗ', impact: '🔄 Массовый приток рабочих' },
            { year: 'середина 1930-х', desc: 'Сворачивание Коренизации, начало Русификации', impact: '📉 Усиление русского языка' }
        ],
        '1959': [
            { year: '1941-1945', desc: 'Великая Отечественная Война', impact: '🔄 Эвакуация заводов в Горький' },
            { year: '1941', desc: 'Миграция беженцев в Горький', impact: '🔄 Резкий рост населения' },
            { year: '1959', desc: 'Статус Закрытого Города', impact: '📉 Ограничение въезда' }
        ],
        '2021': [
            { year: '1960-1980-е', desc: 'Внутренняя миграция из сельских регионов', impact: '🔄 Урбанизация' },
            { year: '1990-е', desc: 'Приток беженцев из зон конфликтов', impact: '🔄 Рост диаспор' },
            { year: '1991', desc: 'Закон РФ "О языках народов РСФСР"', impact: '📈 Возрождение языков' },
            { year: '2000-е', desc: 'Рост трудовых мигрантов', impact: '🔄 Увеличение узбеков, таджиков' }
        ]
    };
    
    const yearEvents = events[year] || [];
    if (yearEvents.length === 0) return '';
    
    let html = '<div class="events-list">';
    for (const event of yearEvents) {
        html += `
            <div class="event-item">
                <span class="event-year">📅 ${event.year}</span>
                <span class="event-desc">${event.desc}</span>
                <span class="event-impact">${event.impact}</span>
            </div>
        `;
    }
    html += '</div>';
    return html;
}

function formatNumber(num) {
    if (num === '—' || num === 0) return '—';
    const n = parseInt(String(num).replace(/\s/g, ''));
    if (isNaN(n)) return num;
    return n.toLocaleString();
}

function getArrow(currentVal, prevVal) {
    if (!prevVal || prevVal === '0' || prevVal === '—') return '';
    const current = parseInt(String(currentVal).replace(/\s/g, '')) || 0;
    const prev = parseInt(String(prevVal).replace(/\s/g, '')) || 0;
    if (prev === 0) return '';
    
    const change = ((current - prev) / prev * 100);
    if (change > 5) return ' <span class="arrow-up">▲▲</span>';
    if (change > 0) return ' <span class="arrow-up">▲</span>';
    if (change < -5) return ' <span class="arrow-down">▼▼</span>';
    if (change < 0) return ' <span class="arrow-down">▼</span>';
    return ' <span class="arrow-equal">●</span>';
}

function saveToPrevious(year, data, idField, valueField) {
    if (!previousData[year]) previousData[year] = {};
    for (const row of data) {
        previousData[year][row[idField]] = row[valueField];
    }
}

function renderTable(data, columns, year, idField, valueField) {
    if (!data || data.length === 0) {
        return `<div class="error">📭 Нет данных для отображения</div>`;
    }
    
    const sortedData = [...data].sort((a, b) => {
        const aVal = parseInt(String(a[valueField]).replace(/\s/g, '')) || 0;
        const bVal = parseInt(String(b[valueField]).replace(/\s/g, '')) || 0;
        return bVal - aVal;
    });
    
    let html = `<table class="data-table">
                <thead>
                    <tr>`;
    for (const col of columns) {
        html += `<th>${col}</th>`;
    }
    html += `</tr>
                </thead>
                <tbody>`;
    
    for (const row of sortedData) {
        const idValue = row[idField];
        let currentValue = row[valueField];
        const prevValue = previousData[year] ? previousData[year][idValue] : null;
        
        let arrow = '';
        if (year !== '1897') {
            arrow = getArrow(currentValue, prevValue);
        }
        
        const formattedValue = formatNumber(currentValue);
        
        html += `<tr>`;
        for (const col of columns) {
            let value = row[col] !== undefined && row[col] !== null ? row[col] : '';
            if (value === '0' || value === 0) value = '—';
            if (col === valueField || (col === 'Численность' && valueField === 'Численность')) {
                html += `<td>${formattedValue}${arrow}</td>`;
            } else {
                html += `<td>${value}</td>`;
            }
        }
        html += `</tr>`;
    }
    
    html += `</tbody>
            </table>`;
    
    saveToPrevious(year, data, idField, valueField);
    
    return html;
}

function renderTable1897(data, type) {
    if (type === 'languages') {
        return renderTable(data.languages, ['Группа', 'Язык', 'г. Нижний', 'Уезд (без города)'], '1897', 'Язык', 'г. Нижний');
    } else if (type === 'foreigners') {
        return renderTable(data.foreigners, ['Страна', 'г. Нижний'], '1897', 'Страна', 'г. Нижний');
    } else if (type === 'religions') {
        return renderTable(data.religions, ['Религия', 'г. Нижний', 'Уезд (без города)'], '1897', 'Религия', 'г. Нижний');
    }
    return '<div class="error">Нет данных</div>';
}

function render1897Tabs(data) {
    const { languages, foreigners, religions } = data;
    
    let tabsHtml = `
        <div class="tabs-1897">
            <button class="tab-btn active" data-tab="languages">🗣️ Языки (${languages.length})</button>
            <button class="tab-btn" data-tab="foreigners">🌍 Иностранцы (${foreigners.length})</button>
            <button class="tab-btn" data-tab="religions">⛪ Религии (${religions.length})</button>
        </div>
        <div class="tab-content active" id="tab-languages">
            ${renderTable1897(data, 'languages')}
        </div>
        <div class="tab-content" id="tab-foreigners">
            ${renderTable1897(data, 'foreigners')}
        </div>
        <div class="tab-content" id="tab-religions">
            ${renderTable1897(data, 'religions')}
        </div>
    `;
    
    setTimeout(() => {
        const btns = document.querySelectorAll('.tab-btn');
        for (const btn of btns) {
            btn.addEventListener('click', function() {
                const tabId = this.dataset.tab;
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                document.getElementById(`tab-${tabId}`).classList.add('active');
            });
        }
    }, 50);
    
    return tabsHtml;
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
    
    let mainContent = '';
    let infoText = '';
    let eventsHTML = getEventsHTML(year);
    
    switch(year) {
        case '2021':
            const raw2021 = excelData['2021'] || [];
            const data2021 = processSheet2021(raw2021);
            const total2021 = data2021.reduce((sum, row) => sum + (parseInt(String(row['Численность']).replace(/\s/g, '')) || 0), 0);
            mainContent = renderTable(data2021, ['Национальность/Язык', 'Численность'], '2021', 'Национальность/Язык', 'Численность');
            infoText = `📅 2021 год — Всероссийская перепись населения | Всего указавших родной язык: ${total2021.toLocaleString()} чел.`;
            break;
            
        case '1939':
            const raw1939 = excelData['1939'] || [];
            let data1939 = processSheet1939(raw1939);
            data1939 = data1939.filter(row => row['Национальность'] && row['Национальность'] !== '' && row['Национальность'] !== 'всего');
            const total1939Row = processSheet1939(raw1939).find(r => r['Национальность'] === 'всего');
            if (total1939Row) {
                infoText = `📅 1939 год — Всесоюзная перепись населения | Всего: ${parseInt(String(total1939Row['Численность']).replace(/\s/g, '')).toLocaleString()} чел.`;
            } else {
                infoText = `📅 1939 год — Всесоюзная перепись населения`;
            }
            mainContent = renderTable(data1939, ['Национальность', 'Численность', 'Доля'], '1939', 'Национальность', 'Численность');
            break;
            
        case '1959':
            const raw1959 = excelData['1959'] || [];
            let data1959 = processSheet1959(raw1959);
            data1959 = data1959.filter(row => row['Национальность'] && row['Национальность'] !== '' && row['Национальность'] !== 'всего');
            const total1959Row = processSheet1959(raw1959).find(r => r['Национальность'] === 'всего');
            if (total1959Row) {
                infoText = `📅 1959 год — Всесоюзная перепись населения | Всего: ${parseInt(String(total1959Row['Численность']).replace(/\s/g, '')).toLocaleString()} чел.`;
            } else {
                infoText = `📅 1959 год — Всесоюзная перепись населения`;
            }
            mainContent = renderTable(data1959, ['Национальность', 'Численность', 'Доля'], '1959', 'Национальность', 'Численность');
            break;
            
        case '1897':
            const raw1897 = excelData['1897'] || [];
            const data1897 = processSheet1897(raw1897);
            mainContent = render1897Tabs(data1897);
            infoText = `📅 1897 год — Первая всеобщая перепись Российской империи | Данные: языки, иностранцы, религии`;
            break;
            
        default:
            container.innerHTML = '<div class="error">Неизвестный год</div>';
            return;
    }
    
    const fullContent = `
        <div class="main-table-wrapper">
            ${mainContent}
        </div>
        ${eventsHTML ? `<div class="events-section">${eventsHTML}</div>` : ''}
    `;
    
    container.innerHTML = fullContent;
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
    if (typeof XLSX === 'undefined') {
        console.error('❌ Библиотека XLSX не загружена!');
        const container = document.getElementById('table-container');
        container.innerHTML = `
            <div class="error">
                <strong>⚠️ Ошибка загрузки библиотеки</strong><br><br>
                Не удалось загрузить XLSX. Проверь интернет-соединение.<br>
                Обнови страницу (F5)
            </div>
        `;
        return false;
    }
    
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