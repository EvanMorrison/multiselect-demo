import React, { useRef } from 'react'
import FormLinker from 'form-linker'
import MDXContent from './index.mdx'
import Field from '../components/molecules/field'

const demo1List = [
  {label: "Red", value: "red"},
  {label: "Yellow", value: "yellow"},
  {label: "Blue", value: "blue"},
]
const MultiSelectDemo = props => {
  const formLinker = useRef(new FormLinker({
    data: {
      demo1: []
    },
    schema: {
      demo1: "array"
    }
  }))

  return(
    <div css={{width: "100%", display: "flex", justifyContent: "center"}}>
      <div css={{flex: 1, maxWidth: 1200, margin: "20px 8px"}}>
        <MDXContent/>
        <div css={{maxWidth: 600, marginTop: 30}}>
          <Field formLinker={formLinker.current} name="demo1" label="Multiselect Component" checkboxes type="multiSelect" options={demo1List}/>
        </div>
      </div>
    </div>
  )
}

export default MultiSelectDemo
