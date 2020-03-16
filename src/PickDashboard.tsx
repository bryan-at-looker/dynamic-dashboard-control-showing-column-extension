import React, { useState, useEffect, useContext } from 'react';
import { ExtensionContextData, ExtensionContext } from '@looker/extension-sdk-react';
import { Flex, FlexItem, Box, Heading } from '@looker/components';
import styled from 'styled-components'
import {Thumbnail} from './Thumbnail'
import {find} from 'lodash'

export function PickDashboard( {AVAILABLE_DASHBOARDS, FILTER_LABEL_FOR_HIDING}: any) {
  const extensionContext = useContext<ExtensionContextData>(ExtensionContext)
  const sdk = extensionContext.coreSDK
  const [dashboards, setDashboards] = useState<any>([])

  useEffect(()=>{
    apiCall();
  },[])

  const apiCall = async () => {
    const get_available_dashboard = await sdk.ok(sdk.search_dashboards({id: AVAILABLE_DASHBOARDS.join(',')}))
    let dashboards_with_filter: any = []
    get_available_dashboard.forEach(db=>{
      if (db.dashboard_filters) {
        const found = find(db.dashboard_filters, {title: FILTER_LABEL_FOR_HIDING})
        if (found) {
          dashboards_with_filter.push(db)
        }
      }
    })
    const thumbnails: any =  dashboards_with_filter.map((db: any)=>{
      return sdk.ok(sdk.get(`/vector_thumbnail/dashboard/${db.id}`))
    }) 
    const all_vectors = await Promise.all(thumbnails)
    const new_dbs = dashboards_with_filter.map((db: any, i: number)=>{
      db['_blob'] = all_vectors[i]
      return db
    })
    setDashboards(new_dbs)
  }

  const thumbnails = dashboards.map((db: any)=>{
    return <FlexItem 
      m="large" 
      key={db.id} 
    >
      <Thumbnail
        title={db.title} 
        description={db.description} 
        space_name={db.space.name} 
        dashboard={db.id} 
        blob={db['_blob']}>
      </Thumbnail>
    </FlexItem>
  })

  if (dashboards.length) {
    return (
    <Box m="large">
      <Heading>Select a Dashboard</Heading>
      <Flex 
        flexWrap="wrap"
        justifyContent="flex-start"
        p="large">
        {thumbnails}
      </Flex>
    </Box> 
    );
  } else {
    return <></>
  }
}