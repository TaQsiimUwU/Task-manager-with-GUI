const cpuUsgeURL   = 'http://127.0.0.1:3000/cpu';
const memUsageURL  = 'http://127.0.0.1:3000/memory';
const diskUsageURL = 'http://127.0.0.1:3000/disk';
const processesURL = 'http://127.0.0.1:3000/process'

let totalMem = 0;

// update progress bars(cpu usage , memory usage , disk usage)
function updateProgressBar(progressBar, value) {
    value = Math.round(value);
    progressBar.querySelector(".progress__fill").style.width = `${value}%`;
    progressBar.querySelector(".progress_text").textContent = `${value}%`;
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

        totalMem = mem.total_mb;

        document.getElementById('progress_text').innerText = `${cpu.cpu_percent} %`;
        document.getElementById('cpu_usage').innerText = `CPU Usage: ${cpu.cpu_percent} %`;
        document.getElementById('cpu_temp').innerText = `Temperature: ${cpu.cpu_temp} °C`;
        document.getElementById('cpu_load').innerText = `CPU stats: ${JSON.stringify(cpu.cpu_stats.interrupts)}`;
        document.getElementById('disk_progress_text').innerText = `${disk.percent} %`;
        document.getElementById('disk').innerText = `Disk Usage: ${disk.used_gb} GB / ${disk.total_gb} GB`;
        document.getElementById('memory_progress_text').innerText = `${mem.percent} %`;
        document.getElementById('memory').innerText = `Memory Usage: ${mem.used_mb} MB / ${mem.total_mb} MB`;

        const cpu_usage = document.querySelector(".usage");
        const memory_usage = document.querySelector(".memory_usage");
        const disk_usage = document.querySelector(".disk_usage");

        updateProgressBar(cpu_usage, cpu.cpu_percent);
        updateProgressBar(memory_usage, mem.percent);
        updateProgressBar(disk_usage, disk.percent);

        document.getElementById('output').style.display = "none";
    } catch (err) {
        document.getElementById('output').innerText = "Error connecting to backend.";
        document.getElementById('output').style.color = "red";
        console.error(err);
    }
}


// gets the static states of the system(cpu model , cpu cores , cpu threads)
async function getstaticStates() {
    try{

        const cpuUsage = await fetch(cpuUsgeURL);
        const cpu  =  await cpuUsage.json();

        document.getElementById('cpu_name').innerText = `Model: ${cpu.cpu_model}`;
        document.getElementById('cpu_cores').innerText = `Cores: ${cpu.cpu_cores} `;
        document.getElementById('cpu_threads').innerText = `Threads: ${cpu.cpu_threads} `;

        document.getElementById('output').style.display = "none";
    } catch (err) {
        document.getElementById('output').innerText = "Error connecting to backend.";
        document.getElementById('output').style.color = "red";
        console.error(err);
    }
}

async function updateProcess() {
    try {
        const process = await fetch(processesURL);
        const processList = await process.json();

        let processTable = document.getElementById('process-list');
        processTable.innerHTML = ""; // Clear the table before adding rows

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
            processTable.appendChild(row);
        });

        // Add event listeners to all "ENDTASK" buttons
        const endTaskButtons = document.querySelectorAll('.end-task-btn');
        endTaskButtons.forEach(button => {
            button.addEventListener('click', async (event) => {
                const pid = event.target.getAttribute('data-pid');
                if (confirm(`Are you sure you want to terminate the process with PID ${pid}?`)) {
                    await killProcess(pid);
                }
            });
        });

        document.getElementById('output').style.display = "none";
    } catch (err) {
        document.getElementById('output').innerText = "Error connecting to backend.";
        document.getElementById('output').style.color = "red";
        console.error(err);
    }
}

// Function to send a request to kill a process
async function killProcess(pid) {
    try {
        const response = await fetch('http://127.0.0.1:3000/kill', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pid }),
        });

        const result = await response.json();
        if (result.success) {
            alert(`Process with PID ${pid} terminated successfully.`);
            updateProcess(); // Refresh the process list
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




// Initial calls
getDynamicStates();
getstaticStates();

// Update states every second
setInterval(() => { getDynamicStates(); }, 1000);
updateProcess();


getstaticStates();
enableTableSorting();
