import Icon from "../../atoms/icon";
import OnClickOutside from "react-onclickoutside";
import React from "react";
import Style from "./multiSelect.style";
import { renderAvailablePills } from "./renderPillsUtil";
import { differenceBy, findIndex, isEmpty, isNil, sortBy, throttle } from "lodash";
import { ClassNames } from "@emotion/core";

class MultiSelect extends React.Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
    this.containerRef = React.createRef();
    this.availableRef = React.createRef();
    this.lastAvailableScrollTop = 0;
    this.lastAvailableScrollChange = 0;

    this._UP_KEY = 38;
    this._DOWN_KEY = 40;
    this._ENTER_KEY = 13;
    this._ESC_KEY = 27;
    this._BACKSPACE = 8;
    this._TAB = 9;

    this._REMOVE_ALL_INDEX = -3;
    this._INPUT_INDEX = -2;
    this._SELECT_ALL_INDEX = -1;

    this._AVAILABLE_RENDER_COUNT = 100;
    this._BOX_HEIGHT = 300;
    this._SELECTED_RENDER_COUNT = 100;
    this._THROTTLE_RATE = 15;

    let sortedOptions = sortBy(this.props.options, ["sortGroupOrder", (option) => option.label.toLowerCase()]);
    let optionsAvailable = differenceBy(sortedOptions, this.props.formLinker.getValue(this.props.name), "value");
    this.state = {
      focusedIndex: this._INPUT_INDEX,
      inputWidth: isEmpty(props.formLinker.getValue(this.props.name)) ? null : 16,
      isFocused: false,
      optionsAvailable: optionsAvailable,
      availablePills: [...optionsAvailable],
      availableFirstRendered: 0,
      availableLastRendered: Math.min(Math.ceil(optionsAvailable.length / props.columns), this._AVAILABLE_RENDER_COUNT),
      selectedFirstRendered: 0,
      selectedLastRendered: this._SELECTED_RENDER_COUNT,
      scroll: 0
    };
    this._onAvailableBoxScroll = throttle(this.handleAvailableBoxScroll, this._THROTTLE_RATE);
    this._onSelectedBoxScroll = throttle(this.handleSelectBoxScroll, this._THROTTLE_RATE);
  }

  componentDidMount() {
    let selectedOptions = this.props.formLinker.getValue(this.props.name);
    if(!isEmpty(selectedOptions)) {
      this.props.formLinker.setValue(this.props.name, sortBy(selectedOptions, ["sortGroupOrder", (option) => option.label.toLowerCase()]));
    }
    this.renderSelectedPills();
    this.containerRef.current.addEventListener("scroll", this._onSelectedBoxScroll);
  }

  componentDidUpdate(prevProps, prevState) {
    if(prevProps.options !== this.props.options) {
      let { options } = this.props;
      let optionsAvailable = differenceBy(sortBy(options, ["sortGroupOrder", (option) => option.label.toLowerCase()]), this.props.formLinker.getValue(this.props.name), "value");
      let availableFirstRendered = 0;
      let availableLastRendered = Math.min(Math.ceil(optionsAvailable.length / this.props.columns), this._AVAILABLE_RENDER_COUNT);
      this.setState({optionsAvailable, availablePills: this.availablePills(optionsAvailable), availableFirstRendered, availableLastRendered});
    }

    if(prevProps.selectedOptions !== this.props.selectedOptions && !this.state.isFocused) {
      let {options, selectedOptions} = this.props;
      let optionsAvailable = differenceBy(sortBy(options, ["sortGroupOrder", (option) => option.label.toLowerCase()]), selectedOptions, "value");
      let inputWidth = null;
      if(selectedOptions.length) { inputWidth = 2; }
      this.setState({optionsAvailable, availablePills: this.availablePills(optionsAvailable), inputWidth});
    }

    if(prevState.availablePills.length !== this.state.availablePills.length && this.state.open) {
      this.handleAvailableBoxScroll(prevState.availablePills.length - this.state.availablePills.length);
    }
  }

  componentWillUnmount() {
    if(this.containerRef.current) {
      this.containerRef.current.removeEventListener("scroll", this._onSelectedBoxScroll);
    }
    if(this.availableRef.current) {
      this.availableRef.current.removeEventListener("scroll", this._onAvailableBoxScroll);
    }
  }

  availablePills(optionsAvailable) {
    let input = this.inputRef.current;
    let search = "";
    if(!isNil(input)) {
      search = input.value;
    }
    if(isEmpty(search)) {
      return([...optionsAvailable]);
    }
    return(optionsAvailable.filter(option => {
      return(
        option.label.toLowerCase().includes(search.toLowerCase()) ||
        (option.sortGroupLabel && option.sortGroupLabel.toLowerCase().includes(search.toLowerCase()))
      );
    }));
  }

  blur() {
    if(this.state.open && this.availableRef.current) { this.availableRef.current.removeEventListener("scroll", this._onAvailableBoxScroll); }
    this.setState({isFocused: false, focusedIndex: this._INPUT_INDEX, open: false});
    this.props.formLinker.validate(this.props.name);
    this.inputRef.current.value = "";
    this.handleResize();
    this.inputRef.current.blur();
    this.props.onBlur();
  }

  checkEscape(keyCode) {
    if(keyCode === this._ESC_KEY) {
      if(this.availableRef.current) { this.availableRef.current.removeEventListener("scroll", this._onAvailableBoxScroll); }
      this.setState({open: false, focusedIndex: this._INPUT_INDEX});
    }
  }

  checkMoveDown(keyCode, availableCount) {
    if(keyCode !== this._DOWN_KEY) { return(null); }

    let focus = this.state.focusedIndex;
    focus += 1;
    if(focus > (availableCount - 1)) {
      focus = (availableCount - 1);
    }
    if(this.state.optionsAvailable.length === 0) {
      focus = this._REMOVE_ALL_INDEX;
    }
    this.setState({focusedIndex: focus, open: true}, () => {
      this.availableRef.current.addEventListener("scroll", this._onAvailableBoxScroll);
    });
  }

  checkMoveUp(keyCode) {
    if(keyCode !== this._UP_KEY) { return(null); }

    let focus = this.state.focusedIndex;
    focus -= 1;
    if(focus < this._INPUT_INDEX) {
      focus = this._INPUT_INDEX;
    }
    this.setState({focusedIndex: focus});
  }

  checkRemoveAll(keyCode) {
    if(keyCode === this._ENTER_KEY && this.state.focusedIndex === this._REMOVE_ALL_INDEX) {
      this.handleRemove({removeAll: true});
    }
  }

  checkRemovePill(keyCode) {
    const input = this.inputRef.current;
    const hasNoValue = input.value.length === 0;
    const selectedItemCount = this.props.formLinker.getValue(this.props.name).length;

    if(keyCode === this._BACKSPACE && hasNoValue && selectedItemCount > 0) {
      this.handleRemoveLast();
    }
  }

  checkResetIndex(keyCode, availableCount) {
    if([this._UP_KEY, this._DOWN_KEY, this._ENTER_KEY, this._BACKSPACE].indexOf(keyCode) !== -1) { return(null); }

    let {selectedFirstRendered, selectedLastRendered} = this.state;
    selectedLastRendered = Math.max(this.props.formLinker.getValue(this.props.name).length, this._SELECTED_RENDER_COUNT);
    selectedFirstRendered = Math.max(selectedLastRendered - this._SELECTED_RENDER_COUNT, 0);
    this.handleResize({focusedIndex: this._INPUT_INDEX, selectedFirstRendered, selectedLastRendered});
  }

  checkSelectPill(keyCode, pillsAvailable) {
    if(keyCode !== this._ENTER_KEY) { return(null); }

    if(isEmpty(this.state.availablePills) && this.props.userEntries) {
      // this adds ability for user to add their own entries
      let entries = this.inputRef.current.value.split(",");
      let newEntries = entries.map(data => {
        let entry = data.trim();
        return({
          value: entry,
          label: entry
        });
      });

      const selectedOptions = [...this.props.selectedOptions];
      const options = selectedOptions.concat(newEntries);
      this.props.formLinker.setValue(this.props.name, options);
    }

    if(this.state.focusedIndex > this._SELECT_ALL_INDEX) {
      const option = pillsAvailable[this.state.focusedIndex];
      if(!isNil(option)) {
        this.handleSelectOne(option.value, false);
      }
    }
  }

  checkSelectAll(keyCode) {
    if(keyCode === this._ENTER_KEY && (this.state.focusedIndex === this._SELECT_ALL_INDEX || this.state.focusedIndex === this._INPUT_INDEX)) {
      this.handleSelectAll();
    }
  }

  checkTabOut(keyCode) {
    if(keyCode === this._TAB) { this.blur(); }
  }

  focus() {
    if(!this.state.isFocused) {
      this.setState({isFocused: true, open: true}, () => {
        this.availableRef.current.addEventListener("scroll", this._onAvailableBoxScroll);
        this.handleResize({focusedIndex: this._INPUT_INDEX});
      });
      this.props.formLinker.setError(this.props.name, []);
      this.props._update();
      this.props.onFocus();
    }
  }

  handleAvailableBoxScroll = (availableCountChange) => {
    let {current} = this.availableRef;
    if(current && current.scrollHeight) {
      let scrollChange = Math.abs(current.scrollTop - this.lastAvailableScrollTop);
      if(availableCountChange || (scrollChange > 5 && scrollChange !== this.lastAvailableScrollChange)) {
        let percentScrolled = (current.scrollTop + this._BOX_HEIGHT / 2) / current.scrollHeight;
        let count = this.state.availablePills.length;
        let position = Math.round(count / this.props.columns * percentScrolled);
        let availableFirstRendered = Math.max(0, position - Math.round(this._AVAILABLE_RENDER_COUNT / 2));
        let availableLastRendered = Math.min(count, availableFirstRendered + this._AVAILABLE_RENDER_COUNT) || 6;
        this.lastAvailableScrollTop = current.scrollTop;
        this.lastAvailableScrollChange = scrollChange;
        this.setState({availableFirstRendered, availableLastRendered});
      }
    }
  }

  handleClickOutside(e) {
    if(this.state.isFocused) {
      this.blur();
    }
  }

  handleKeyDown(event) {
    const keyCode = event.which;
    const {availablePills} = this.state;
    const availableCount = availablePills.length;

    this.preventDefault(keyCode, event);
    this.checkEscape(keyCode);
    this.checkMoveUp(keyCode);
    this.checkMoveDown(keyCode, availableCount);
    this.checkSelectPill(keyCode, availablePills);
    this.checkSelectAll(keyCode);
    this.checkRemovePill(keyCode);
    this.checkRemoveAll(keyCode);
    this.checkResetIndex(keyCode, availableCount);
    this.checkTabOut(keyCode);
  }

  handleFocus() {
    if(!this.state.open) {
      this.setState({open: true}, () => {
        if(this.state.isFocused) { this.availableRef.current.addEventListener("scroll", this._onAvailableBoxScroll); }
        this.handleResize({focusedIndex: this._INPUT_INDEX});
      });
    }
    let {current} = this.containerRef;
    let position = current.scrollTop;
    this.inputRef.current.focus();
    current.scrollTop = position;
  }

  handleRemove({removeAll, removeOption}) {
    if(this.props.disabled) { return(null); }

    let optionsAvailable = [...this.state.optionsAvailable];
    let availablePills = [...this.state.availablePills];
    let {selectedFirstRendered, selectedLastRendered} = this.state;
    if(removeAll) {
      optionsAvailable = sortBy(this.props.options, ["sortGroupOrder", (option) => option.label.toLowerCase()]);
      availablePills = [...optionsAvailable];
      this.props.formLinker.setValue(this.props.name, []);
      selectedFirstRendered = 0;
      selectedLastRendered = this._SELECTED_RENDER_COUNT;
      if(this.state.open) { this.handleFocus(); }
    } else {
      let selectedOptions = [...this.props.formLinker.getValue(this.props.name)];
      let index = findIndex(selectedOptions, removeOption);
      removeOption = selectedOptions.splice(index, 1)[0];
      const option = this.props.options.find(option => option.value === removeOption.value);

      if(!isNil(option)) {
        optionsAvailable = sortBy([...optionsAvailable, removeOption], ["sortGroupOrder", (option) => option.label.toLowerCase()]);
        availablePills = sortBy([...availablePills, removeOption], ["sortGroupOrder", (option) => option.label.toLowerCase()]);
      }

      this.props.formLinker.setValue(this.props.name, selectedOptions);
    }
    this.inputRef.current.value = "";

    this.handleResize({optionsAvailable, availablePills, selectedFirstRendered, selectedLastRendered});
  }

  handleRemoveAllClick(e) {
    e.stopPropagation();
    this.handleRemove({removeAll: true});
  }

  handleRemoveLast() {
    let selectedOptions = this.props.formLinker.getValue(this.props.name);
    let removeOption = selectedOptions[selectedOptions.length - 1];
    this.handleRemove({removeOption});
  }

  handleResize(newState = {}) {
    if(isEmpty(newState)) {
      newState.availablePills = this.availablePills(this.state.optionsAvailable);
    }
    let inputText = this.inputRef.current.value;
    let inputWidth = (inputText.length + 2) * 8;
    if(inputText.length === 0 && isEmpty(this.props.formLinker.getValue(this.props.name))) {
      inputWidth = null;
    }
    this.props._update();
    this.props.onChange();
    this.setState({
      inputWidth: inputWidth,
      ...newState
    }, () => {
      if(newState.focusedIndex === this._INPUT_INDEX) {
        this.containerRef.current.scrollTop = this.containerRef.current.scrollHeight;
      }
    });
  }

  handleSelectAll() {
    const currentSelected = this.props.formLinker.getValue(this.props.name);
    let {availablePills, optionsAvailable, selectedFirstRendered, selectedLastRendered} = this.state;
    if(this.inputRef.current.value === "") {
      this.props.formLinker.setValue(this.props.name, sortBy(this.props.options, ["sortGroupOrder", (option) => option.label.toLowerCase()]));
      optionsAvailable = [];
    } else {
      const selectedOptions = [...availablePills];
      optionsAvailable = differenceBy(this.state.optionsAvailable, selectedOptions, "value");
      this.props.formLinker.setValue(this.props.name, sortBy([...currentSelected, ...selectedOptions], ["sortGroupOrder", (option) => option.label.toLowerCase()]));
    }

    let selectedCount = this.props.formLinker.getValue(this.props.name).length;
    if(selectedCount - selectedLastRendered > this._SELECTED_RENDER_COUNT) {
      selectedFirstRendered = selectedCount - this._SELECTED_RENDER_COUNT;
    }
    selectedLastRendered = selectedCount;

    this.handleResize({focusedIndex: this._INPUT_INDEX, optionsAvailable, availablePills: [...optionsAvailable], selectedFirstRendered, selectedLastRendered});
    this.inputRef.current.value = "";
  }

  handleSelectBoxScroll = () => {
    let {current} = this.containerRef;
    let scroll = Math.floor(current.scrollTop / (current.scrollHeight - this._BOX_HEIGHT) * 100);
    if(this.selectedScroll < 97 && scroll >= 97) {
      let selectedLastRendered = Math.min(this.props.formLinker.getValue(this.props.name).length, this.state.selectedLastRendered + this._SELECTED_RENDER_COUNT);
      this.setState({selectedLastRendered});
    } else if(scroll <= 5) {
      let selectedFirstRendered = Math.max(this.state.selectedFirstRendered - this._SELECTED_RENDER_COUNT, 0);
      if(selectedFirstRendered !== this.state.selectedFirstRendered) {
        let oldHeight = current.scrollHeight;
        this.setState({selectedFirstRendered}, () => {
          current.scrollTo(0, Math.round(0.05 * oldHeight + (current.scrollHeight - oldHeight)));
        });
      }
    }
    this.selectedScroll = scroll;
  }

  handleSelectOne = (value, isMouseSelect) => {
    let currentSelected = [...this.props.formLinker.getValue(this.props.name)];
    let optionsAvailable = [...this.state.optionsAvailable];
    let index = findIndex(optionsAvailable, {value});
    const selectedOption = optionsAvailable.splice(index, 1)[0];
    currentSelected = sortBy([...currentSelected, selectedOption], ["sortGroupOrder", (option) => option.label.toLowerCase()]);
    this.props.formLinker.setValue(this.props.name, currentSelected);

    const availablePills = [...optionsAvailable];
    let focusedIndex;
    if(isMouseSelect || this.state.availablePills.length !== this.state.optionsAvailable.length) {
      this.handleFocus();
      focusedIndex = this._INPUT_INDEX;
    } else if(this.state.focusedIndex > 0) {
      focusedIndex = this.state.focusedIndex - 1;
    } else {
      focusedIndex = 0;
    }
    let selectedLastRendered = this.state.selectedLastRendered + 1;
    this.inputRef.current.value = "";
    this.handleResize({focusedIndex, availablePills, optionsAvailable, selectedLastRendered});
  }

  handleUpdate() {
    this.props.onChange();
  }

  maskedValue(value) {
    return({valid: true, parsed: value, formatted: value, errors: []});
  }

  preventDefault(keyCode, event) {
    const input = this.inputRef.current;
    const hasNoValue = input.value.length === 0;

    if(([this._UP_KEY, this._DOWN_KEY, this._ENTER_KEY].indexOf(keyCode) !== this._SELECT_ALL_INDEX) || (keyCode === this._BACKSPACE && hasNoValue)) {
      event.preventDefault();
    }
  }

  renderAvailablePills() {
    if(!this.state.isFocused || !this.state.open) { return(null); }

    const availablePills = renderAvailablePills({
      state: this.state,
      props: this.props,
      pillRef: this.pillRef,
      handleClick: this.handleSelectOne
    });

    const classes = {
      "select-options-preview": true,
      "size-sm": this.props.size === "sm",
      "size-lg": this.props.size === "lg"
    };

    return(
      <ClassNames>
        {({cx}) => (
          <div className={cx(classes)} ref={this.availableRef}>
            <div css={{maxWidth: "50%", paddingRight: 8}}>
              {this.renderSelectAll()}
            </div>
            {availablePills}
          </div>
        )}
      </ClassNames>
    );
  }

  renderRemoveAll() {
    if(isEmpty(this.props.formLinker.getValue(this.props.name))) { return(null); }

    return(
      <div className="remove-all" onClick={(e) => this.handleRemoveAllClick(e)}><Icon name="times-sld"/></div>
    );
  }

  renderSelectAll() {
    if(isEmpty(this.state.optionsAvailable)) {
      let classes = {
        "active": this.state.focusedIndex === this._REMOVE_ALL_INDEX,
        "remove-all-selected": true
      };
      return(
        <ClassNames>
          {({cx}) => (<div>All Available Results Selected | <span className={cx(classes)} onClick={() => this.handleRemove({removeAll: true})}>Remove All</span></div>)}
        </ClassNames>
      );
    } else if(isEmpty(this.state.availablePills) && this.props.userEntries) {
      return(<div className="no-results">Press enter to add custom entry</div>);
    } else if(isEmpty(this.state.availablePills)) {
      return(<div className="no-results">No results found</div>);
    } else {
      const classes = {
        "select-all": true,
        "active": this.state.focusedIndex === this._SELECT_ALL_INDEX
      };
      return(
        <ClassNames>
          {({cx}) => (<div className={cx(classes)} onClick={() => this.handleSelectAll()}>Select All</div>)}
        </ClassNames>
      );
    }
  }

  renderSelectedPills() {
    if(isEmpty(this.props.formLinker.getValue(this.props.name))) { return(null); }

    if(!this.state.isFocused && !this.props.showAllSelected && !isNil(this.containerRef.current)) {
      const selectedItems = this.props.formLinker.getValue(this.props.name);
      let shownItems = [];
      let displayStr = "";
      const container = this.containerRef.current;
      const maxWidth = container.offsetWidth - 36;
      const ruler = ((element) => {
        const ctx = document.createElement("canvas").getContext("2d");
        const style = window.getComputedStyle(element);
        const fontSize = style.getPropertyValue("font-size");
        const fontFamily = style.getPropertyValue("font-family");
        ctx.font = `${fontSize} ${fontFamily}`;
        return(ctx);
      })(container);

      for(let i = 0, len = selectedItems.length; i < len; i++) {
        shownItems.push(selectedItems[i].label);
        displayStr = shownItems.join(", ");
        while(ruler.measureText(displayStr).width > maxWidth && shownItems.length > 1) {
          shownItems.pop();
          displayStr = shownItems.join(", ") + "...";
          i = len;
        }
      }
      return(
        <span className="select-option-text">{displayStr}</span>
      );
    }

    if(isNil(this.containerRef.current)) {
      this.setTimeout = setTimeout(() => {
        this.forceUpdate();
      });
      return(null);
    }

    return(this.props.formLinker.getValue(this.props.name).slice(this.state.selectedFirstRendered, this.state.selectedLastRendered).map((option, index) => {
      let classes = !isNil(option.classes) ? "pill " + option.classes.join(" ") : "pill";
      return(
        <div key={option.value} className={classes} onClick={() => this.handleRemove({removeOption: option})}>
          <span className="remove"><Icon name="times-sld"/></span>
          <span className="select-option-text">{option.label}</span>
        </div>
      );
    }));
  }

  render() {
    const classes = {
      "disabled": this.props.disabled,
      "focus": this.state.isFocused,
      "error": this.props.showErrorBorder,
      "select-box": true,
      "size-sm": this.props.size === "sm",
      "size-lg": this.props.size === "lg"
    };

    let style = {};
    if(isNil(this.state.inputWidth) || this.state.inputWidth > 200) {
      style["width"] = "100%";
    } else {
      style["width"] = this.state.inputWidth + "px";
    }

    let placeholder = this.props.placeholder;
    let inputValue = this.inputRef.current;
    if(isNil(inputValue)) {
      inputValue = "";
    } else {
      inputValue = inputValue.value;
    }
    if(!isEmpty(this.props.formLinker.getValue(this.props.name)) || !isEmpty(inputValue)) {
      placeholder = null;
    }

    return(
      <Style id={this.props.name} className="multi-select" boxHeight={this._BOX_HEIGHT} onKeyDown={(e) => this.handleKeyDown(e)}>
        <ClassNames>
          {({cx}) => (
            <div className={cx(classes)} ref={this.containerRef}>
              <div className="pills-wrapper" id="pills-wrapper" onClick={() => this.handleFocus()}>
                {this.renderSelectedPills()}
                <input ref={this.inputRef} placeholder={placeholder} style={style} className="multi-select-input" autoComplete="off" id={this.props.name} name={this.props.name} onChange={() => this.handleResize()} onFocus={() => this.focus()} disabled={this.props.disabled}/>
              </div>
              {this.renderRemoveAll()}
            </div>
          )}
        </ClassNames>
        {this.renderAvailablePills()}
      </Style>
    );
  }
}

export default OnClickOutside(MultiSelect);
