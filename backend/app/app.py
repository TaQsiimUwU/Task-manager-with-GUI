from flask import Blueprint, jsonify
import psutil
import platform
import os
import subprocess

main = Blueprint('main', __name__)


def get_cpu_temp():
    if platform.system() == "Windows":
        try:
            # Use PowerShell to get CPU temperature
            result = subprocess.run(
                ["powershell", "-Command", "(Get-WmiObject -Class Win32_PerfFormattedData_Counters_ThermalZone).CurrentTemperature"],
                capture_output=True, text=True)
            temp = int(result.stdout.strip()) / 10 - 273.15  # Convert from Kelvin to Celsius
            return round(temp, 2)
        except Exception as e:
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
        'cpu_freq': [f._asdict() for f in psutil.cpu_freq(percpu=True)],
        'cpu_stats': psutil.cpu_stats()._asdict(),
        'cpu_load': os.getloadavg() if hasattr(os, 'getloadavg') else 'Unavailable'
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
    for proc in psutil.process_iter(['pid', 'name', 'username']):
        process_list.append(proc.info)
    return jsonify(process_list)
#gamal is tryng some bruh
