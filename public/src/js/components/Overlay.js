import React from 'react';
import { Tab, Tabs, Modal, Button } from 'react-bootstrap';

import RegistForm from './Login-RegForm.js';

import '../../css/overlay.css';

export default class Overlay extends React.Component {
  render() {
    const { showModal, defTab, ...props } = this.props;
    const tabsInstance = (
      <Tabs defaultActiveKey={defTab} animation={false} id="logRegTab">
        <Tab eventKey={1} title="Login">
          <RegistForm {...props} formType="login" />
        </Tab>
        <Tab eventKey={2} title="Register">
          <RegistForm {...props} formType="register" />
        </Tab>
      </Tabs>
    );

    return (
      <div>
        <Modal show={showModal} onHide={this.props.overlayClose}>
          <Modal.Title>Authentication</Modal.Title>
          <Modal.Body>{tabsInstance}</Modal.Body>
          <Modal.Footer>
            <Button onClick={this.props.overlayClose}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
