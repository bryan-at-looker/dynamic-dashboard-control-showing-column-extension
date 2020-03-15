import React, { useCallback, useContext, useEffect } from "react"
import { LookerEmbedSDK, LookerEmbedDashboard } from '@looker/embed-sdk'
import {
  ExtensionContext,
  ExtensionContextData,
} from "@looker/extension-sdk-react"
import { EmbedContainer } from './components/EmbedContainer/EmbedContainer'
import { find } from 'lodash' 
import { ExtensionHostApi } from "@looker/extension-sdk"

export const EmbedDashboard: React.FC<any> = ({id, filters, setFilters, DONT_HIDE, FILTER_LABEL_FOR_HIDING, next, element, fields}) => {
  const [options, setOptions] = React.useState<any>(undefined)
  const [dashboard, setDashboard] = React.useState<LookerEmbedDashboard>()
  const extensionContext = useContext<ExtensionContextData>(ExtensionContext)
  const extension_host = extensionContext.extensionSDK as ExtensionHostApi

  const dLoad = (e: any) => {
    setOptions(e.dashboard.options)
  }

  useEffect(()=>{
    hideAll()
  },[options])

  useEffect(()=>{
    hideAll()
  },[filters])

  const hideAll = () => {
    if (options && dashboard && fields) {
      if (options.elements[element.id]) {
        const new_element = JSON.parse(JSON.stringify(options.elements[element.id]))
        const query_fields = element.query.fields
        let hidden_fields: string[] = []
        let unhide_fields: string[] = []
        let column_order: string[] = ['$$$_row_numbers_$$$'].concat(DONT_HIDE)
        if (filters && filters[FILTER_LABEL_FOR_HIDING]) {
          filters[FILTER_LABEL_FOR_HIDING].split(',').forEach((label: string)=>{
            const found = find(fields, {label: label}) || find(fields, {label_short: label})
            if (found) {
              unhide_fields.push(found.name)
              column_order.push(found.name)
            }
          })
        }
        query_fields.forEach((f: string)=>{
          if (DONT_HIDE.indexOf(f) === -1 && unhide_fields.indexOf(f) === -1 ) {
            hidden_fields.push(f)
          }
        })
        new_element.vis_config['hidden_fields'] = hidden_fields
        new_element.vis_config['column_order'] = column_order
        const obj = {elements: { ...options.elements, [element.id]: new_element }}
  
        if (dashboard) {
          dashboard.setOptions(obj)
        }
      }    
    }
  }

  const setupDashboard = (dashboard: LookerEmbedDashboard) => {
    setDashboard(dashboard)
  }

  const filterChange = (e: any) => {
    const new_filters = e?.dashboard?.dashboard_filters
    extension_host.localStorageSetItem(`filters/${id}`, JSON.stringify(new_filters))
    setFilters(new_filters)
  }

  const embedCtrRef = useCallback(el => {
    const hostUrl = extensionContext?.extensionSDK?.lookerHostData?.hostUrl
    if (el && hostUrl) {
      el.innerHTML = ''
      LookerEmbedSDK.init(hostUrl)
      const db = LookerEmbedSDK.createDashboardWithId(id)
      if (next) {
        db.withNext()
      }
      db.appendTo(el)
        .withFilters(filters)
        .on('dashboard:loaded', dLoad)
        .on('dashboard:filters:changed', filterChange)
        .build()
        .connect()
        .then(setupDashboard)
        .catch((error: Error) => {
          console.error('Connection error', error)
        })
    }
  }, [])

  return (
    <>
      <EmbedContainer ref={embedCtrRef}/>
    </>
  )
}
