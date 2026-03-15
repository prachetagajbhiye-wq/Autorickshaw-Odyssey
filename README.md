🚕 Autorickshaw Odyssey – Project Guide

Autorickshaw Odyssey is a browser-based driving game inspired by the chaotic streets of Mumbai. Players navigate through traffic, choose different vehicles, and explore various map environments while collecting coins and maintaining vehicle health.

This document explains how to run the project and understand the available gameplay options.



📁 Project Structure

The project is divided into two main parts: the frontend for the user interface and gameplay, and the backend for server-side functionality.

project-folder
│
├── frontend
│   └── index.html
│
├── backend
│   ├── package.json
│   └── server.js
│
└── game.js



▶️ Running the Frontend

The frontend contains the game interface and player controls.

Steps

1. Open the project folder in Visual Studio Code.
2. Navigate to the file:

frontend/index.html

3. Open the file using one of the following methods:
   - Use the Live Server extension in VS Code.
   - Open it directly in any modern browser such as Chrome, Edge, or Firefox.

Using Live Server is recommended because it automatically refreshes the page whenever code changes are made.

Mobile-First Design

The game interface follows a mobile-first design approach, meaning it is optimized for smaller screens and mobile devices.

To test the responsive design:

1. Open Developer Tools in your browser.
2. Enable the Device Toolbar.
3. Select different mobile devices to simulate mobile gameplay.



⚙️ Running the Backend

The backend server supports the game's functionality and future features such as leaderboards.

Steps

1. Open a terminal in the main project directory.
2. Navigate to the backend folder:

cd backend

3. Install the required dependencies:

npm install

4. Start the server:

npm start

Server Address

After the server starts successfully, it will run locally at:

http://localhost:3000



🎮 Gameplay Overview

In Autorickshaw Odyssey, players control a vehicle and navigate through busy city streets while avoiding obstacles and collecting coins.

The goal is to survive the Mumbai traffic chaos, travel as far as possible, and achieve the highest score.

During gameplay, the following metrics update dynamically:

- Distance traveled
- Coins collected
- Player health



🎛 Main Menu Options

The main menu provides several interactive options that allow players to configure their ride before starting the game.

▶ Play

Starts the game with the selected vehicle and map settings.

🏆 Leaderboard

Displays the top scores achieved by players. This feature is connected to the backend and allows tracking of high scores.



🚗 Vehicle Selection

Players can choose from multiple vehicle types. Each vehicle has different attributes affecting gameplay.

Autorickshaw

The classic Mumbai vehicle.
Balanced speed and maneuverability, making it suitable for beginners.

Delivery Scooter

A lightweight and agile vehicle.
Offers faster movement but may have lower durability.

Taxi

A reliable city vehicle with balanced performance.
Provides moderate speed and durability.

Compact Car

A slightly larger vehicle with improved stability and protection.
Better for handling heavier traffic conditions.

Each vehicle may have different speed, handling, and durability values, which influence gameplay difficulty and strategy.



🗺 Map Selection

Players can also choose the environment in which the game takes place.

South Mumbai

Dense traffic and narrow roads create a challenging driving experience.

Bandra

A scenic coastal area with moderate traffic conditions.

Highway

Features faster lanes but heavier traffic volume.

Monsoon Mode

Rainy weather conditions with slippery roads, making driving more difficult.

Each map changes the traffic density, road width, and environmental difficulty.



🎮 Player Controls

Players interact with the game using on-screen control buttons.

Move Left

Shifts the vehicle to the left lane to avoid traffic or collect coins.

Move Right

Moves the vehicle to the right lane.

Boost

Temporarily increases the vehicle's speed to cover distance faster or escape obstacles.

Honk

Activates the vehicle horn, adding interaction and realism to the driving experience.



📊 Game Status Indicators

Several indicators update in real time during gameplay.

Distance

Displays how far the player has traveled during the current run.

Coins

Shows the number of coins collected.

Health

Represents the vehicle’s condition. Collisions or obstacles may reduce health.

If health reaches zero, the ride ends.



⚙️ Game Logic

The main gameplay mechanics are implemented in:

game.js

This file controls:

- Vehicle movement
- Coin collection
- Health system
- Score updates
- Environment generation



🚧 Planned Improvements

Future updates to the project may include:

- Procedural city chunk generation for endless gameplay
- Dynamic obstacles such as traffic vehicles or barriers
- Improved collision detection
- Enhanced leaderboard system
- Additional vehicles and maps



📌 Summary

To run the project:

1. Open frontend/index.html using Live Server or a browser.
2. Navigate to the backend folder.
3. Install dependencies using "npm install".
4. Start the server using "npm start".
5. Access the backend at http://localhost:3000.

Once everything is running, you can select a vehicle, choose a map, and start your ride through Mumbai traffic.
