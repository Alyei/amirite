# Intro
Game of quiz done in a group of three as part of our final thesis in our ex-school, HTL Ungargasse (Ungargasse 69, 1030 Wien).

Our group consisted of Andrej Resanovic (me), Georg Schubbauer and Stefan Wesely. This project was done as our final thesis (Diplomarbeit) before graduation. From the beginning on we knew, that we wanted the project to be completely open for anyone to use as it was supposed to be used for educational purposes. As such, please keep in mind that none of us have really used any of the technologies in this project (TypeScript, MongoDB, React.JS) to this extent before. We tried our best to keep best practices and do everything properly and easily maintaineable, but I'm sure that there is still a lot of room for improvement.

I won't add any proper kind of documentation to this README - all documentation that we have done you can find in the folder "docs", that is in the root folder of the project.

# Description
Amirite is a competitive learning platform, which **blah blah...**

It's simply a quiz game. Every game has one host who starts the game, and multiple players. Players can get elevated to moderators, which gives them more rights in a game, like choosing the next question or disqualifying players. Then, depending on the game mode, all these players play at once, or only one at a time. At the end of a game, you can see the game's statistics and they are saved in the database. 

The questions that are asked have to be uploaded to the database first.

There are 4 game modes:

**Duel**: Classic 1v1.

**Determination**: Players get shown a question and an answer to it. For each answer they are shown, they have to decide if it is true or false. As soon as they get it wrong, or right if it is true, they get the next question. Everyone can play at once.

**QuestionQ**: Here everyone can play at once too. The players get question after question and have to choose the right answer.

**Millionaire**: Like "Who wants to be a millionaire?", with jokers, spectators and all that.

**_Note_**: *If you clone this and expect to play easily, you will, unfortunately, be disappointed. Seeing as the game mode's pages aren't complete, nor easily start up with the server (I mean the pages made with React.js, not the simple HTML ones that were used for testing purposes), you would have to jump through a lot of hoops, and possibly finish some parts, to get it working.* 

*Also, I don't know how to properly start the React app myself (only thing I know is going into */public/src* and running *npm start*). I will have to ask the person responsible for that to write a quick guide, if they want to.*

# Responsibilities
*Andrej Resanovic* was the group leader and responsible for the server. In this case server means the interface between the game logic and the client. He wrote all server functionality as well as the API.

*Georg Schubbauer* took responsiblity of managing the database and programming the logic of the 4 different game modes one can play. He installed and configured the database and implemented his concepts of the various game modes into the project.

*Stefan Wesely*'s responsibilities consisted of client side programs - mainly the web site. He had to work out concepts for the whole project's web presence, including the pages for playing the quiz.

# Quickquide
To start, clone the project and run 

*npm install*

to install all the project's dependencies.

After that, you have to generate keys. We generated our own private key and certificate by running 

*openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365*

Put these certificates into the "assets" folder in the root of the project, and run 

*npm start*

You may have to fix paths in the projects config file, *config.json*.

**_Note_**: *This was programmed in Windows. When I tried running it on Linux (Ubuntu 16.04) it started giving me an error about how bcrypt was compiled for node version 57. (After trying to check the whole message again, to describe it properly, it started giving me errors about missing *nodemon*. Maybe you're just better of running it on Windows.) The error was not resolved after rebuilding the packages with *npm rebuild* and deleting and reinstalling bcrypt.*

