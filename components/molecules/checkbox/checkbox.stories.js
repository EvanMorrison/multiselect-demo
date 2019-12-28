import React from "react"; // eslint-disable-line no-unused-vars
import { storiesOf } from "@storybook/react";
import { Checkbox } from "../../citadel";
import { action } from "@storybook/addon-actions";
import { withKnobs, text } from "@storybook/addon-knobs";

class CheckboxWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checkStatus: false
    };
  }

  checkMe = () => {
    action("Checked!");
    this.setState({checkStatus: !this.state.checkStatus});
  }

  render() {
    return(
      <React.Fragment>
        <Checkbox
          checkStatus={this.state.checkStatus}
          label={text("label", "This is a sample Label")}
          info={text("info", "Sample info")}
          name={text("name", "Checkbox Name")}
          onCheck={this.checkMe}
        />
      </React.Fragment>
    );
  }
}

storiesOf("Molecules", module)
  .addDecorator(withKnobs)
  .add("Checkbox", () => (
    <CheckboxWrapper/>
  ));