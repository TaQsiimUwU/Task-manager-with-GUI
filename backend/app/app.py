from flask import Blueprint, jsonify, request
import psutil
import platform
import os
import subprocess
from .KillProc import kill_by_pid

main = Blueprint('main', __name__)


def get_cpu_temp():
    if platform.system() == "Windows":
        return 'Unavailable'

    elif platform.system() == "Linux":
        temps = psutil.sensors_temperatures()
        if not temps:
            return 'Unavailable'
        for name in temps:
            for entry in temps[name]:
                if entry.label.lower().startswith('package') or not entry.label:
                    return entry.current
        return 'Unknown'


def get_cpu_model():
    if platform.system() == "Linux":
        try:
            with open("/proc/cpuinfo", "r") as f: # Read CPU info from /proc/cpuinfo
                for line in f:
                    if "model name" in line:
                        return line.split(":")[1].strip()
        except FileNotFoundError:
            return "Unavailable"
    elif platform.system() == "Windows":
        return platform.processor()
    return "Unknown"


@main.route('/cpu')
def CPU():
    return jsonify({
        'cpu_model': get_cpu_model(),
        'cpu_cores': psutil.cpu_count(logical=False),
        'cpu_threads': psutil.cpu_count(logical=True),
        'cpu_percent': psutil.cpu_percent(interval=1),
        'cpu_temp': get_cpu_temp(),
        # 'cpu_freq': [f._asdict() for f in psutil.cpu_freq(percpu=True)],
        'cpu_stats': psutil.cpu_stats()._asdict(),

    })

@main.route('/disk')
def disk_usage():
    disk = psutil.disk_usage('/')
    return jsonify({
        'total_gb': round(disk.total / 1e9, 2),
        'used_gb': round(disk.used / 1e9, 2),
        'percent': disk.percent
    })


@main.route('/memory')
def memory():
    mem = psutil.virtual_memory()
    return jsonify({
        'total_mb': round(mem.total / 1e6, 2),
        'used_mb': round(mem.used / 1e6, 2),
        'percent': mem.percent
    })


@main.route('/process')
def process():
    process_list = []
    for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_info','username','status']):
        try:
            info = proc.info
            # Add memory usage in MB as a single value
            if info.get('memory_info'):
                mem_info = info['memory_info']
                info['memory_mb'] = mem_info.rss/(1024*1024)  # Convert bytes to MB
                del info['memory_info']
            process_list.append(info)
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue
    return jsonify(process_list)

@main.route('/processMoreInfo')
def processMoreInfo():
    pid = request.args.get('pid', type=int)
    if not pid:
        return jsonify({'error': 'PID not provided'}), 400
    try:
        proc = psutil.Process(pid)
        info = {
            'process_name': proc.name(),
            'pid': proc.pid,
            'cpu_percent': proc.cpu_percent(interval=0.1),
            'memory': proc.memory_info().rss / (1024 * 1024),  # in MB
            'user': proc.username(),
            'cpu_times': proc.cpu_times()._asdict(),
            'status': proc.status(),
            'memory_info': proc.memory_info()._asdict(),
            'memory_percent': proc.memory_percent(),
            'num_threads': proc.num_threads(),
            'open_files': [f._asdict() for f in proc.open_files()],
            'connections': [c._asdict() for c in proc.connections()],
            'io_counters': proc.io_counters()._asdict() if proc.io_counters() else None,
            'is_running': proc.is_running(),
        }
        return jsonify(info)
    except (psutil.NoSuchProcess, psutil.AccessDenied) as e:
        return jsonify({'error': str(e)}), 404




@main.route('/kill', methods=['POST'])
def kill_process():
    try:
        data = request.get_json()
        pid = data.get('pid')

        if not pid:
            return jsonify({'success': False, 'error': 'PID not provided'}), 400

        kill_by_pid(pid)
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

