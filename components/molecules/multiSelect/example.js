import FormLinker from "form-linker";
import MultiSelect from "./";
import React from "react";

class MultiSelectExample extends React.Component {
  constructor(props) {
    super(props);

    this.fl = new FormLinker({});
  }

  render() {
    return(<MultiSelect formLinker={this.fl} name="multi"/>);
  }
}

export default MultiSelectExample;