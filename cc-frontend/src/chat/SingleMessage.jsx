import React from "react";
import { Timeline, Button, Modal, Icon } from 'rsuite';
import { MessageBox, ChatBlock } from 'react-chat-elements'
import 'react-chat-elements/dist/main.css';

export class SingleMessage extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        show: false
      };
      this.close = this.close.bind(this);
      this.open = this.open.bind(this);
    }
    close() {
      this.setState({ show: false });
    }
    open() {
      this.setState({ show: true });
    }
    render() {
      return (
        <div className="modal-container">
            <div>
            <MessageBox
    position={'right'}
    type={'text'}
    text={'Hallo, wie geht es dir?'}
    status={'waiting'}
    onClick={this.open} />
    <MessageBox
    position={'left'}
    type={'text'}
    text={'Zeig, mal her!'}
    onClick={this.open} />
          </div>
  
          <Modal show={this.state.show} onHide={this.close}>
            <Modal.Header>
              <Modal.Title>Verlauf der Nachricht</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <Timeline className="custom-timeline">
    <Timeline.Item dot={<Icon icon="wechat" size="2x" />}>
      <p>10:20:21</p>
      <p>Nachricht geschrieben</p>
    </Timeline.Item>
    <Timeline.Item>
      <p>10:20:22</p>
      <p>Nachricht in Unconfirmed Transactions gelandet</p>
    </Timeline.Item>
    <Timeline.Item dot={<Icon icon="hourglass-2" size="2x" />}>
      <p>10:20:23</p>
      <p>Nachricht wartet in Block aufgenommen zu werden</p>
    </Timeline.Item>
    <Timeline.Item
      dot={
        <Icon
          icon="thumbs-up"
          size="2x"
          style={{ background: '#15b215', color: '#fff' }}
        />
      }
    >
      <p>10:20:50</p>
      <p>Nachricht wurde in Block 0xabc von abc_def gemined.</p>
    </Timeline.Item>
    <Timeline.Item dot={<Icon icon="user" size="2x" />}>
      <p>10:20:51</p>
      <p>[angekommen]</p>
      <p>Nachricht zugestellt an def_ghi</p>
    </Timeline.Item>
    
  </Timeline>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={this.close} appearance="primary">
                Ok
              </Button>
              <Button onClick={this.close} appearance="subtle">
                Cancel
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      );
    }
  }
  
  