function updateProgressBar(progressBar, value) {
    value = Math.round(value);
    progressBar.querySelector(".progress__fill").style.width = `${value}%`;
    progressBar.querySelector(".progress_text").textContent = `${value}%`;
}

// Function to start the application and fetch initial data and to run anly one time
async function start() {
    try {   
        const cpuRes0 = await fetch('http://127.0.0.1:3000/cpu');
        const memRes0 = await fetch('http://127.0.0.1:3000/memory');
        const procRes0 = await fetch('http://127.0.0.1:3000/process');
        const diskRes0 = await fetch('http://127.0.0.1:3000/disk');
        
        const cpu0 = await cpuRes0.json();
        const mem0 = await memRes0.json();
        const procList0 = await procRes0.json();
        const disk0 = await diskRes0.json();
  
        const cpu_usage0 = document.querySelector(".usage");
        const memory_usage0 = document.querySelector(".memory_usage");
        const disk_usage0 = document.querySelector(".disk_usage");
        
        document.getElementById('cpu_name').innerText = `Model: ${cpu0.cpu_model}`;
        document.getElementById('cpu_cores').innerText = `Cores: ${cpu0.cpu_cores} `;
        document.getElementById('cpu_threads').innerText = `Threads: ${cpu0.cpu_threads} `;
        document.getElementById('progress_text').innerText = `${cpu0.cpu_percent} %`;
        document.getElementById('cpu_usage').innerText = `CPU Usage: ${cpu0.cpu_percent} %`;
        document.getElementById('cpu_temp').innerText = `Temperature: ${cpu0.cpu_temp} °C`;
        document.getElementById('cpu_load').innerText = `CPU stats: ${JSON.stringify(cpu0.cpu_stats.interrupts)}`;
        document.getElementById('disk_progress_text').innerText = `${disk0.percent} %`;
        document.getElementById('disk').innerText = `Disk Usage: ${disk0.used_gb} GB / ${disk0.total_gb} GB`;
        document.getElementById('memory_progress_text').innerText = `${mem0.percent} %`;
        document.getElementById('memory').innerText = `Memory Usage: ${mem0.used_mb} MB / ${mem0.total_mb} MB`;
        
        // Update progress bars
        updateProgressBar(cpu_usage0, cpu0.cpu_percent);
        updateProgressBar(memory_usage0, mem0.percent);
        updateProgressBar(disk_usage0, disk0.percent);
        
        // Update the process table
        updateProcessTable();
        
        document.getElementById('output').style.display = "none";
    } catch (err) {
        document.getElementById('output').innerText = "Error connecting to backend.";
        document.getElementById('output').style.color = "red";
        console.error(err);
    }
  }
  
  
  // Function to fetch and update system states periodically
  async function getStates() {
      try {
          const cpuRes = await fetch('http://127.0.0.1:3000/cpu');
          const memRes = await fetch('http://127.0.0.1:3000/memory');
          const diskRes = await fetch('http://127.0.0.1:3000/disk');
          
          const cpu = await cpuRes.json();
          const mem = await memRes.json();
          const disk = await diskRes.json();
          
          document.getElementById('progress_text').innerText = `${cpu.cpu_percent} %`;
          document.getElementById('cpu_usage').innerText = `CPU Usage: ${cpu.cpu_percent} %`;
          document.getElementById('cpu_temp').innerText = `Temperature: ${cpu.cpu_temp} °C`;
          document.getElementById('cpu_load').innerText = `CPU interrupts: ${JSON.stringify(cpu.cpu_stats.interrupts)}`;
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

// Process table functionality
let selectedProcess = null;

// Add sorting state
let currentSort = {
    column: null,
    direction: 'asc'
};

// Function to compare values for sorting
function compareValues(a, b, column) {
    // Remove % sign and convert to number for CPU and Memory columns
    if (column === 'cpu_percent' || column === 'memory_percent') {
        return parseFloat(a) - parseFloat(b);
    }
    // Convert to strings for text comparison
    if (typeof a === 'string' && typeof b === 'string') {
        return a.localeCompare(b);
    }
    // Default numeric comparison
    return a - b;
}

// Function to sort processes
function sortProcesses(processes, column, direction) {
    return [...processes].sort((a, b) => {
        let aValue, bValue;

        switch(column) {
            case 'name':
                aValue = a.name || '';
                bValue = b.name || '';
                break;
            case 'pid':
                aValue = a.pid || 0;
                bValue = b.pid || 0;
                break;
            case 'cpu_percent':
                aValue = a.cpu_percent || 0;
                bValue = b.cpu_percent || 0;
                break;
                case 'memory_percent':
                    aValue = (a.memory_mb || 0) / (psutil.virtual_memory().total / 1e6) * 100;
                    bValue = (b.memory_mb || 0) / (psutil.virtual_memory().total / 1e6) * 100;
                break;
                case 'status':
                    aValue = a.status || 'Running';
                    bValue = b.status || 'Running';
                    break;
                    default:
                        return 0;
                    }

                    const comparison = compareValues(aValue, bValue, column);
        return direction === 'asc' ? comparison : -comparison;
    });
}

// Function to update sort indicators
function updateSortIndicators(column) {
    const headers = document.querySelectorAll('.process-table th');
    headers.forEach(header => {
        header.classList.remove('sort-asc', 'sort-desc');
    });

    if (currentSort.column === column) {
        const header = document.querySelector(`.process-table th[data-column="${column}"]`);
        if (header) {
            header.classList.add(currentSort.direction === 'asc' ? 'sort-asc' : 'sort-desc');
        }
    }
}

// Function to update the process table
async function updateProcessTable() {
    const procRes = await fetch('http://127.0.0.1:3000/process'); 
    const processes = await procRes.json();
    // Sort processes if sort is active
    if (currentSort.column) {
        processes = sortProcesses(processes, currentSort.column, currentSort.direction);
    }

    const processList = document.getElementById('process-list');
    processList.innerHTML = '';

    processes.forEach(process => {
        const row = document.createElement('tr');

        // Calculate memory percentage safely
        let memoryPercent = 0;
        try {
            memoryPercent = process.memory_mb ?
                ((process.memory_mb / (psutil.virtual_memory().total / 1e6)) * 100).toFixed(1) :
                0;
        } catch (error) {
            console.warn('Error calculating memory percentage:', error);
        }

        // Format status with color coding
        const status = process.status || 'Running';
        const statusClass = status.toLowerCase() === 'running' ? 'status-running' : 'status-stopped';

        row.innerHTML = `
            <td>${process.name || 'Unknown'}</td>
            <td>${process.pid || 'N/A'}</td>
            <td>${(process.cpu_percent || 0).toFixed(1)}%</td>
            <td>${memoryPercent}%</td>
            <td><span class="process-status ${statusClass}">${status}</span></td>
        `;

        // Add click handler for row selection
        row.addEventListener('click', (e) => {
            // Ignore if clicking on a header
            if (e.target.tagName.toLowerCase() === 'th') return;

            // Remove selection from previously selected row
            const previouslySelected = document.querySelector('.process-table tr.selected');
            if (previouslySelected) {
                previouslySelected.classList.remove('selected');
            }

            // Select current row
            row.classList.add('selected');
            selectedProcess = process;

            // Show end task button
            const endTaskBtn = document.getElementById('end-task-btn');
            endTaskBtn.classList.add('visible');
        });

        processList.appendChild(row);
    });

    // Update sort indicators
    updateSortIndicators(currentSort.column);
}

// Handle end task button click
document.getElementById('end-task-btn').addEventListener('click', async () => {
    if (selectedProcess) {
        try {
            const endTaskBtn = document.getElementById('end-task-btn');
            endTaskBtn.disabled = true;
            endTaskBtn.textContent = 'Ending...';

            // Send request to backend to kill the process
            const response = await fetch('http://127.0.0.1:3000/kill', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ pid: selectedProcess.pid })
            });

            const result = await response.json();

            if (result.success) {
                // Remove the row from the table
                const selectedRow = document.querySelector('.process-table tr.selected');
                if (selectedRow) {
                    selectedRow.remove();
                }

                // Hide the end task button
                endTaskBtn.classList.remove('visible');
                selectedProcess = null;
            } else {
                console.error('Failed to kill process:', result.error);
                alert(`Failed to end task: ${result.error}`);
            }
        } catch (error) {
            console.error('Error killing process:', error);
            alert('Error ending task. Please try again.');
        } finally {
            const endTaskBtn = document.getElementById('end-task-btn');
            endTaskBtn.disabled = false;
            endTaskBtn.textContent = 'End Task';
        }
    }
});

