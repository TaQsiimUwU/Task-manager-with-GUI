async function getStats() {
  try {
    const cpuRes = await fetch('http://127.0.0.1:3000/cpu');
    const memRes = await fetch('http://127.0.0.1:3000/memory');
    const procRes = await fetch('http://127.0.0.1:3000/process');
    const diskRes = await fetch('http://127.0.0.1:3000/disk');

    const cpu = await cpuRes.json();
    const mem = await memRes.json();
    const proc = await procRes.json();
    const disk = await diskRes.json();

    document.getElementById('output').innerText =
      `CPU Model: ${cpu.cpu_model}` +
      `\nCPU Cores: ${cpu.cpu_cores}` +
      `\nCPU Threads: ${cpu.cpu_threads}` +
      `\nCPU Usage: ${cpu.cpu_percent} %` +
      `\nCPU Temperature: ${cpu.cpu_temp}°C` +
      // `\nCPU Load: ${cpu.cpu_load.join(', ')}` +
      // `\nCPU Frequency: ${cpu.cpu_freq.map(f => `${f.current} MHz`).join(', ')}` +
      `\n\nMemory Usage: ${mem.used_mb} MB / ${mem.total_mb} MB (${mem.percent}%)`;


      document.getElementById('processes').innerText +=
      `\n\nProcess ID: ${proc.pid}` +
      `\nProcess Name: ${proc.name}` +
      `\nProcess Status: ${proc.status}` +
      `\nProcess Memory: ${proc.memory} MB` +
      `\nProcess CPU: ${proc.cpu} %` +
      `\nProcess Threads: ${proc.threads}` +
      `\nProcess User: ${proc.user}` +
      `\nProcess Command: ${proc.command}`;

    document.getElementById('disk').innerText =
      `\n\nDisk Usage: ${disk.used_mb} MB / ${disk.total_mb} MB (${disk.percent}%)` +
      `\nDisk Read: ${disk.read_speed} MB/s` +
      `\nDisk Write: ${disk.write_speed} MB/s` +
      `\nDisk IOPS: ${disk.iops}` +
      `\nDisk Latency: ${disk.latency} ms`;

  } catch (err) {
    document.getElementById('output').innerText = "Error connecting to backend.";
    console.error(err);
  }




}

getStats(); // auto-load on start
