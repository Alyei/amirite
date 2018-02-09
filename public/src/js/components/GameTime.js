import React from "react";
import { ProgressBar } from "react-bootstrap";

export default class GameTime extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            timeLimit: 0,
            timeNow: 0,
            startTime: Date.now(),
            timerIntervalId: null
        }
        //this.checkTimeOut = this.checkTimeOut.bind(this);
    }
    componentDidMount() {
        var intervalId = setInterval(this.timer(), 500);
        // store intervalId in the state so it can be accessed later:
        this.setState({timerIntervalId: intervalId});
    }
    
    componentWillUnmount() {
       this.deleteInterval();
    }
    
    getPercentageTimeNow() {
        return Math.round(((this.state.timeNow/this.props.timeLimit)*100)*100)/100;
    }

    timer() {
       // setState method is used to update the state
       this.setState({ timeNow: this.state.timeNow + 0.05 });
       //this.checkTimeOut();
    }
    deleteInterval() {
       // use intervalId from the state to clear the interval
       clearInterval(this.state.timerIntervalId);
    }
/*
    checkTimeOut() {
        if(this.state.timeNow === 0)
        {
            this.props.onTimeOut();
            this.deleteInterval();
        }
    }*/
    render() {
        return(
        <ProgressBar now={100-this.getPercentageTimeNow()} style={{ transform: 'rotate(-90deg)' }}/>//{onChange={this.checkTimeOut()}/>}
        );
    }
}