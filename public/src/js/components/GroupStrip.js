import React from "react";

export default class GroupStrip extends React.Component {
  render() {
    return (
      <ul>
        {this.props.groupList.map(function(listItem) {
          return <li key={listItem.id + Math.random}>{listItem.groupName}</li>;
        })}
      </ul>
    );
  }
}

/**
 *  Start of testobjects
 */
const Group1 = {
  groupName: "Group A",
  groupImg: "Path to Img",
  id: 1
};
const Group2 = {
  groupName: "Group B",
  groupImg: "Path to Img",
  id: 2
};
/**
 * End of Testobjects
 */