function updateProgressBar(progressBar, value) {
  value = Math.round(value);
  progressBar.querySelector(".progress__fill").style.width = `${value}%`;
  progressBar.querySelector(".progress_text").textContent = `${value}%`;
}

async function getStats() {
  try {
    const cpuRes = await fetch('http://127.0.0.1:3000/cpu');
    const memRes = await fetch('http://127.0.0.1:3000/memory');
    const procRes = await fetch('http://127.0.0.1:3000/process');
    const diskRes = await fetch('http://127.0.0.1:3000/disk');

    const cpu = await cpuRes.json();
    const mem = await memRes.json();
    const procList = await procRes.json();
    const disk = await diskRes.json();


    const cpu_usage = document.querySelector(".usage");
    const memory_usage = document.querySelector(".memory_usage");
    const disk_usage = document.querySelector(".disk_usage");


    document.getElementById('cpu_name').innerText = `Model: ${cpu.cpu_model}`;
    document.getElementById('cpu_cores').innerText = `Cores: ${cpu.cpu_cores} `;
    document.getElementById('cpu_threads').innerText = `Threads: ${cpu.cpu_threads} `;
    document.getElementById('progress_text').innerText = `${cpu.cpu_percent} %`;
    document.getElementById('cpu_usage').innerText = `CPU Usage: ${cpu.cpu_percent} %`;
    document.getElementById('cpu_temp').innerText = `Temperature: ${cpu.cpu_temp} °C`;
    document.getElementById('cpu_load').innerText = `CPU stats: ${JSON.stringify(cpu.cpu_stats.interrupts)}`;
    document.getElementById('disk_progress_text').innerText = `${disk.percent} %`;
    document.getElementById('disk').innerText = `Disk Usage: ${disk.used_gb} GB / ${disk.total_gb} GB`;
    document.getElementById('memory_progress_text').innerText = `${mem.percent} %`;
    document.getElementById('memory').innerText = `Memory Usage: ${mem.used_mb} MB / ${mem.total_mb} MB`;

    // Update progress bars
    updateProgressBar(cpu_usage, cpu.cpu_percent);
    updateProgressBar(memory_usage, mem.percent);
    updateProgressBar(disk_usage, disk.percent);

    // Show all processes
    let procText = '';
    procList.forEach(proc => {
      procText +=
      `\n\nProcess ID: ${proc.pid}` +
      `\nProcess Name: ${proc.name}` +
      `\nProcess CPU util: ${proc.cpu_percent}` +
      `\nProcess MEM util: ${proc.memory_mb}` ;

      // `\nProcess Memory info: ${JSON.stringify(proc.memory_info)}`;
    });
    document.getElementById('processes').innerText = procText;

    // document.getElementById('output').innerText = "Data loaded successfully.";
    document.getElementById('output').style.dispaly = "hidden";
  } catch (err) {
    document.getElementById('output').innerText = "Error connecting to backend.";
    document.getElementById('output').style.color = "red";
    console.error(err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  getStats(); // auto-load on start
  setInterval(getStats, 1000); // call every 1 second
});
