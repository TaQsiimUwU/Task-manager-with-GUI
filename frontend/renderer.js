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

    document.getElementById('CPU').innerText =
      `CPU Model: ${cpu.cpu_model}` +
      `\nCPU Cores: ${cpu.cpu_cores}  ||` +
      `\tCPU Threads: ${cpu.cpu_threads}` +
      `\nCPU Usage: ${cpu.cpu_percent} %` +
      `\nCPU Temperature: ${cpu.cpu_temp}°C` ;
      // `\nCPU stats: ${JSON.stringify(cpu.cpu_stats)}`;



    document.getElementById('memory').innerText = `Memory Usage: ${mem.used_mb} MB / ${mem.total_mb} MB (${mem.percent}%)`;

    document.getElementById('disk').innerText = `Disk Usage: ${disk.used_gb} GB / ${disk.total_gb} GB (${disk.percent}%)`;

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

    document.getElementById('output').innerText = "Data loaded successfully.";
    document.getElementById('output').style.color = "green";
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
