// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Bets {

    uint256 private _nextGameID;
    uint256 private royalty = 10;

    mapping(uint256 => Game) private games;

    enum Stage{INIT, ROUND1, ROUND2, ROUND3, FINISHED}
    enum Turn{NO_TURN, USER1, USER2}

    struct Game {
        address user1;
        address user2;
        uint256 betsUser1;
        uint256 betsUser2;
        Stage stage;
        Turn turn;
    }

    event GameStarted(uint256 id, address user1);
    event ChangeGameStage(uint256 id, Stage stage);

    constructor(){
        _nextGameID = 1;
    }

    function getGame(uint256 id) external view returns(Game memory) {
        return games[id];
    }

    function startGame() external {
        Game memory game;
        game.user1 = msg.sender;

        uint256 id = _nextGameID;

        games[id] = game;
        _nextGameID++;

        emit GameStarted(id, msg.sender);
    }

    function enterGame(uint256 id) external {
        require(games[id].user2 == address(0), "Bets: game already has second player");

        games[id].user2 = msg.sender;
        games[id].stage = Stage.ROUND1;
        games[id].turn = Turn.USER1;

        emit ChangeGameStage(id, Stage.ROUND1);
    }

    function bet(uint256 id) external payable {
        require(games[id].turn != Turn.NO_TURN, "Bets: bets not available");
        require(_isUsersGame(id, msg.sender), "Bets: not your game");
        require(_isUsersTurn(id, msg.sender), "Bets: not your turn");
        require(_isBetEqual(id, msg.value, msg.sender), "Bets: bets not equal");

        if (games[id].user1 == msg.sender) {
            games[id].betsUser1 = games[id].betsUser1 + msg.value;
        }

        if (games[id].user2 == msg.sender) {
            games[id].betsUser2 = games[id].betsUser2 + msg.value;
        }

        if (games[id].betsUser1 == games[id].betsUser2) {
            games[id].stage = Stage(uint256(games[id].stage) + 1);

            emit ChangeGameStage(id, games[id].stage);

            if (games[id].stage == Stage.FINISHED) {
                games[id].turn = Turn.NO_TURN;
            }

        } else {

            if (games[id].turn == Turn.USER1) {
                games[id].turn = Turn.USER2;
            } else {
                games[id].turn = Turn.USER1;
            }

        }
    }

    function pass(uint256 id) external {
        require(games[id].turn != Turn.NO_TURN, "Bets: bets not available");
        require(_isUsersGame(id, msg.sender), "Bets: not your game");
        require(_isUsersTurn(id, msg.sender), "Bets: not your turn");

        uint256 value = (games[id].betsUser1 + games[id].betsUser2) * (100 - royalty) / 100;

        if (games[id].user1 == msg.sender) {
            payable(games[id].user2).transfer(value);
        } else {
            payable(games[id].user1).transfer(value);
        }

        games[id].stage = Stage.FINISHED;
        games[id].turn = Turn.NO_TURN;

        emit ChangeGameStage(id, Stage.FINISHED);
    }

    function _isBetEqual(uint256 id, uint256 amount, address user) internal view returns(bool) {
        if (games[id].betsUser1 == games[id].betsUser2) {
            return true;
        } else {
            if (games[id].user1 == user) {
                return games[id].betsUser1 + amount == games[id].betsUser2;
            } else {
                return games[id].betsUser2 + amount == games[id].betsUser1;
            }
        }
    }

    function _isUsersTurn(uint256 id, address user) internal view returns(bool) {
        if (games[id].user1 == user && games[id].turn == Turn.USER1) {
            return true;
        }

        if (games[id].user2 == user && games[id].turn == Turn.USER2) {
            return true;
        }

        return false;
    }

    function _isUsersGame(uint256 id, address user) internal view returns(bool) {
        return games[id].user1 == user || games[id].user2 == user;
    }

}
