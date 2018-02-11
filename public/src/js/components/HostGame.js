import React from "react";
import {Button} from "react-bootstrap";
import {withRouter} from "react-router-dom";

//import {handleHostGameClick} from "../../api";

class HostGame extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            gamemodes: ["QuestionQ", "Determination"],
            selectedMode: "",
            username:"thisName"//change to cookies
        }
        console.log(this.props);
        this.handleGameSelection = this.handleGameSelection.bind(this);
        this.handleHostGameClick = this.handleHostGameClick.bind(this);
    }
    handleGameSelection(event) {
        this.setState({selectedMode: event.target.value});
    }
    handleHostGameClick() {
        this.props.socketio.socket.emit('host game', this.state.username);
        this.props.socketio.socket.on('gameid',(gameid) => {
            console.log("got game with id", gameid);
            this.props.history.push({
                pathname: "/game/"+gameid,
                host: true
            })
        })
    }
    renderGamemodes() {
        return(   
                this.state.gamemodes.map(function(element){
                return(
                <label key={element}>
                <input type="radio" 
                value={element} 
                checked={this.state.selectedMode === {element}} 
                onChange={this.handleGameSelection}/>
                {element}
                </label>
                );
            },this)
        )
    }

    render() {
        return(
            <div>
            {this.renderGamemodes()}
            <Button onClick={this.handleHostGameClick}>
                Host Game
            </Button>
            </div>
        )
    }    
}

export default withRouter(HostGame);