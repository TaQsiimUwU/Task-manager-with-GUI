// URLs for backend endpoints
const API = {
    cpu: 'http://127.0.0.1:3000/cpu',
    memory: 'http://127.0.0.1:3000/memory',
    disk: 'http://127.0.0.1:3000/disk',
    processes: 'http://127.0.0.1:3000/process',
    processMoreInfo: pid => `http://127.0.0.1:3000/processMoreInfo?pid=${pid}`,
    kill: 'http://127.0.0.1:3000/kill',
};

let totalMem = 0;
let processSortState = { column: null, ascending: true };

// Generic fetch helper with error handling
const fetchJSON = async (url, options = {}) => {
    try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (err) {
        showError('Error connecting to backend.');
        console.error(err);
        throw err;
    }
};

// UI helpers
const showError = (msg) => {
    const output = document.getElementById('output');
    if (output) {
        output.innerText = msg;
        output.style.color = 'red';
        output.style.display = '';
    }
};

const hideError = () => {
    const output = document.getElementById('output');
    if (output) output.style.display = 'none';
};

const updateProgressBar = (progressBar, value) => {
    value = Math.round(value);
    progressBar.querySelector('.progress__fill').style.width = `${value}%`;
    progressBar.querySelector('.progress_text').textContent = `${value}%`;
};

// System State Fetchers
const SystemState = {
    async updateDynamic() {
        try {
            const [cpu, mem, disk] = await Promise.all([
                fetchJSON(API.cpu),
                fetchJSON(API.memory),
                fetchJSON(API.disk),
            ]);
            totalMem = mem.total_mb;
            // Update UI
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
            hideError();
        } catch {}
    },
    async updateStatic() {
        try {
            const cpu = await fetchJSON(API.cpu);
            document.getElementById('cpu_name').innerText = `Model: ${cpu.cpu_model}`;
            document.getElementById('cpu_cores').innerText = `Cores: ${cpu.cpu_cores}`;
            document.getElementById('cpu_threads').innerText = `Threads: ${cpu.cpu_threads}`;
            hideError();
        } catch {}
    },
};

