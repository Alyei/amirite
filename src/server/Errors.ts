/**
 * Should be thrown when a game could not be found.
 * @author Andrej Resanovic
 */
export class GameNotFoundError extends Error {
  /**
   * @param gameid - The game's ID.
   */
  constructor(gameid: string) {
    super("The game with the id " + gameid + " could not be found.");
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Should be thrown when a player could not be found.
 * @author Andrej Resanovic
 */
export class PlayerNotFoundError extends Error {
  /**
   * @param username The player's username.
   */
  constructor(username: string) {
    super("The player with the username " + username + " could not be found.");
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Should be thrown when a game-room could not be found.
 * @author Andrej Resanovic
 */
export class GameRoomNotFoundError extends Error {
  /**
   * @param gameid The game's id.
   */
  constructor(gameid: string) {
    super("The room with the id " + gameid + " could not be found.");
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Should be thrown when a game could not be added to the running games.
 * @author Andrej Resanovic
 */
export class GameCouldNotBeAddedError extends Error {
  /**
   * @param gameid The game's ID.
   */
  constructor(gameid: string) {
    super(
      "The game with the id " +
        gameid +
        " could not be added to the list of running games."
    );
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Should be thrown when a player who is already hosting a game tries to host another.
 * @author Andrej Resanovic
 */
export class PlayerAlreadyHostsGame extends Error {
  /**
   * @param username The player's username.
   */
  constructor(username: string) {
    super(
      "The player with the username " + username + " already hosts a game."
    );
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Should be thrown when a player could not be added to a game.
 * @author Andrej Resanovic
 */
export class PlayerCouldNotBeAddedError extends Error {
  /**
   * @param username The player's username.
   */
  constructor(username: string) {
    super(
      "The player with the username " +
        username +
        " could not be added to the game."
    );
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Should be thrown when a question could not be added to a game.
 * @author Andrej Resanovic
 */
export class QuestionCouldNotBeAddedError extends Error {
  /**
   * @param id The question's ID.
   */
  constructor(id: string) {
    super(
      "The question with the id " + id + " could not be added to the game."
    );
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Should be thrown when logging goes wrong somehow.
 * @author Andrej Resanovic
 */
export class LoggingFailedError extends Error {
  /**
   * @param msg Reason for logging-failure.
   */
  constructor(msg?: string) {
    if (msg) {
      super("Logging failed because of:\r\n" + msg);
      Object.setPrototypeOf(this, new.target.prototype);
    } else {
      super("Logging failed.");
      Object.setPrototypeOf(this, new.target.prototype);
    }
  }
}

/**
 * Should be thrown when a game could not be created.
 * @author Andrej Resanovic
 */
export class GameCreationError extends Error {
  /**
   * @param msg Reason for game-creation-failure.
   */
  constructor(msg: string) {
    super("The game could not be created: " + msg);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
