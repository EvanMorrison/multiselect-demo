import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ClassNames } from "@emotion/core";
import { isEqual, isNil } from "lodash";

const columnWidths = {
  1: "100%",
  2: "50%",
  3: "33%",
  4: "25%",
};

export function renderAvailablePills({state, props, pillRef, handleClick}) {
  // this will hold the available pills grouped by sort labels
  const pillGroups = [];

  if(state.availablePills.length === 0) { return(pillGroups); }

  const {availablePills, availableFirstRendered, availableLastRendered, optionsMap, focusedIndex} = state;
  const {columns} = props;

  // create groupings: an array of tuples containing the starting index of each group and the group label
  const groupings = [[0, (availablePills[0] || {}).sortGroupLabel]];
  let i = 1;
  let current = availablePills[i];
  let prev = availablePills[i - 1];
  while(i < availablePills.length) {
    if(current.sortGroupLabel !== prev.sortGroupLabel) {
      groupings.push([
        i,
        current.sortGroupLabel
      ]);
    }
    i++;
    prev = current;
    current = availablePills[i];
  }
  groupings.push([availablePills.length, null]);

  // organize into pillGroups: each entry is the JSX for a full sortGroup with label
  let colLength = 0;
  for(let i = 0, len = groupings.length - 1; i < len; i++) {
    let pillGroup = availablePills.slice(groupings[i][0], groupings[i + 1][0]);
    let count = pillGroup.length;
    let breakpoint = Math.ceil(count / columns);

    // colLength stores the aggregate column length of all pillGroups to this point. Used in the calculation of
    // where the currently viewable pills are
    colLength += breakpoint;

    // divide pills for a group into applicable number of vertically-sorted columns
    let pillColumns = [];
    let j = 0;
    while(j < count) {
      const column = pillGroup.slice(j, j + breakpoint);

      /**
       * if the options list is very long, we improve performance by rendering pills that
       * are not in view (priorFill and afterFill) without event handlers and special classes
       */
      const priorFillEnd = availableFirstRendered >= colLength ? column.length : Math.max(column.length - (colLength - availableFirstRendered), 0);
      const priorFill = column.slice(0, priorFillEnd).map(option => {
        return(
          <div key={option.value} ref={isEqual(availablePills[focusedIndex], option) ? pillRef : null} className="select-option-pill">... {option.label}</div>
        );
      });

      const afterFillStart = availableLastRendered >= colLength ? column.length : Math.max(column.length - (colLength - availableLastRendered), 0);
      const afterFill = column.slice(afterFillStart, column.length).map(option => {
        return(
          <div key={option.value} ref={isEqual(availablePills[focusedIndex], option) ? pillRef : null} className="select-option-pill">... {option.label}</div>
        );
      });

      const realPills = column.slice(priorFillEnd, afterFillStart).map(option => {
        let optionClasses;
        if(!isNil(option.classes)) {
          optionClasses = Array.isArray(option.classes) ? option.classes.join(" ") : option.classes;
        }
        if(props.checkboxes) {
          const pillClasses = {
            "select-option-pill": true,
            "active": isEqual(availablePills[focusedIndex], option),
            "selected": optionsMap.get(option),
            [optionClasses]: !isNil(optionClasses)
          };
          const iconName = optionsMap.get(option) ? "check-square" : "square";
          return(
            <ClassNames key={option.value}>
              {({cx}) => (
                <div key={option.value} ref={pillClasses.active ? pillRef : null} value={option.value} className={cx(pillClasses)} onClick={() => handleClick(option, true)}>
                  <span className="fa-layers checkbox">
                    <FontAwesomeIcon color={props.theme.colors.pageBackground} icon={["fas", "square"]}/>
                    <FontAwesomeIcon color={props.theme.colors.checkbox} icon={["far", iconName]}/>
                  </span>
                  {option.label}
                </div>
              )}
            </ClassNames>
          );
        } else {
          const pillClasses = {
            "select-option-pill": true,
            "active": isEqual(availablePills[focusedIndex], option),
            [optionClasses]: !isNil(optionClasses)
          };
          return(
            <ClassNames key={option.value}>
              {({cx}) => (
                <div key={option.value} value={option.value} className={cx(pillClasses)} onClick={() => handleClick(option.value, true)}>{option.label}</div>
              )}
            </ClassNames>
          );
        }
      });

      const COLUMN_WIDTH = columnWidths[props.columns];

      pillColumns.push(
        <div key={j} css={{flex: `0 0 ${COLUMN_WIDTH}`, maxWidth: COLUMN_WIDTH, padding: "0 8px 0 3px"}}>
          {priorFill}
          {realPills}
          {afterFill}
        </div>
      );
      j += breakpoint;
    }

    // insert the group heading and columns as an entry in the pillGroups array
    pillGroups.push(
      <div key={groupings[i][0]}>
        <div css={{margin: "5px 0 3px"}}>
          <span>{groupings[i][1]}</span>
          <hr/>
        </div>
        <div css={{display: "flex"}}>
          {pillColumns}
        </div>
      </div>
    );
  }
  return(pillGroups);
}
