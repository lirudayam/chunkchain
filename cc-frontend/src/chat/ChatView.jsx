import React from "react";
import Input from 'rsuite/lib/Input';
import InputGroup from 'rsuite/lib/InputGroup';
import Icon from 'rsuite/lib/Icon';
import { SingleMessage } from './SingleMessage';
import 'rsuite/dist/styles/rsuite-default.css';
import { Grid, Row, Col } from 'rsuite';
  
export class ChatView extends React.Component {
    constructor(props) {
        super(props);
        this.styles = {
            width: 300,
            marginBottom: 10
          };
      }

    render() {
      return (
        <div>
            <Row className="show-grid">
      <Col xs={8}>xs={8}</Col>
      <Col xs={16}>
            <SingleMessage />
          <InputGroup style={this.styles}>
            <Input />
            <InputGroup.Button>
              <Icon icon="long-arrow-up" />
            </InputGroup.Button>
          </InputGroup>
          </Col>
    </Row>
        </div>
      );
    }
  }