// // Add refresh button functionality
// document.getElementById('refresh-btn').addEventListener('click', async () => {
//     const refreshBtn = document.getElementById('refresh-btn');
//     try {
//         refreshBtn.disabled = true;
//         refreshBtn.style.opacity = '0.7';
//         await getStates();
//     } catch (error) {
//         console.error('Error refreshing data:', error);
//         alert('Error refreshing data. Please try again.');
//     } finally {
//         refreshBtn.disabled = false;
//         refreshBtn.style.opacity = '1';
//     }
// });

start();

// Initialize sort handlers
document.addEventListener('DOMContentLoaded', () => {
    // Add data-column attributes to headers
    const headers = document.querySelectorAll('.process-table th');
    const columns = ['name', 'pid', 'cpu_percent', 'memory_percent', 'status'];

    headers.forEach((header, index) => {
        header.setAttribute('data-column', columns[index]);

        header.addEventListener('click', () => {
            const column = header.getAttribute('data-column');

            // Toggle sort direction if clicking the same column
            if (currentSort.column === column) {
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.column = column;
                currentSort.direction = 'asc';
            }

            // Trigger an immediate update
            getStates();
        });
    });

    // Rest of your DOMContentLoaded code...
    getStates(); // Initial load

    // Add error boundary for periodic updates
    const periodicUpdate = async () => {
        try {
            await getStates();
        } catch (error) {
            console.error('Error in periodic update:', error);
        }
    };

    setInterval(periodicUpdate, 2000); // Update every 2 seconds
});
