import Icon from "../../atoms/icon";
import OnClickOutside from "react-onclickoutside";
import React from "react";
import Style from "./multiSelect.style";
import { renderAvailablePills } from "./renderPillsUtil";
import { findIndex, isEmpty, isNil, sortBy, throttle, unionBy } from "lodash";
import { ClassNames } from "@emotion/core";
import { withTheme } from "emotion-theming";

class MultiSelect extends React.Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
    this.containerRef = React.createRef();
    this.availableRef = React.createRef();
    this.pillRef = React.createRef();
    this.lastScrollTop = 0;
    this.lastScrollChange = 0;

    this._UP_KEY = 38;
    this._DOWN_KEY = 40;
    this._ENTER_KEY = 13;
    this._ESC_KEY = 27;
    this._BACKSPACE = 8;
    this._TAB = 9;

    this._INPUT_INDEX = -2;
    this._SELECT_ALL_INDEX = -1;

    this._COLUMN_RENDER_COUNT = 100;
    this._BOX_HEIGHT = 300;
    this._THROTTLE_RATE = 15;

    let {options, selectedOptions} = props;
    let union = unionBy(selectedOptions, options, "value");
    let sortedOptions = sortBy(union, ["sortGroupOrder", option => option.label.toLowerCase()]);
    let optionsMap = new Map();
    sortedOptions.forEach(option => {
      optionsMap.set(option, false);
    });
    selectedOptions.forEach(option => {
      optionsMap.set(option, true);
    });

    this.state = {
      focusedIndex: this._INPUT_INDEX,
      isFocused: false,
      allChecked: false,
      availablePills: this.availablePills([...optionsMap.keys()]),
      availableFirstRendered: 0,
      availableLastRendered: Math.min(Math.ceil(optionsMap.size / props.columns), this._COLUMN_RENDER_COUNT),
      open: false,
      optionsMap,
      scroll: 0
    };

    this._onAvailableBoxScroll = throttle(this.handleAvailableBoxScroll, this._THROTTLE_RATE);
  }

  componentDidUpdate(prevProps, prevState) {
    if(prevProps.options !== this.props.options && !isEmpty(this.props.options)) {
      let union = unionBy(this.props.selectedOptions, this.props.options, "value");
      let sorted = sortBy(union, ["sortGroupOrder", option => option.label.toLowerCase()]);
      let optionsMap = new Map();
      sorted.forEach(option => {
        optionsMap.set(option, false);
      });
      this.props.selectedOptions.forEach(option => {
        optionsMap.set(option, true);
      });
      const availableFirstRendered = 0;
      const availableLastRendered = Math.min(Math.ceil(optionsMap.size / this.props.columns), this._COLUMN_RENDER_COUNT);
      this.onChange({optionsMap, availablePills: this.availablePills([...optionsMap.keys()]), availableFirstRendered, availableLastRendered, open: this.state.open});
    }

    if(isNil(this.state.optionsMap.get(this.props.selectedOptions[0])) && !isEmpty(this.props.selectedOptions)) {
      let {options, selectedOptions} = this.props;
      let union = unionBy(selectedOptions, options, "value");
      let sorted = sortBy(union, ["sortGroupOrder", option => option.label.toLowerCase()]);
      let optionsMap = new Map();
      sorted.forEach(option => {
        optionsMap.set(option, false);
      });
      selectedOptions.forEach(option => {
        optionsMap.set(option, true);
      });
      this.onChange({optionsMap, availablePills: this.availablePills([...optionsMap.keys()]), open: this.state.open});
    }

    if(!isEmpty(prevProps.selectedOptions) && isEmpty(this.props.selectedOptions)) {
      let notAllCleared = new Set(this.state.optionsMap.values()).has(true);
      if(notAllCleared) {
        let optionsMap = new Map();
        let sorted = sortBy(this.props.options, ["sortGroupOrder", option => option.label.toLowerCase()]);
        sorted.forEach(option => {
          optionsMap.set(option, false);
        });
        this.onChange({optionsMap, availablePills: this.availablePills([...optionsMap.keys()]), open: this.state.open});
      }
    }

    if(prevState.availablePills.length !== this.state.availablePills.length && this.state.open) {
      this.handleAvailableBoxScroll(prevState.availablePills.length - this.state.availablePills.length);
    }
  }

  componentWillUnmount() {
    if(this.availableRef.current) {
      this.availableRef.current.removeEventListener("scroll", this._onAvailableBoxScroll);
    }
  }

  availablePills(optionsAvailable = [...this.state.optionsMap.keys()]) {
    let input = this.inputRef.current;
    let search = "";
    if(!isNil(input)) {
      search = input.value;
    }
    if(isEmpty(search)) {
      return(optionsAvailable);
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
    this.setState({isFocused: false, focusedIndex: this._INPUT_INDEX}, () => {
      this.props.formLinker.validate(this.props.name);
      this.inputRef.current.value = "";
      this.inputRef.current.blur();
      this.onChange({open: false});
      this.props.onBlur();
    });
  }

  checkEscape(keyCode) {
    if(keyCode === this._ESC_KEY && this.availableRef.current) {
      this.availableRef.current.removeEventListener("scroll", this._onAvailableBoxScroll);
      this.onChange({open: false, focusedIndex: this._INPUT_INDEX, availableFirstRendered: 0, availableLastRendered: Math.min(Math.ceil(this.state.availablePills.length / this.props.columns), this._COLUMN_RENDER_COUNT)});
    }
  }

  checkMoveDown(keyCode, availableCount) {
    if(keyCode !== this._DOWN_KEY) { return(null); }

    let focus = this.state.focusedIndex + 1;

    if(focus > (availableCount - 1)) {
      focus = (availableCount - 1);
    }
    if(!this.state.open) {
      this.setState({focusedIndex: focus, open: true}, () => {
        this.availableRef.current.addEventListener("scroll", this._onAvailableBoxScroll);
      });
    } else {
      this.setState({focusedIndex: focus}, () => {
        this.keepActivePillVisible();
      });
    }
  }

  checkMoveUp(keyCode) {
    if(keyCode !== this._UP_KEY) { return(null); }

    let focus = this.state.focusedIndex - 1;

    if(focus < this._INPUT_INDEX) {
      focus = this._INPUT_INDEX;
    }
    this.setState({focusedIndex: focus}, () => {
      this.keepActivePillVisible();
    });
  }

  checkRemoveAll(keyCode) {
    if(keyCode === this._ENTER_KEY && this.state.focusedIndex === this._SELECT_ALL_INDEX && this.state.allChecked) {
      this.handleRemove();
    }
  }

  checkResetIndex(keyCode) {
    if([this._UP_KEY, this._DOWN_KEY, this._ENTER_KEY, this._ESC_KEY, this._BACKSPACE].indexOf(keyCode) !== -1) { return(null); }

    this.onChange({focusedIndex: this._INPUT_INDEX});
  }

  checkSelectPill(keyCode, pillsAvailable) {
    if(keyCode !== this._ENTER_KEY) { return(null); }

    if(this.state.focusedIndex > this._SELECT_ALL_INDEX) {
      const option = pillsAvailable[this.state.focusedIndex];
      if(!isNil(option)) {
        this.handleSelectOne(option, false);
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
    if(this.props.disabled) { return(null); }

    if(!this.state.isFocused || !this.state.open) {
      this.setState({isFocused: true, open: true}, () => {
        this.availableRef.current.addEventListener("scroll", this._onAvailableBoxScroll);
        this.inputRef.current.value = "";
        this.inputRef.current.focus();
        this.inputRef.current.placeholder = "type to filter options";
        this.onChange({focusedIndex: this._INPUT_INDEX, availablePills: this.availablePills(), availableFirstRendered: 0, availableLastRendered: Math.min(Math.ceil(this.state.availablePills.length / this.props.columns), this._COLUMN_RENDER_COUNT)});
      });
      this.props.formLinker.setError(this.props.name, []);
      this.props._update();
      this.props.onFocus();
    }
  }

  handleAvailableBoxScroll = (availableCountChange) => {
    let {current} = this.availableRef;
    if(current) {
      let scrollChange = Math.abs(current.scrollTop - this.lastScrollTop);
      if(availableCountChange || (scrollChange > 5 && scrollChange !== this.lastScrollChange)) {
        let percentScrolled = (current.scrollTop + this._BOX_HEIGHT / 2) / current.scrollHeight;
        let count = this.state.availablePills.length;
        let position = Math.round(count / this.props.columns * percentScrolled);
        let availableFirstRendered = Math.max(0, position - Math.round(this._COLUMN_RENDER_COUNT / 2));
        let availableLastRendered = Math.min(count, availableFirstRendered + this._COLUMN_RENDER_COUNT);
        this.lastScrollTop = current.scrollTop;
        this.lastScrollChange = scrollChange;
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
    this.checkRemoveAll(keyCode);
    this.checkResetIndex(keyCode);
    this.checkTabOut(keyCode);
  }

  handleRemove() {
    if(this.props.disabled) { return(null); }

    let optionsMap = new Map(this.state.optionsMap);
    let {focusedIndex, open} = this.state;
    optionsMap.forEach((__, k) => {
      optionsMap.set(k, false);
    });
    this.props.formLinker.setValue(this.props.name, []);
    focusedIndex = this._INPUT_INDEX;
    let availablePills = [...optionsMap.keys()];
    this.inputRef.current.value = "";
    this.onSelectionChange({availablePills, focusedIndex, open, optionsMap});
  }

  handleRemoveAllClick(e) {
    e.stopPropagation();
    this.handleRemove();
  }

  handleSelectAll() {
    let optionsMap = new Map(this.state.optionsMap);
    let {allChecked, availablePills} = this.state;

    if(this.inputRef.current.value === "") {
      optionsMap.forEach((__, k) => {
        optionsMap.set(k, !allChecked);
      });
      if(!allChecked) {
        this.props.formLinker.setValue(this.props.name, [...optionsMap.keys()]);
      } else {
        this.props.formLinker.setValue(this.props.name, []);
      }
    } else {
      availablePills.forEach(option => {
        optionsMap.set(option, !allChecked);
      });
      let selectedOptions = [];
      optionsMap.forEach((v, k) => {
        if(v) { selectedOptions.push(k); }
      });
      this.props.formLinker.setValue(this.props.name, selectedOptions);
    }

    availablePills = [...optionsMap.keys()];
    this.inputRef.current.value = "";
    this.onSelectionChange({focusedIndex: this._INPUT_INDEX, availablePills, optionsMap});
  }

  handleSelectOne = (option, isMouseSelect) => {
    let optionsMap = new Map(this.state.optionsMap);
    optionsMap.set(option, !optionsMap.get(option));

    let focusedIndex;
    if(this.state.availablePills.length < this.state.optionsMap.size) {
      focusedIndex = this._INPUT_INDEX;
    } else if(isMouseSelect) {
      focusedIndex = findIndex([...optionsMap.keys()], val => val.label === option.label);
    } else if(this.state.focusedIndex >= 0 && this.state.focusedIndex < this.state.availablePills.length - 1) {
      focusedIndex = this.state.focusedIndex + 1;
    } else {
      focusedIndex = this.state.availablePills.length - 1;
    }

    let selectedOptions = [];
    optionsMap.forEach((v, k) => {
      if(v) { selectedOptions.push(k); }
    });
    this.props.formLinker.setValue(this.props.name, selectedOptions);
    this.inputRef.current.value = "";
    this.onSelectionChange({focusedIndex, availablePills: [...optionsMap.keys()], optionsMap});
  }

  keepActivePillVisible() {
    let pill = this.pillRef.current;
    let box = this.availableRef.current;
    if(pill) {
      let pillTop = pill.getBoundingClientRect().top;
      let boxTop = box.getBoundingClientRect().top;
      if(pillTop - boxTop > 290) {
        box.scrollTop = box.scrollTop + (pillTop - boxTop - 240);
      } else if(pillTop - boxTop < -10) {
        box.scrollTop = box.scrollTop + (pillTop - boxTop - 10);
      }
    }
  }

  onChange(newState = {}) {
    if(isEmpty(newState)) {
      newState.availablePills = this.availablePills();
    }
    let availableCount = (newState.availablePills || this.state.availablePills).length;
    if((this.props.formLinker.getValue(this.props.name) || []).length === this.state.optionsMap.size && this.state.optionsMap.size > 0) {
      newState.allChecked = true;
    } else if(availableCount < this.state.optionsMap.size) {
      let allChecked = true;
      for(let pill of newState.availablePills || this.state.availablePills) {
        if(!this.state.optionsMap.get(pill)) {
          allChecked = false;
          break;
        }
      }
      newState.allChecked = allChecked;
    } else {
      newState.allChecked = false;
    }
    if(isNil(newState.open)) { newState.open = true; }
    this.props._update();
    this.props.onChange();
    this.setState({
      ...newState
    }, () => {
      if(this.state.open) {
        this.keepActivePillVisible();
      }
    });
  }

  onSelectionChange(newState = {}) {
    this.setState({optionsMap: newState.optionsMap}, () => {
      if(this.state.open) {
        this.inputRef.current.focus();
      } else {
        this.props.formLinker.validate(this.props.name);
      }
      if(this.state.availablePills.length === this.state.optionsMap.size) {
        this.onChange(newState);
      } else {
        setTimeout(() => {
          this.onChange(newState);
        }, 500);
      }
    });
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
    if(this.state.optionsMap.size === 0) {
      return(<div>Loading...</div>);
    }
    if(isEmpty(this.state.availablePills)) {
      return(<div className="no-results">No results found</div>);
    }
    const classes = {
      "active": this.state.focusedIndex === this._SELECT_ALL_INDEX,
      "remove-all-selected": this.state.allChecked,
      "select-all": !this.state.allChecked
    };
    const pillLabel = this.state.allChecked ? "Uncheck All" : "Select All";
    return(
      <ClassNames>
        {({cx}) => (<div className={cx(classes)} ref={classes.active ? this.pillRef : null} onClick={() => this.handleSelectAll()}>{pillLabel}</div>)}
      </ClassNames>
    );
  }

  renderSelected() {
    const {selectedOptions} = this.props;
    if(!this.state.isFocused && !this.props.showAllSelected && !isNil(this.inputRef.current)) {
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

      for(let i = 0, len = selectedOptions.length; i < len; i++) {
        shownItems.push(selectedOptions[i].label);
        displayStr = shownItems.join(", ");
        while(ruler.measureText(displayStr).width > maxWidth && shownItems.length > 1) {
          shownItems.pop();
          displayStr = shownItems.join(", ") + "...";
          i = len;
        }
      }
      this.inputRef.current.placeholder = this.props.placeholder || "";
      return(displayStr);
    }

    if(isNil(this.inputRef.current)) {
      this.setTimeout = setTimeout(() => {
        this.forceUpdate();
      });
      return("");
    } else if(!this.state.isFocused && this.props.showAllSelected) {
      this.inputRef.current.placeholder = this.props.placeholder || "";
      return((selectedOptions).map(option => option.label).join(", "));
    } else {
      this.inputRef.current.placeholder = "type to filter options";
      return("");
    }
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

    let inputStyle = {width: "100%"};
    if(!this.state.isFocused && (this.props.formLinker.getValue(this.props.name) || []).length) {
      inputStyle = {width: 0, height: 0, opacity: 0};
    }

    return(
      <Style id={this.props.name} className="multi-select" boxHeight={this._BOX_HEIGHT} onKeyDown={(e) => this.handleKeyDown(e)}>
        <ClassNames>
          {({cx}) => (
            <div className={cx(classes)} ref={this.containerRef} onClick={() => this.focus()}>
              <div className="pills-wrapper" id="pills-wrapper">
                {!this.state.isFocused && this.renderSelected()}
                <input ref={this.inputRef} className="multi-select-input" style={inputStyle} autoComplete="off" id={this.props.name} name={this.props.name} onChange={() => this.onChange()} onFocus={() => this.focus()} disabled={this.props.disabled}/>
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

export default withTheme(OnClickOutside(MultiSelect));
