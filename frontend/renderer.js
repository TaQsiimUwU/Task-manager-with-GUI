async function getStats() {
  try {
    const cpuRes = await fetch('http://127.0.0.1:3000/api/cpu');
    const memRes = await fetch('http://127.0.0.1:3000/api/memory');
    // const diskRes = await fetch('http://localhost:5000/api/disk');

    const cpu = await cpuRes.json();
    const mem = await memRes.json();
    // const disk = await diskRes.json();

    document.getElementById('output').innerText =
      `CPU Model: ${cpu.cpu_model}` +
      `\nCPU Cores: ${cpu.cpu_cores}` +
      `\nCPU Threads: ${cpu.cpu_threads}` +
      `\nCPU Usage: ${cpu.cpu_percent} %` +
      `\nCPU Temperature: ${cpu.cpu_temp}°C` +
      // `\nCPU Load: ${cpu.cpu_load.join(', ')}` +
      // `\nCPU Frequency: ${cpu.cpu_freq.map(f => `${f.current} MHz`).join(', ')}` +
      `\n\nMemory Usage: ${mem.used_mb} MB / ${mem.total_mb} MB (${mem.percent}%)`;
  } catch (err) {
    document.getElementById('output').innerText = "Error connecting to backend.";
    console.error(err);
  }
}

getStats(); // auto-load on start
