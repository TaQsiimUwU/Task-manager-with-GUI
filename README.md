# Task-manager-with-GUI
## Overview

This project is a simple task manager with a graphical user interface (GUI) built using **Electron** for the frontend and **Flask** for the backend. It monitors system resources such as CPU, memory.

### Technologies Used

- **Electron**: Used to create the desktop application with a GUI.
- **Flask**: A lightweight Python web framework used to build the backend API.
- **psutil**: A Python library used to retrieve system resource usage data.

## Installation

### Prerequisites

- **Node.js**: Required to run the Electron application.
- **Python 3**: Required to run the Flask backend.
- **pip**: Python package manager to install dependencies.

### Steps to Install Dependencies

1. Clone the repository:
  ```bash
  git clone https://github.com/TaQsiimUwU/Task-manager-with-GUI.git
  cd Task-manager-with-GUI
  ```

2. Install frontend dependencies:
  ```bash
  cd frontend
  npm install
  ```

3. Install backend dependencies:
  ```bash
  cd ../backend
  pip install -r requirements.txt
  ```

### Running the Application
1. Start the Electron application:
  ```bash
  cd ../frontend
  npm run tart
  ```

The application will launch, and you can monitor system resources in the GUI.
