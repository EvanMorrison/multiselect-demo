import React, { useRef } from 'react'
import FormLinker from 'form-linker'
import MDXContent from './index.mdx'
import { nfl, nflGrouped } from '../data/nfl'
import { names, namesGrouped} from '../data/names'
import Field from '../components/molecules/field'

const MultiSelectDemo = props => {
  const formLinker = useRef(new FormLinker({
    data: {
      demo1: [],
      demo2: [],
      demo3: [],
      demo4: [],
    },
    schema: {
      demo1: "array",
      demo2: "array",
      demo3: "array",
      demo4: "array",
    }
  }))

  return(
    <div css={{width: "100%", display: "flex", justifyContent: "center", minHeight: 950}}>
      <div css={{flex: 1, maxWidth: 1200, margin: "20px 8px"}}>
        <div css={{h1: {background: "#38f", color: "#fff", padding: 8}, code: {background: "rgba(150, 150, 150, 0.3)"}}}>
          <MDXContent/>
        </div>
        <div css={{display: "flex", justifyContent: "space-around"}}>
          <div css={{flex: 1, maxWidth: 400, marginTop: 30}}>
            <Field formLinker={formLinker.current} name="demo1" label="Contacts" checkboxes showAllSelected type="multiSelect" options={namesGrouped}/>
          </div>
          <div css={{flex: 1, maxWidth: 500, marginTop: 30}}>
            <Field formLinker={formLinker.current} name="demo2" label="Contacts" checkboxes columns={3} type="multiSelect" options={names}/>
          </div>
        </div>
        <div css={{display: "flex", justifyContent: "space-around"}}>
          <div css={{flex: 1, maxWidth: 300, marginTop: 30}}>
            <Field formLinker={formLinker.current} name="demo3" label="Teams" checkboxes columns={1} showAllSelected type="multiSelect" options={nflGrouped}/>
          </div>
          <div css={{flex: 1, maxWidth: 800, marginTop: 30}}>
            <Field formLinker={formLinker.current} name="demo4" label="Teams" checkboxes columns={4} type="multiSelect" options={nfl}/>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MultiSelectDemo
