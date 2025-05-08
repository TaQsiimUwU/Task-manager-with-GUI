from flask import Blueprint, jsonify
import psutil

main = Blueprint('main', __name__)

@main.route('/api/cpu')
def cpu_usage():
    return jsonify({'cpu': psutil.cpu_percent(interval=1)})


@main.route('/api/disk')
def disk_usage():
    disk = psutil.disk_usage('/')
    return jsonify({
        'total_mb': round(disk.total / 1e6, 2),
        'used_mb': round(disk.used / 1e6, 2),
        'percent': disk.percent
    })

@main.route('/api/memory')
def memory():
    mem = psutil.virtual_memory()
    return jsonify({
        'total_mb': round(mem.total / 1e6, 2),
        'used_mb': round(mem.used / 1e6, 2),
        'percent': mem.percent
    })
