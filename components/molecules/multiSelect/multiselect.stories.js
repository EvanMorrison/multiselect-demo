import FormLinker from "form-linker";
import Field from "../field";
import MultiSelect from "./index";
import React, { useState, useEffect, useRef } from "react";
import { USStates } from "../../atoms/form/example";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { boolean, number, radios, text } from "@storybook/addon-knobs";

const stories = storiesOf("Molecules", module);

const states = USStates();
const makeOptions = (count) => {
  let result = [];
  for(let i = 0; i < count; i++) {
    result.push({label: states[i % 59].label + " " + i, value: i});
  }
  return(result);
};

const Wrapper = (props) => {
  const formLinker = useRef(new FormLinker({
    data: {
      multiSelect: []
    },
    schema: {
      multiSelect: "array"
    }
  }));
  const fl = formLinker.current;

  const [options, setOptions] = useState(makeOptions(props.optionsCount));
  useEffect(() => {
    setOptions(makeOptions(props.optionsCount));
  }, [props.optionsCount]);

  const selectStyle = boolean("checkboxes", true);
  return(
    <div css={{maxWidth: 600}}>
      <Field name="multiSelect" formLinker={fl}
        key={props.columns}
        type="multiSelect"
        checkboxes={selectStyle}
        disabled={boolean("disabled", false)}
        label={`Multiselect - ${selectStyle ? "checkbox" : "pills"} style`}
        placeholder={text("placeholder", "click here to display options")}
        onClick={action("click")}
        options={options}
        columns={props.columns}
        size={radios("size", ["sm", "md", "lg"], "md")}
        showAllSelected={boolean("showAllSelected", false)}
      />
    </div>
  );
};

stories.add("MultiSelect", () => (
  <Wrapper
    optionsCount={number("options count", 59)}
    columns={number("columns", 2)}
  />
), {
  info: {
    propTables: [MultiSelect],
    propTablesExclude: [Field, Wrapper]
  },
  jest: ["multiselect.pills", "multiselect.checkboxes"]
});