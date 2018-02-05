import React from "react";
import {Button, Checkbox} from "react-bootstrap";

//import {handleHostGameClick} from "../../api";

export default class HostGame extends React.Component {
    constructor() {
        super();
        this.state = {
            gamemodes: ["QuestionQ", "Determination"],
            selectedMode: ""
        }
    }
    handleGameSelection(event) {
        this.setState({selectedMode: [event.target.value]});
    }
    handleHostGameClick() {
        console.log("hostgameclick");
    }
    renderGamemodes() {
            var Radiolist = this.state.gamemodes.map(function(element){
                return(
                <label>
                <input type="radio" value={element.toString()} checked={this.state.selectedMode === {element}} onChange={this.handleGameSelection}/>
                {element}
                </label>
                )
            })
            return(
                {Radiolist}
        )
    }

    render() {
        return(
            <div>
            <renderGamemodes/>
            <Button onClick={this.handleHostGameClick}>
                Host Game
            </Button>
            </div>
        )
    }    
}