import React from "react";
import { ProgressBar } from "react-bootstrap";
import { setInterval, clearInterval } from "timers";

export default class GameTime extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            timeNow: 0,
            percTimeNow: 0,
            startTime: 0,
            timerIntervalId: null
        }
        this.checkTimeOut = this.checkTimeOut.bind(this);
        this.setPercentageTimeNow = this.setPercentageTimeNow.bind(this);
        this.timer = this.timer.bind(this);
        this.deleteInterval = this.deleteInterval.bind(this);
    }
    componentDidMount() {
        var intervalId = setInterval(this.timer, 250);
        // store intervalId in the state so it can be accessed later:
        this.setState({timerIntervalId: intervalId});
    }
    
    componentWillUnmount() {
       this.deleteInterval();
    }
    
    setPercentageTimeNow() {
        this.setState({percTimeNow: Math.round(((this.state.timeNow/this.props.timeLimit)*100)*100)/100});
    }

    timer() {
       // setState method is used to update the state
       this.setState({ timeNow: this.state.timeNow + 250});
       this.setPercentageTimeNow();
    }
    deleteInterval() {
       // use intervalId from the state to clear the interval
       console.log("remove timer");
       clearInterval(this.state.timerIntervalId);
    }

    checkTimeOut() {
        console.log("timeout?");
        if(this.state.percTimeNow >= 100)
        {
            this.deleteInterval();
        }
    }
    render() {
        return(
        <ProgressBar now={100-this.state.percTimeNow} style={{ transform: 'rotate(-90deg)' }} onChange={this.checkTimeOut()}/>
        );
    }
}