import Inner from "./inner";
import InnerAlt from "./innerAlt";
import PropTypes from "prop-types";
import React from "react";
import { sortBy } from "lodash";

class MultiSelect extends React.Component {
  blur() {
    this.innerRef.getInstance().blur();
  }

  focus() {
    this.innerRef.getInstance().focus();
  }

  selectAll() {
    this.innerRef.getInstance().handleSelectAll();
  }

  removeAll(options = {removeAll: true}) {
    this.innerRef.getInstance().handleRemove(options);
  }

  render() {
    if(this.props.checkboxes) {
      return(<InnerAlt ref={el => { this.innerRef = el; }} {...this.props} selectedOptions={sortBy(this.props.formLinker.getValue(this.props.name), ["sortGroup", "label"])}/>);
    }
    return(<Inner ref={el => { this.innerRef = el; }} {...this.props} selectedOptions={sortBy(this.props.formLinker.getValue(this.props.name), ["sortGroup", "label"])}/>);
  }
}

MultiSelect.componentDescription = "MultiSelect a dropdown with selectable options with a search field to narrow the results of available options. supports arrow keys, enter, and backspace functionality";
MultiSelect.componentKey = "multiSelect";
MultiSelect.componentName = "Form Field Multi Select";

MultiSelect.propDescriptions = {
  checkboxes: "Uses the checkbox style multiselect.",
  disabled: "Multi select is disabled.",
  formLinker: "Form linker instance.",
  name: "Used as a unique identifier for this input in its form. Duplicate names can be used as long as they are in seperate forms.",
  onBlur: "Callback function when input is blurred.",
  onChange: "Callback function when input is changed.",
  onFocus: "Callback function when input is focused.",
  options: "Array of objects to provide the select options.",
  columns: "The number of columns for the available options list from 1 to 4, defaults to 2.",
  placeholder: "placeholder text for the input",
  showAllSelected: "Whether to show all selected options when input does not have focus or substitute a one-line string truncated with \"...\" for overflow",
  size: "Size of multiselect input. Options are \"lg\", \"md\", and \"sm\". Defaults to md",
  userEntries: "Type in your own option in the multiselect.",
  _update: "Private callback function to rerender parent on input change, focus, or blur."
};

MultiSelect.propTypes = {
  /** Uses the checkbox style multiselect. */
  checkboxes: PropTypes.bool,
  /** Multi select is disabled. */
  disabled: PropTypes.bool,
  /** Enables adding user-created entries */
  userEntries: PropTypes.bool,
  /** Form linker instance. */
  formLinker: PropTypes.object.isRequired,
  /** Used as a unique identifier for this input in its form. Duplicate names can be used as long as they are in seperate forms. */
  name: PropTypes.string.isRequired,
  /** Callback function when input is blurred. */
  onBlur: PropTypes.func,
  /** Callback function when input is changed. */
  onChange: PropTypes.func,
  /** Callback function when input is focused. */
  onFocus: PropTypes.func,
  /** Array of objects to provide the select options. */
  options: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    sortGroupLabel: PropTypes.string,
    sortGroupOrder: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  })),
  /** The number of columns for the available options list from 1 to 4, defaults to 2. */
  columns: PropTypes.oneOf([1, 2, 3, 4]),
  /** Placeholder text for the input. */
  placeholder: PropTypes.string,
  /** Whether to show all selected options when input does not have focus or substitute a one-line string truncated with "..." for overflow. */
  showAllSelected: PropTypes.bool,
  /** Size of multiselect input. Options are "lg", "md", and "sm". Defaults to md. */
  size: PropTypes.oneOf(["lg", "md", "sm"]),
  /** Private callback function to rerender parent on input change, focus, or blur. */
  _update: PropTypes.func
};

MultiSelect.defaultProps = {
  disabled: false,
  onChange: () => {},
  onFocus: () => {},
  onBlur: () => {},
  onKeyPress: () => {},
  options: [],
  columns: 2,
  size: "md",
  _update: () => {}
};

export default MultiSelect;
