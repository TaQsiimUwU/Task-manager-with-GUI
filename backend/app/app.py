from flask import Blueprint, jsonify
import psutil
import platform
import os
import subprocess

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
    for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_info']):
        try:
            info = proc.info
            # Add memory usage in MB as a single value
            if info.get('memory_info'):
                mem_info = info['memory_info']
                info['memory_mb'] =mem_info.rss
                del info['memory_info']
            process_list.append(info)
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue
    return jsonify(process_list)

