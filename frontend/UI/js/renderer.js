const cpuUsgeURL   = 'http://127.0.0.1:3000/cpu';
const memUsageURL  = 'http://127.0.0.1:3000/memory';
const diskUsageURL = 'http://127.0.0.1:3000/disk';
const processesURL = 'http://127.0.0.1:3000/process'
const cpuUsageURL   = 'http://127.0.0.1:3000/cpu';
const memUsageURL   = 'http://127.0.0.1:3000/memory';
const diskUsageURL  = 'http://127.0.0.1:3000/disk';
const processesURL  = 'http://127.0.0.1:3000/process';

let totalMem = 0;

// State for process table sorting
let processSortState = {
    column: null,
    ascending: true
};

// Update a progress bar element with a value (0-100)
function updateProgressBar(progressBar, value) {
    value = Math.round(value);
    progressBar.querySelector('.progress__fill').style.width = `${value}%`;
    progressBar.querySelector('.progress_text').textContent = `${value}%`;
}

// gets the dynamic states of the system(cpu usage , cpu interrupts , cpu temp , memory usage , disk usage)
async function getDynamicStates() {
    try{
        const cpuUsage = await fetch(cpuUsgeURL);
        const cpu  =  await cpuUsage.json();

        const memUsage = await fetch(memUsageURL);
        const mem  =  await memUsage.json();
        
        const diskUsage = await fetch(diskUsageURL);
        const disk =  await diskUsage.json();

// Fetch and update dynamic system states (CPU, memory, disk)
async function updateDynamicStates() {
    try {
        const [cpuRes, memRes, diskRes] = await Promise.all([
            fetch(cpuUsageURL),
            fetch(memUsageURL),
            fetch(diskUsageURL)
        ]);
        const cpu = await cpuRes.json();
        const mem = await memRes.json();
        const disk = await diskRes.json();
        totalMem = mem.total_mb;

        document.getElementById('progress_text').innerText = `${cpu.cpu_percent} %`;
        document.getElementById('cpu_usage').innerText = `CPU Usage: ${cpu.cpu_percent} %`;
        document.getElementById('cpu_temp').innerText = `Temperature: ${cpu.cpu_temp} °C`;
        document.getElementById('cpu_load').innerText = `CPU stats: ${JSON.stringify(cpu.cpu_stats.interrupts)}`;
        document.getElementById('disk_progress_text').innerText = `${disk.percent} %`;
        document.getElementById('disk').innerText = `Disk Usage: ${disk.used_gb} GB / ${disk.total_gb} GB`;
        document.getElementById('memory_progress_text').innerText = `${mem.percent} %`;
        document.getElementById('memory').innerText = `Memory Usage: ${mem.used_mb} MB / ${mem.total_mb} MB`;

        updateProgressBar(document.querySelector('.usage'), cpu.cpu_percent);
        updateProgressBar(document.querySelector('.memory_usage'), mem.percent);
        updateProgressBar(document.querySelector('.disk_usage'), disk.percent);

        document.getElementById('output').style.display = 'none';
    } catch (err) {
        showError('Error connecting to backend.');
        console.error(err);
    }
}


// gets the static states of the system(cpu model , cpu cores , cpu threads)
async function getstaticStates() {
    try{
        
        const cpuUsage = await fetch(cpuUsgeURL);
        const cpu  =  await cpuUsage.json();

// Fetch and update static system states (CPU model, cores, threads)
async function updateStaticStates() {
    try {
        const cpuRes = await fetch(cpuUsageURL);
        const cpu = await cpuRes.json();
        document.getElementById('cpu_name').innerText = `Model: ${cpu.cpu_model}`;
        document.getElementById('cpu_cores').innerText = `Cores: ${cpu.cpu_cores}`;
        document.getElementById('cpu_threads').innerText = `Threads: ${cpu.cpu_threads}`;
        document.getElementById('output').style.display = 'none';
    } catch (err) {
        showError('Error connecting to backend.');
        console.error(err);
    }
}

async function updateProcess() {
    try{
        const process = await fetch(processesURL);
        const processList = await process.json();

        let processTable = document.getElementById('process-list');
        processTable.innerHTML = "";
        processList.forEach((process) => {
            let row = document.createElement("tr");
            row.innerHTML = `
                <td>${process.name || 'Unknown'}</td>
                <td>${process.pid || 'N/A'}</td>
                <td>${(process.cpu_percent).toFixed(1)}%</td>
                <td>${(process.memory_mb).toFixed(2) || 0} MB</td>
                <td>${process.username}</td>
                <td>
                    <div class="process-controls">
                        <button class="end-task-btn" data-pid="${process.pid}">ENDTASK</button>
                    </div>
                </td>`;
            // Add click event to row (excluding the end-task button)
            row.addEventListener('click', function(event) {
                // Prevent click on the end-task button from triggering this
                if (event.target.closest('.end-task-btn')) return;
                showProcessMoreInfo(process.pid);
            });
            processTable.appendChild(row);
        });

        document.getElementById('output').style.display = "none";
    } catch (err) {
        document.getElementById('output').innerText = "Error connecting to backend.";
        document.getElementById('output').style.color = "red";
        console.error(err);
// Show error message in the output div
function showError(message) {
    const output = document.getElementById('output');
    output.innerText = message;
    output.style.color = 'red';
    output.style.display = '';
}

// Fetch, sort, and render the process list table
async function updateProcessTable() {
    const spinner = document.getElementById('process-loading-spinner');
    const refreshBtn = document.getElementById('refresh-process-btn');
    const processInfoDiv = document.getElementById('process-info');
    if (spinner) spinner.style.display = 'inline-block';
    if (refreshBtn) refreshBtn.disabled = true;
    if (processInfoDiv) processInfoDiv.style.display = 'none';
    try {
        const res = await fetch(processesURL);
        let processList = await res.json();
        // Sort if needed
        if (processSortState.column !== null) {
            processList = sortProcessList(processList, processSortState.column, processSortState.ascending);
        }
        renderProcessTable(processList);
        if (processInfoDiv) processInfoDiv.style.display = '';
        document.getElementById('output').style.display = 'none';
    } catch (err) {
        showError('Error connecting to backend.');
        console.error(err);
    } finally {
        if (spinner) spinner.style.display = 'none';
        if (refreshBtn) refreshBtn.disabled = false;
    }
}

// Render the process table rows
function renderProcessTable(processList) {
    const processTable = document.getElementById('process-list');
    processTable.innerHTML = '';
    processList.forEach(process => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${process.name || 'Unknown'}</td>
            <td>${process.pid || 'N/A'}</td>
            <td>${(process.cpu_percent).toFixed(1)}%</td>
            <td>${(process.memory_mb).toFixed(2) || 0} MB</td>
            <td>${process.username}</td>
            <td>
                <div class="process-controls">
                    <button class="end-task-btn" data-pid="${process.pid}">ENDTASK</button>
                </div>
            </td>
        `;
        // Row click for more info (not on end-task button)
        row.addEventListener('click', function(event) {
            if (event.target.closest('.end-task-btn')) return;
            showProcessMoreInfo(process.pid);
        });
        processTable.appendChild(row);
    });
    // Add event listeners to all ENDTASK buttons
    processTable.querySelectorAll('.end-task-btn').forEach(button => {
        button.addEventListener('click', async (event) => {
            event.stopPropagation();
            const pid = event.target.getAttribute('data-pid');
            if (confirm(`Are you sure you want to terminate the process with PID ${pid}?`)) {
                await killProcess(pid);
            }
        });
    });
    // Enable sorting on table headers
    enableTableSorting();
}

// Sort process list array by column and order
function sortProcessList(list, column, ascending) {
    const keyMap = ['name', 'pid', 'cpu_percent', 'memory_mb', 'username'];
    const key = keyMap[column];
    return list.slice().sort((a, b) => {
        let aVal = a[key];
        let bVal = b[key];
        // Numeric sort for pid, cpu_percent, memory_mb
        if ([1, 2, 3].includes(column)) {
            aVal = parseFloat(aVal) || 0;
            bVal = parseFloat(bVal) || 0;
        } else {
            aVal = (aVal || '').toString().toLowerCase();
            bVal = (bVal || '').toString().toLowerCase();
        }
        if (aVal < bVal) return ascending ? -1 : 1;
        if (aVal > bVal) return ascending ? 1 : -1;
        return 0;
    });
}

// Enable sorting on process table headers
function enableTableSorting() {
    const ths = document.querySelectorAll('.process-table thead th');
    ths.forEach((th, idx) => {
        if (idx < 5) { // Only first 5 columns are sortable
            th.style.cursor = 'pointer';
            th.onclick = function() {
                if (processSortState.column === idx) {
                    processSortState.ascending = !processSortState.ascending;
                } else {
                    processSortState.column = idx;
                    processSortState.ascending = true;
                }
                updateProcessTable();
            };
        }
    });
}

// Filter process table rows by search text
function searchProcesses(searchText) {
    const input = searchText.toLowerCase();
    const rows = document.querySelectorAll('#process-list tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        let found = false;
        cells.forEach(cell => {
            if (cell.innerText.toLowerCase().includes(input)) {
                found = true;
            }
        });
        row.style.display = found ? '' : 'none';
    });
}

// Show more info about a process
async function showProcessMoreInfo(pid) {
    try {
        const response = await fetch(`http://127.0.0.1:3000/processMoreInfo?pid=${pid}`);
        const info = await response.json();
        if (info.error) {
            alert(`Error: ${info.error}`);
            return;
        }
        // Display info (customize as needed)
        alert(JSON.stringify(info, null, 2));
        // Or display in a modal/div for better UX
    } catch (err) {
        alert('Failed to fetch process info.');
        console.error(err);
    }
}

// Send request to kill a process
async function killProcess(pid) {
    try {
        const response = await fetch('http://127.0.0.1:3000/kill', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pid }),
        });
        const result = await response.json();
        if (result.success) {
            alert(`Process with PID ${pid} terminated successfully.`);
            updateProcessTable();
        } else {
            alert(`Failed to terminate process with PID ${pid}: ${result.error}`);
        }
    } catch (err) {
        console.error(err);
        alert(`Error terminating process with PID ${pid}.`);
    }
}

function enableTableSorting() {
    const table = document.getElementById('process-list');
    const headers = table.querySelectorAll('th'); // Select all table headers

    headers.forEach((header, index) => {
        header.addEventListener('click', () => {
            sortProcesses(index); // Call the sort function with the column index
        });
    });
}

function sortProcesses(column) {
    const table = document.getElementById('process-list');
    const rows = Array.from(table.rows).slice(1); // Skip the header row

    rows.sort((a, b) => {
        const aText = a.cells[column].innerText.trim();
        const bText = b.cells[column].innerText.trim();

        // Sort numerically for CPU and Memory columns, otherwise sort alphabetically
        if (column === 2 || column === 3) { // Assuming column 2 is CPU and column 3 is Memory
            return parseFloat(aText) - parseFloat(bText);
        } else {
            return aText.localeCompare(bText);
        }
    });

    rows.forEach(row => table.appendChild(row)); // Re-append sorted rows
}

function searchProcesses(searchText) {
    const input = searchText.toLowerCase();
    const rows = document.querySelectorAll('#process-list tr');

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        let found = false;

        cells.forEach(cell => {
            if (cell.innerText.toLowerCase().includes(input)) {
                found = true;
            }
        });

        row.style.display = found ? '' : 'none';
    });
}

async function showProcessMoreInfo(pid) {
    try {
        const response = await fetch(`http://127.0.0.1:3000/processMoreInfo?pid=${pid}`);
        const info = await response.json();
        if (info.error) {
            alert(`Error: ${info.error}`);
            return;
        }
        // Display the info (customize as needed)
        alert(JSON.stringify(info, null, 2));
        // Or, you can display it in a modal or a div for better UX
    } catch (err) {
        alert('Failed to fetch process info.');
        console.error(err);
    }
}

// Initial calls
getDynamicStates();
getstaticStates();

// Update states every second
setInterval(() => { getDynamicStates();}, 1000);
updateProcess();

getstaticStates();
enableTableSorting();
// Initial calls
updateDynamicStates();
updateStaticStates();
updateProcessTable();

// Periodic updates
setInterval(updateDynamicStates, 1000);
setInterval(updateStaticStates, 60000); // Update static info every minute

// Optionally, hook up search input (if present)
const searchInput = document.getElementById('process-search-input');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        searchProcesses(e.target.value);
    });
}
