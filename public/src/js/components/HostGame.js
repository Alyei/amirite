import React from "react";
import {Button} from "react-bootstrap";

//import {handleHostGameClick} from "../../api";

export default class HostGame extends React.Component {
    handleHostGameClick() {

    }
    
    render() {
        return(
            <Button onClick={this.handleHostGameClick}>
                Host Game
            </Button>
        )
    }    
}