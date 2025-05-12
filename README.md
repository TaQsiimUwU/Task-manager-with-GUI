# Task Manager with GUI

This project is a system monitoring application built using **Electron** for the frontend and **Flask** for the backend. It displays system statistics such as CPU, memory, and process information in a graphical user interface.

## Features

- Displays CPU model, cores, threads, usage, and temperature.
- Shows memory usage and percentage.
- Lists running processes with details like PID, name, status, memory usage, and CPU usage.
- Refresh button to update the displayed stats.

## Project Structure

```
Task-manager-with-GUI/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── routes.py
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── assets/
│   │   └── index.css
|   |   └── renderer.html
│   └── renderer.js
├── main.js
├── package.json
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

2. Set up a Python virtual environment (Linux users):
   ```bash
   python3 -m venv venv
   source venv/bin/activate
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
-make sure that you are in the root of the project-
 Start the application:
   ```bash
   npx electron .
   ```

 The Electron app will launch, and the Flask backend will run on `http://127.0.0.1:3000`.

## API Endpoints

The Flask backend provides the following API endpoints:

- `/cpu` - Returns CPU statistics.
- `/memory` - Returns memory usage details.
- `/process` - Returns a list of running processes.


## Notes

- Ensure Python and Node.js are properly configured in your system's PATH.
- The backend runs on port `3000` by default. Update the port in `backend/run.py` if needed.

## License

This project is licensed under the MIT License.