// Process Table Logic
const ProcessTable = {
    async update() {
        const spinner = document.getElementById('process-loading-spinner');
        const refreshBtn = document.getElementById('refresh-process-btn');
        const processInfoDiv = document.getElementById('process-info');
        if (spinner) spinner.style.display = 'inline-block';
        if (refreshBtn) refreshBtn.disabled = true;
        if (processInfoDiv) processInfoDiv.style.display = 'none';
        try {
            let processList = await fetchJSON(API.processes);
            if (processSortState.column !== null) {
                processList = this.sortList(processList, processSortState.column, processSortState.ascending);
            }
            this.render(processList);
            if (processInfoDiv) processInfoDiv.style.display = '';
            hideError();
        } catch {}
        if (spinner) spinner.style.display = 'none';
        if (refreshBtn) refreshBtn.disabled = false;
    },
    render(processList) {
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
                </td>`;
            row.addEventListener('click', event => {
                if (event.target.closest('.end-task-btn')) return;
                ProcessTable.showMoreInfo(process.pid);
            });
            processTable.appendChild(row);
        });
        this.bindEndTaskButtons();
        this.enableSorting();
    },
    bindEndTaskButtons() {
        document.querySelectorAll('.end-task-btn').forEach(button => {
            button.addEventListener('click', async event => {
                const pid = event.target.getAttribute('data-pid');
                if (confirm(`Are you sure you want to terminate the process with PID ${pid}?`)) {
                    await ProcessTable.killProcess(pid);
                }
            });
        });
    },
    enableSorting() {
        const ths = document.querySelectorAll('.process-table thead th');
        ths.forEach((th, idx) => {
            if (idx < 5) {
                th.style.cursor = 'pointer';
                th.onclick = () => {
                    if (processSortState.column === idx) {
                        processSortState.ascending = !processSortState.ascending;
                    } else {
                        processSortState.column = idx;
                        processSortState.ascending = true;
                    }
                    ProcessTable.update();
                };
            }
        });
    },
    sortList(list, column, ascending) {
        const keyMap = ['name', 'pid', 'cpu_percent', 'memory_mb', 'username'];
        const key = keyMap[column];
        return list.slice().sort((a, b) => {
            let aVal = a[key];
            let bVal = b[key];
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
    },
    async showMoreInfo(pid) {
        try {
            const info = await fetchJSON(API.processMoreInfo(pid));
            if (info.error) {
                alert(`Error: ${info.error}`);
                return;
            }
            // Render info in modal
            const modal = document.getElementById('process-info-modal');
            const content = document.getElementById('process-info-modal-content');
            const closeBtn = document.getElementById('close-process-info-modal');

            // Create or get the overlay
            let overlay = document.getElementById('modal-backdrop-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'modal-backdrop-overlay';
                overlay.style.position = 'fixed';
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.width = '100vw';
                overlay.style.height = '100vh';
                overlay.style.background = 'rgba(0,0,0,0.35)';
                overlay.style.zIndex = '999';
                overlay.style.pointerEvents = 'auto';
                overlay.style.transition = 'opacity 0.2s';
                overlay.style.opacity = '1';
                document.body.appendChild(overlay);
            } else {
                overlay.style.display = 'block';
                overlay.style.opacity = '1';
            }

            // Prevent tabbing out of modal
            const trapFocus = (e) => {
                if (modal.style.display !== 'block') return;
                const focusableEls = modal.querySelectorAll('button, [tabindex]:not([tabindex="-1"])');
                const firstEl = focusableEls[0];
                const lastEl = focusableEls[focusableEls.length - 1];
                if (e.key === 'Tab') {
                    if (e.shiftKey) {
                        if (document.activeElement === firstEl) {
                            lastEl.focus();
                            e.preventDefault();
                        }
                    } else {
                        if (document.activeElement === lastEl) {
                            firstEl.focus();
                            e.preventDefault();
                        }
                    }
                }
            };

            if (modal && content) {
                content.innerHTML = '';
                // Show main process info in a grid
                Object.entries(info).forEach(([key, value]) => {
                    const div = document.createElement('div');
                    div.innerHTML = `<strong>${key}</strong><br>${typeof value === 'object' ? JSON.stringify(value, null, 2) : value}`;
                    content.appendChild(div);
                });

                // Helper to close modal and remove listeners/overlay
                const closeModal = () => {
                    modal.style.display = 'none';
                    if (overlay) overlay.style.display = 'none';
                    document.removeEventListener('keydown', escListener);
                    document.removeEventListener('mousedown', clickListener, true);
                    document.removeEventListener('keydown', trapFocus, true);
                };

                // ESC key closes modal
                const escListener = (e) => {
                    if (e.key === "Escape") {
                        closeModal();
                    }
                };
                document.addEventListener('keydown', escListener);

                // Click on overlay closes modal, but not inside modal
                const clickListener = (e) => {
                    if (overlay && e.target === overlay) {
                        closeModal();
                    }
                };
                document.addEventListener('mousedown', clickListener, true);

                // Trap focus inside modal
                document.addEventListener('keydown', trapFocus, true);

                // Close button closes modal
                if (closeBtn) {
                    closeBtn.onclick = function() {
                        closeModal();
                    };
                }

                // Show overlay and modal
                overlay.style.display = 'block';
                overlay.style.opacity = '1';
                modal.style.display = 'block';
                setTimeout(() => { 
                    modal.style.pointerEvents = 'auto'; 
                    // Focus close button for accessibility
                    if (closeBtn) closeBtn.focus();
                }, 10);
            }
        } catch {
            alert('Failed to fetch process info.');
        }
    },
    async killProcess(pid) {
        try {
            const result = await fetchJSON(API.kill, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pid }),
            });
            if (result.success) {
                alert(`Process with PID ${pid} terminated successfully.`);
                ProcessTable.update();
            } else {
                alert(`Failed to terminate process with PID ${pid}: ${result.error}`);
            }
        } catch {
            alert(`Error terminating process with PID ${pid}.`);
        }
    },
    search(searchText) {
        const input = searchText.toLowerCase();
        document.querySelectorAll('#process-list tr').forEach(row => {
            const cells = row.querySelectorAll('td');
            let found = false;
            cells.forEach(cell => {
                if (cell.innerText.toLowerCase().includes(input)) found = true;
            });
            row.style.display = found ? '' : 'none';
        });
    },
};




// Initial calls
SystemState.updateDynamic();
SystemState.updateStatic();
setInterval(SystemState.updateDynamic, 1000);
ProcessTable.update();
SystemState.updateStatic();

// Expose search for UI (if needed)
window.searchProcesses = ProcessTable.search;

// Attach refresh button event listener
const refreshBtn = document.getElementById('refresh-process-btn');
if (refreshBtn) {
    refreshBtn.onclick = () => ProcessTable.update();
}

