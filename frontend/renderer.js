async function getStats() {
  try {
    const cpuRes = await fetch('http://localhost:5000/api/cpu');
    const memRes = await fetch('http://localhost:5000/api/memory');
    const diskRes = await fetch('http://localhost:5000/api/disk');

    const cpu = await cpuRes.json();
    const mem = await memRes.json();
    const disk = await diskRes.json();

    document.getElementById('output').innerText =
      `CPU Usage: ${cpu.cpu}%\n` +
      `Memory Usage: ${mem.used_mb} MB / ${mem.total_mb} MB (${mem.percent}%)` +
      `\nDisk Usage: ${disk.used_gb} GB / ${disk.total_gb} GB (${disk.percent}%)`;
  } catch (err) {
    document.getElementById('output').innerText = "Error connecting to backend.";
    console.error(err);
  }
}

getStats(); // auto-load on start
