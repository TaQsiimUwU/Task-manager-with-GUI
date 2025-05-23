# Task Manager with GUI

This project is a system monitoring application built using **Electron** for the frontend and **Flask** for the backend. It displays system statistics such as CPU, memory, disk, and process information in a graphical user interface, allowing users to monitor and manage system resources.

## Features

- Displays CPU model, cores, threads, usage, and temperature (where available).
- Shows memory usage statistics including total, used memory, and percentage.
- Monitors disk usage including total space, used space, and percentage.
- Lists running processes with details like PID, name, status, memory usage, CPU usage, and username.
- Allows termination of processes directly from the interface.
- Cross-platform support (Windows and Linux).

## Project Structure

```
Task-manager-with-GUI/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── app.py
│   │   └── KillProc.py
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── css/
│   │   ├── background.css
│   │   ├── cpu.css
│   │   ├── index.css
│   │   └── process.css
│   ├── img/
│   │   └── icon.png
│   ├── js/
│   │   └── renderer.js
│   └── renderer.html
├── main.js
├── package.json
├── preload.js
└── README.md
```

## Prerequisites

- **Node.js** and **npm** installed.
- **Python 3** installed.


## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/TaQsiimUwU/Task-manager-with-GUI.git
   cd Task-manager-with-GUI
   ```

2. Set up a Python virtual environment:

   **For Linux/macOS:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

   **For Windows:**
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

3. Install Node.js dependencies:
   ```bash
   npm install
   ```

4. Install Python dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

## Running the Application

1. Make sure you are in the root directory of the project.

2. Start the application:
   ```bash
   npx electron .
   ```

   This will automatically:
   - Launch the Flask backend server on port 3000
   - Start the Electron frontend application

3. The application window will appear with the system monitoring interface.

   The Flask backend runs on `http://127.0.0.1:3000` and is used internally by the Electron app.

## API Endpoints

The Flask backend provides the following API endpoints:

- `/cpu` - Returns CPU statistics (model, cores, threads, usage percentage, temperature).
- `/memory` - Returns memory usage details (total, used, percentage).
- `/disk` - Returns disk usage information (total, used space, percentage).
- `/process` - Returns a list of running processes with details.
- `/kill` - POST endpoint to terminate a process by PID.


## Notes

- Ensure Python and Node.js are properly configured in your system's PATH.
- The backend runs on port `3000` by default. Update the port in `backend/run.py` if needed.
- CPU temperature monitoring is currently available on Linux systems only.
- On Windows, use Python command that matches your installation (either `python` or `py` instead of `python3` if needed).

## License

This project is licensed under the MIT License.
