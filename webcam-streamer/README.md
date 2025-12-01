# Webcam Streamer

This program finds the first available webcam and streams its video to an RTMP server.

## Prerequisites

- Node.js installed on your system.
- The home server from the parent directory is running (`docker-compose up`).

## Running the Streamer

1.  Open a terminal or command prompt.
2.  Navigate to this directory (`webcam-streamer`).
3.  Run the program:
    ```
    node index.js
    ```

## Running on Windows Startup

To make this program run automatically when you start your Windows machine, you can create a batch file and place it in the Windows Startup folder.

1.  **Create a batch file.**
    - Open Notepad or any text editor.
    - Paste the following lines into the file. Make sure to replace `C:\path\to\your\project\webcam-streamer` with the actual full path to this `webcam-streamer` directory.

    ```batch
    @echo off
    cd "C:\Users\dwo76\OneDrive\Documents\Code\ChickenServer\webcam-streamer"
    node index.js
    ```

    - Save the file as `start-stream.bat`.

2.  **Open the Startup folder.**
    - Press `Win + R` to open the Run dialog.
    - Type `shell:startup` and press Enter. This will open the Startup folder for the current user.

3.  **Add the batch file to the Startup folder.**
    - Move or copy the `start-stream.bat` file you created into the Startup folder.

Now, the script will run automatically the next time you log in to your computer. A terminal window will appear and show the output of the streamer.
