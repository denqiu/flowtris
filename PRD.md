*To use this template, first make a copy by* [*clicking here*](https://docs.google.com/document/d/1541V32QgSwyCFWxtiMIThn-6n-2s7fVWztEWVa970uo/copy)*. Template by* [*Lenny Rachitsky*](https://www.lennyrachitsky.com/)*. For advice on using the template,* [*read this post*](https://uxdesign.cc/how-to-solve-problems-6bf14222e424?sk=7d60d49dd3f7feb571b108e2ca515824)*.*

# Flowtris

**Description: What is it?**  


A game project for Hackathon Fun and Games with Devvit Web.



Pre-Context: Germany's Autobahn road system. Has 2 lanes, fast lane and slow lane. Fast lane has no speed limit and only allows cars while slow lane only allows buses.



**Problem: What problem is this solving?**  


Goal of the game is to transport people to the destination.



**Why: How do we know this is a real problem and worth solving?**  



NA



**Success: How do we know if we’ve solved this problem?**  


If the game feels fun to play.



**Audience: Who are we building for?**  


Single-player



**What: Roughly, what does this look like in the product?**  


A grid setup of a city and roads. Main feature is path charting mechanic.



Additional Features:

* Level mechanic where there are many levels to choose from of various difficulty or game mode mechanic of easy, medium, hard difficulties. Endless mode or randomized level. Some levels have time limit or time limit depends on level/mode difficulty.
* Sandtrix mechanic without requirement to color match across screen for filling in potholes. You actually want the opposite, to get as much sand as possible.
* Optional: Flow-free mechanic to connect sandtrix box to potholes with pipes. Or if not enough time, automatic connection.



**How: What is the experiment plan?**  


1. Technologies: Javascript/Phaser.js/React
2. Use \[React Grid](https://mui.com/material-ui/react-grid/) to build simple grid of city and roads with fast and slow lanes.
3. Setup missing squares in fast lane to represent potholes. They can have different sizes.
4. Objective of the game is to plan routes and fill/avoid potholes in advance and transfer as many people as possible or all people in the level, which can be timed depending on difficulty. If you want to fill potholes, that will trigger sandtrix sequence which can be also timed depending on difficulty. Game will automatically take care of transporting people in cars or buses.
5. To build sandtrix sequence, use Phaser.js.
6. If we do have time for flow-free pipe mechanic, we can use the same React Grid component.



**When: When does it ship and what are the milestones?**  


Ships in 2 weeks. Deadline is September 17.

