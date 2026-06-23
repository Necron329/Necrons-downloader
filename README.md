# **Necron's Downloader**

Necron's Downloader is a Graphical User Interface (GUI) wrapper for the powerful yt-dlp command-line tool. The project is currently in the early phase of development. It aims to simplify the process of downloading video and audio from platforms supported by yt-dlp without the need to use the command line interface.

## **Core Features**

The current version focuses on the most essential functionalities, but the project is under active development.

* **Download via URL** \- paste the link and initialize the download.  
* **Format selection** \- choose between downloading video (MP4) or strictly audio (MP3).  
* **Quality control** \- quick selection between the best and worst available media quality.  
* **Auto-updater** \- built-in update system (can be disabled in settings).

## **Technology Stack and Architecture**

The application is built using a modern technology stack:

* **Frontend:** React, Vite, TypeScript  
* **Desktop Application Framework:** Electron  
* **Storage:** electron-store (persistent app configuration)
* **Core Engines:** yt-dlp (for downloading) and ffmpeg (for media conversion and merging)

## **Installation**

### **For End Users**

No compilation is required. To use the application:

1. Navigate to the Releases tab.  
2. Download the latest installer (.exe file).  
3. Run the installer, select the installation path, and start using the software. The application handles future updates automatically.

### **For Developers**

If you wish to download the source code, modify it, or contribute to the project:

1. Clone the repository:

git clone \[https://github.com/your-username/necrons-downloader.git\](https://github.com/your-username/necrons-downloader.git)  
cd necrons-downloader

2. Install dependencies:

npm install

3. Run the setup script (this downloads required resources such as yt-dlp, ffmpeg, and other external binaries):

npm run setup

4. Start the application in development mode:

npm run dev

5. Build the production version (compiles the .exe file):

npm run build

## **Contributing**

This project is open to collaboration. If you have an idea for a new feature, have found a bug, or want to improve the codebase, feel free to open an Issue or submit a Pull Request. All contributions are welcome.

## **Contact and Author**

* **Author:** Necron  
* **Discord:** necron329

## Why

This project was created to provide a simple desktop interface for yt-dlp, removing the need to use the command line while keeping flexibility and performance.

## **Acknowledgments**

Special thanks to the developers of yt-dlp and FFmpeg — their work makes this project possible and provides the core functionality behind media downloading and processing.

## License

This project is distributed under the Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0) License. See the `LICENSE` file for more details. 

*Note: The project downloads and utilizes `yt-dlp` and `FFmpeg`, which are subject to their own respective licenses*