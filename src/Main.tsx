import React, { useState, useEffect, useContext } from 'react';
import { ExtensionContextData, ExtensionContext } from '@looker/extension-sdk-react';
import { EmbedDashboard } from "./components/Embed/EmbedDashboard"
import { find, isEqual } from 'lodash' 
import { ExtensionHostApi } from '@looker/extension-sdk';
import { filter } from 'lodash'

const DASHY = '30'
const ELEMENT = '288'
const FILTER_LABEL_FOR_HIDING = 'Fields'
const DONT_HIDE = ['order_items.id']

export function Main() {
  const [ready, setReady] = useState(false)
  const [element, setElement] = useState<any>(undefined)
  const [explore, setExplore] = useState<any>(undefined)
  const [filters, setFilters] = React.useState<any>(undefined)
  const extensionContext = useContext<ExtensionContextData>(ExtensionContext)
  const sdk = extensionContext.coreSDK
  const extension_host = extensionContext.extensionSDK as ExtensionHostApi

  useEffect(() => {
    getElement();
  },[])

  useEffect(() => {
    if ( !ready ) {
      if ( explore && element ) {
        getDashboard();
      }
    }
  },[explore, element])

  const getDashboard = async () => {
    const dashy = await sdk.ok(sdk.dashboard(DASHY))
    const found_filter = find(dashy.dashboard_filters, {title: FILTER_LABEL_FOR_HIDING})
    if (found_filter) {
      let ui_config = found_filter?.ui_config
      if (ui_config) {
        let fields_to_check: any = [].concat(explore.fields.dimensions,explore.fields.measures)
        fields_to_check = filter(fields_to_check, function(o: any) { return DONT_HIDE.indexOf(o.name) === -1 })
        const short_labels = getShortLabel(element.query.fields, fields_to_check).sort()
        if ( !isEqual(ui_config.options, short_labels)) {
          ui_config['options'] = short_labels
          await sdk.ok(sdk.update_dashboard_filter(found_filter.id!, { ui_config }))
        }
      }
    }
    setReady(true)
  }

  const getElement = async () => {
    const storage_filters = await extension_host.localStorageGetItem("filters")
    const el = await sdk.ok(sdk.dashboard_element(ELEMENT))
    const explore = await sdk.ok(sdk.lookml_model_explore(el!.query!.model, el!.query!.view))
    setExplore(explore)
    setElement(el)
    setFilters(JSON.parse(storage_filters || '{}'))
  }


  return (
    <>
      { ready && <EmbedDashboard
        fields={[].concat(explore.fields.dimensions,explore.fields.measures)}
        element={element}
        id={DASHY}
        next={true}
        FILTER_LABEL_FOR_HIDING={FILTER_LABEL_FOR_HIDING}
        DONT_HIDE={DONT_HIDE}
        filters={filters}
        setFilters={setFilters}
      ></EmbedDashboard> }
    </>
  );
}

function getShortLabel(names: string[], list: any) {
  let matches: any = []
  names.forEach((n: any)=>{
    const found: any = find(list, {name: n});
    if (found) {
      matches.push(found.label_short)
    }
  })
  return matches
}