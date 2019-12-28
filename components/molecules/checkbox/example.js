import Checkbox from "./";
import React from "react";
import { FlexGrid, FlexItem } from "flex-item";

class CheckboxExample extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      checkStatus: false
    };
  }

  checkMe() {
    this.setState({checkStatus: !this.state.checkStatus});
  }

  render() {
    const props = {
      checkStatus: this.state.checkStatus,
      className: "checkboxExample",
      info: "Here is a note",
      label: "Checkbox Example. Multiple lines will wrap.",
      name: "checkboxNoLabel",
      onCheck: () => this.checkMe()
    };

    const disabledProps = {
      className: "checkboxExample",
      disabled: true,
      label: "Disabled Checkbox"
    };

    return(
      <div>
        <FlexGrid>
          <FlexItem>
            <Checkbox {...props}/>
          </FlexItem>
          <FlexItem size={3}></FlexItem>
        </FlexGrid>
        <br />
        <br />
        <div>Disabled:</div>
        <br />
        <Checkbox {...disabledProps}/>
        <br />
        <br />
        <div>No Label:</div>
        <br />
        <Checkbox {...props} disabled noLabel/>
      </div>
    );
  }
}

export default CheckboxExample;
