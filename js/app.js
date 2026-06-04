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

function calculateTotal2021(data) {
    let total = 0;
    for (const row of data) {
        const num = parseInt(row['Численность']?.toString().replace(/\s/g, ''));
        if (!isNaN(num)) total += num;
    }
    return total.toLocaleString();
}

function findTotalRow1939(data) {
    const totalRow = data.find(r => r['Национальность'] === 'всего');
    if (totalRow && totalRow['Численность']) {
        return totalRow['Численность'].toString().replace(/\s/g, '');
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
            let value = row[col] !== undefined && row[col] !== null ? row[col] : '';
            if (value === 0 || value === '0') value = '—';
            html += `<td>${value}</td>`;
        }
        html += `</tr>`;
    }
    
    html += `</tbody>
            </table>`;
    
    return html;
}

function render1897Tabs(data) {
    const { languages, foreigners, religions } = data;
    
    let tabsHtml = `
        <div class="tabs-1897">
            <button class="tab-btn active" data-tab="languages">🗣️ Языки</button>
            <button class="tab-btn" data-tab="foreigners">🌍 Иностранцы</button>
            <button class="tab-btn" data-tab="religions">⛪ Религии</button>
        </div>
        <div class="tab-content active" id="tab-languages">
            ${renderTable(languages, ['Группа', 'Язык', 'г. Нижний', 'Уезд (без города)'])}
        </div>
        <div class="tab-content" id="tab-foreigners">
            ${renderTable(foreigners, ['Страна', 'г. Нижний'])}
        </div>
        <div class="tab-content" id="tab-religions">
            ${renderTable(religions, ['Религия', 'г. Нижний', 'Уезд (без города)'])}
        </div>
    `;
    
    setTimeout(() => {
        const tabs = document.querySelectorAll('.tab-btn');
        for (const tab of tabs) {
            tab.addEventListener('click', function() {
                const tabId = this.dataset.tab;
                document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                document.getElementById(`tab-${tabId}`).classList.add('active');
            });
        }
    }, 0);
    
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
    
    let infoText = '';
    
    switch(year) {
        case '2021':
            const raw2021 = excelData['2021'] || [];
            const data2021 = processSheet2021(raw2021);
            const total2021 = calculateTotal2021(data2021);
            container.innerHTML = renderTable(data2021, ['Национальность/Язык', 'Численность']);
            infoText = `📅 2021 год — Всероссийская перепись населения | Всего указавших родной язык: ${total2021} чел.`;
            break;
            
        case '1939':
            const raw1939 = excelData['1939'] || [];
            let data1939 = processSheet1939(raw1939);
            data1939 = data1939.filter(row => row['Национальность'] && row['Национальность'] !== '');
            const total1939 = findTotalRow1939(data1939);
            if (total1939) {
                infoText = `📅 1939 год — Всесоюзная перепись населения | Всего: ${parseInt(total1939).toLocaleString()} чел.`;
            } else {
                infoText = `📅 1939 год — Всесоюзная перепись населения`;
            }
            container.innerHTML = renderTable(data1939, ['Национальность', 'Численность', 'Доля']);
            break;
            
        case '1959':
            const raw1959 = excelData['1959'] || [];
            let data1959 = processSheet1959(raw1959);
            data1959 = data1959.filter(row => row['Национальность'] && row['Национальность'] !== '');
            const total1959Row = data1959.find(r => r['Национальность'] === 'всего');
            if (total1959Row) {
                infoText = `📅 1959 год — Всесоюзная перепись населения | Всего: ${parseInt(total1959Row['Численность']).toLocaleString()} чел.`;
            } else {
                infoText = `📅 1959 год — Всесоюзная перепись населения`;
            }
            container.innerHTML = renderTable(data1959, ['Национальность', 'Численность', 'Доля']);
            break;
            
        case '1897':
            const raw1897 = excelData['1897'] || [];
            const data1897 = processSheet1897(raw1897);
            container.innerHTML = render1897Tabs(data1897);
            infoText = `📅 1897 год — Первая всеобщая перепись Российской империи | Данные: языки, иностранцы, религии`;
            break;
            
        default:
            container.innerHTML = '<div class="error">Неизвестный год</div>';
            return;
    }
    
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




function getEventsForYear(year) {
    const events = {
        '1897': [
            { year: '1552', desc: 'Присоединение Казанского ханства' },
            { year: '1817', desc: 'Перенос ярмарки в Нижний Новгород' }
        ],
        '1939': [
            { year: '1920-е', desc: 'Политика коренизации' },
            { year: '1932', desc: 'Строительство завода ГАЗ (Первая пятилетка)' },
            { year: 'середина 1930-х', desc: 'Сворачивание политики коренизации, начало политики русификации' }
        ],
        '1959': [
            { year: '1941-1945', desc: 'Великая Отечественная война' },
            { year: '1941', desc: 'Миграция беженцев из оккупированных регионов в Горький' },
            { year: '1959', desc: 'Статус закрытого города' }
        ],
        '2021': [
            { year: '1960-1980-е', desc: 'Внутренняя миграция из сельских регионов' },
            { year: '1990-е', desc: 'Приток беженцев из зон межэтнических конфликтов (Нагорный Карабах, Приднестровье, Абхазия, Чечня)' },
            { year: '1991', desc: 'Закон РФ "О языках народов РСФСР"' },
            { year: '2000-е', desc: 'Рост количества трудовых мигрантов' }
        ]
    };
    return events[year] || [];
}

function renderEvents(year) {
    const events = getEventsForYear(year);
    if (events.length === 0) {
        return '<div class="events-list"><div class="error">📭 Нет исторических событий для этого периода</div></div>';
    }
    
    let html = '<div class="events-list">';
    for (const event of events) {
        html += `
            <div class="event-item">
                <span class="event-year">📅 ${event.year}</span>
                <span class="event-desc">${event.desc}</span>
            </div>
        `;
    }
    html += '</div>';
    return html;
}

function updateEventsTab(year) {
    const eventsContainer = document.getElementById('events-container');
    if (eventsContainer) {
        eventsContainer.innerHTML = renderEvents(year);
    }
}

function setupMainTabs() {
    const tabs = document.querySelectorAll('.main-tab-btn');
    for (const tab of tabs) {
        tab.addEventListener('click', function() {
            const tabId = this.dataset.mainTab;
            document.querySelectorAll('.main-tab-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('.main-tab-content').forEach(content => content.classList.remove('active'));
            if (tabId === 'data') {
                document.getElementById('data-tab').classList.add('active');
            } else {
                document.getElementById('events-tab').classList.add('active');
                const currentYear = document.querySelector('.timeline-dot.active')?.dataset.year || '1897';
                updateEventsTab(currentYear);
            }
        });
    }
}

const originalDisplayYear = displayYear;
displayYear = function(year) {
    originalDisplayYear(year);
    updateEventsTab(year);
};

if (typeof init === 'function') {
    const originalInit = init;
    init = async function() {
        await originalInit();
        setupMainTabs();
        updateEventsTab('1897');
    };
}

init();