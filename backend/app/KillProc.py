import platform
import os
import subprocess


def kill_by_pid(pid):

   try:
      if platform.system() == "Windows":
         # Use taskkill command for Windows
         subprocess.call(["taskkill", "/F", "/PID", str(pid)])
      else:
         # Use os.kill for Linux and MacOS
         os.kill(int(pid), 9)
   except Exception as e:
      print(f"Error killing process with PID {pid}: {e}")
