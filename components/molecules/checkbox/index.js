import Icon from "../../atoms/icon";
import Label from "../../atoms/label";
import PropTypes from "prop-types";
import React from "react";
import Style from "./checkbox.style";
import { withTheme } from "emotion-theming";
import { ClassNames } from "@emotion/core";

const Checkbox = props => {
  function handleClick(e) {
    if(!props.disabled) {
      props.onCheck(e);
    }
  }

  function handleKeydown(event) {
    let key = event.which;
    let spacebar = 32;
    if(key === spacebar) { handleClick(); }
  }

  function stopEverything(e) {
    e.stopPropagation();
  }

  let iconName = "square-reg";
  if(props.checkStatus === true) {
    iconName = "check-square-reg";
  }

  const classes = {
    checkbox: true,
    checked: props.checkStatus,
    disabled: props.disabled,
    unchecked: !props.checkStatus
  };

  if(props.noLabel) {
    return(
      <ClassNames>
        {({cx}) => (
          <Style className={cx(classes, props.className)}>
            <input name={props.name} type="checkbox" onClick={(e) => stopEverything(e)} onKeyDown={(e) => handleKeydown(e)}/>
            <span className="fa-layers">
              <Icon {...props} color={props.fillColor || props.theme.colors.pageBackground} name="square-sld" size={(props.size === "md") ? null : props.size}/>
              <Icon {...props} color={props.color || props.theme.colors.checkbox} name={iconName} size={(props.size === "md") ? null : props.size} onClick={(e) => handleClick(e)}/>
            </span>
          </Style>
        )}
      </ClassNames>
    );
  }

  return(
    <ClassNames>
      {({cx}) => (
        <Style className={cx(classes, props.className)}>
          <Label {...props} onClick={() => handleClick()}>
            <input name={props.name} type="checkbox" onClick={(e) => stopEverything(e)} onKeyDown={(e) => handleKeydown(e)}/>
            <span className="fa-layers">
              <Icon {...props} color={props.fillColor || props.theme.colors.pageBackground} name="square-sld" size={(props.size === "md") ? null : props.size}/>
              <Icon {...props} color={props.color || props.theme.colors.checkbox} name={iconName} size={(props.size === "md") ? null : props.size}/>
            </span>
          </Label>
        </Style>
      )}
    </ClassNames>
  );
};

Checkbox.componentDescription = "Checkbox to toggle check/uncheck";
Checkbox.componentKey = "checkbox";
Checkbox.componentName = "Checkbox";

Checkbox.propDescriptions = {
  checkStatus: "Checkbox status represents the checked/unchecked state",
  className: "Adds standard className to this component",
  color: "Icon color of the checkbox passes color directly to the icon prop.",
  fillColor: "Color of the checkbox background, defaults to page background",
  noLabel: "Checkbox without label and focus border.",
  onCheck: "Callback when checked.",
  size: "Icon size of the checkbox passes size directly to the icon prop"
};

Checkbox.propTypes = {
  checkStatus: PropTypes.bool,
  className: PropTypes.string,
  color: PropTypes.string,
  disabled: PropTypes.bool,
  fillColor: PropTypes.string,
  formLinker: PropTypes.object,
  name: PropTypes.string,
  noLabel: PropTypes.bool,
  onChange: PropTypes.func,
  onCheck: PropTypes.func,
  size: PropTypes.string
};

Checkbox.defaultProps = {
  checkStatus: false,
  className: "",
  disabled: false,
  noLabel: false,
  onCheck: () => {},
  onChange: () => {}
};

export default withTheme(Checkbox);
