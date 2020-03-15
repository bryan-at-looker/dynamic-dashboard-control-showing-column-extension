import React from "react"
import { theme, Box, GlobalStyle } from "@looker/components"
import styled, { ThemeProvider } from "styled-components"
import { ExtensionProvider } from "@looker/extension-sdk-react"
import { Main } from "./Main"
import { Redirect, Switch, Route } from "react-router-dom"
import { PickDashboard } from "./PickDashboard"

const AVAILABLE_DASHBOARDS = ['24','30','31','25','27', '26', '29']
const FILTER_LABEL_FOR_HIDING = 'Fields'

export const App: React.FC<any> = () => {
  return (
    <ExtensionProvider  >
      <ThemeProvider theme={theme}>
        <>
          <GlobalStyle />
          <Switch>
            <Route exact path="/dashboards">
              <PickDashboard 
                FILTER_LABEL_FOR_HIDING={FILTER_LABEL_FOR_HIDING}
                AVAILABLE_DASHBOARDS={AVAILABLE_DASHBOARDS}
              ></PickDashboard> 
            </Route>
            <Route path="/dashboards/:id" children={<Main 
                FILTER_LABEL_FOR_HIDING={FILTER_LABEL_FOR_HIDING}
              ></Main>} 
            />
            <Redirect to={`/dashboards`}/>
          </Switch>
        </>
      </ThemeProvider>
    </ExtensionProvider>
  ) 
}

export const Layout = styled(Box)`
  display: grid;
  grid-gap: 20px;
  grid-template-columns: 200px auto;
  width: 100vw
`
