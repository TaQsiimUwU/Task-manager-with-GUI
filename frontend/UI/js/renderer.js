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

// Function to update the process table
async function updateProcessTable() {
    const procRes = await fetch('http://127.0.0.1:3000/process');
    const processes = await procRes.json();

    const processList = document.getElementById('process-list');
    processList.innerHTML = '';

    processes.forEach(process => {
        const row = document.createElement('tr');

        // Calculate memory percentage safely
        let memoryPercent = 0;
        try {
            memoryPercent = process.memory_mb ?
                ((process.memory_mb / (process.memory_mb * 100)) * 100).toFixed(1) :
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

        processList.appendChild(row);
    });
}

start();

document.addEventListener('DOMContentLoaded', () => {
    // Initial load
    getStates();

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
