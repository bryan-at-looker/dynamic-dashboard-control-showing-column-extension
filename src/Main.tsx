import React, { useState, useEffect, useContext } from 'react';
import { ExtensionContextData, ExtensionContext } from '@looker/extension-sdk-react';
import { EmbedDashboard } from "./components/Embed/EmbedDashboard"
import { ExtensionHostApi } from '@looker/extension-sdk';
import { filter, sortBy, find, isEqual, pickBy } from 'lodash'
import { useParams, useHistory } from 'react-router-dom';

const DONT_HIDE = ['order_items.id']

export function Main( {FILTER_LABEL_FOR_HIDING}: any) {
  const [ready, setReady] = useState(false)
  const [element, setElement] = useState<any>(undefined)
  const [fields, setFields] = useState<any>(undefined)
  const [filters, setFilters] = React.useState<any>(undefined)
  const { id } = useParams();
  const extensionContext = useContext<ExtensionContextData>(ExtensionContext)
  const sdk = extensionContext.coreSDK
  const extension_host = extensionContext.extensionSDK as ExtensionHostApi
  let history = useHistory();

  useEffect(() => {
    setupDashboard();
  },[])

  useEffect(()=>{
    history.push({
      pathname: `/dashboards/${id}`,
      search: "?" + new URLSearchParams(filters).toString()
    })
  }, [filters])

  const findTable = (dashy: any) => {
    return new Promise((resolve, reject) => {
      if (dashy.dashboard_layouts) {
        // @ts-ignore
        const ordered_elements = sortBy(dashy.dashboard_layouts[0]['dashboard_layout_components'], ['row','column'] ).map(l=>{return l.dashboard_element_id})
        for ( let el of ordered_elements) {
          const found = find(dashy.dashboard_elements, {id: el})
          if (found) {
            const type = found?.query?.vis_config?.type
            if (type && type == 'table' || type == 'looker_grid') {
              resolve(found);
            }
          }
        }
      }
      resolve(undefined)
    })
  }

  const setupDashboard = async () => {
    const initial_search = new URLSearchParams(history.location.search.substring(1))
    if (initial_search && initial_search.toString()=="") {
      const storage_filters = await extension_host.localStorageGetItem(`filters/${id}`)
      setFilters(JSON.parse(storage_filters || '{}'))
    } else {
      // @ts-ignore
      setFilters(Object.fromEntries(initial_search))
    }
    const dashy = await sdk.ok(sdk.dashboard(id!))
    if (dashy) {
      const el = await findTable(dashy);
      if (el) {
        setElement(el)
        if (dashy?.can?.update) {
          await updateFilter(dashy, el)
        }
      }
    }
    setReady(true)
  }


  const updateFilter = (db: any, el: any) => {
    return new Promise( async (resolve, reject) => {
      const found_filter = find(db.dashboard_filters, {title: FILTER_LABEL_FOR_HIDING})
      if (found_filter) {
        let ui_config = found_filter?.ui_config
        if (ui_config) {
          const explore = await sdk.ok(sdk.lookml_model_explore(el.query.model!, el.query.view!))
          if (explore && explore.fields) {
            const fields = explore.fields
            let fields_to_check: any = fields.dimensions!.concat(fields.measures!)
            fields_to_check = filter(fields_to_check, function(o: any) { return DONT_HIDE.indexOf(o.name) === -1 })
            setFields(fields_to_check);
            const short_labels = getFilterLabel(el.query.fields, fields_to_check).sort()
            if ( !isEqual(ui_config.options, short_labels)) {
              ui_config['options'] = short_labels
              await sdk.ok(sdk.update_dashboard_filter(found_filter.id!, { ui_config }))
              resolve(1)
            } else {
              resolve(0)
            }
          }
        }
      }
      resolve(0)
    })
  }

  return (
    <>
      { ready && <EmbedDashboard
        fields={fields}
        element={element}
        id={id}
        next={true}
        FILTER_LABEL_FOR_HIDING={FILTER_LABEL_FOR_HIDING}
        DONT_HIDE={DONT_HIDE}
        filters={filters}
        setFilters={setFilters}
      ></EmbedDashboard> }
    </>
  );
}

function getFilterLabel(names: string[], list: any) {
  let matches: any = []
  names.forEach((n: any)=>{
    const found: any = find(list, {name: n});
    if (found) {
      const pick_all = pickBy(list, {label_short: found.label_short})
      if (Object.keys(pick_all).length > 1) {
        matches.push(found.label)
      } else {
        matches.push(found.label_short)
      }
    }
  })
  return matches
}