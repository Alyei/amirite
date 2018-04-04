import React from 'react';
import { Tab, Tabs, Modal, Button } from 'react-bootstrap';

import AuthForm from './AuthForm.js';

import '../../css/overlay.css';

export default class Overlay extends React.Component {
  render() {
    const { showModal, defTab, ...props } = this.props;

    return (
      <Modal show={showModal} onHide={this.props.closeModal} className="Modal">
        <Modal.Title>Authentification</Modal.Title>
        <Modal.Body>
          <Tabs defaultActiveKey={defTab} animation={false} id="logRegTab">
            <Tab eventKey={1} title="Login">
              <AuthForm {...props} formType="login" />
            </Tab>
            <Tab eventKey={2} title="Register">
              <AuthForm {...props} formType="register" />
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.closeModal}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}
