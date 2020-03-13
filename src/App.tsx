import React from "react"
import { theme, Box, GlobalStyle } from "@looker/components"
import styled, { ThemeProvider } from "styled-components"
import { ExtensionProvider } from "@looker/extension-sdk-react"
import { Main } from "./Main"

export const App: React.FC<any> = () => {

  return (
    <ExtensionProvider >
      <ThemeProvider theme={theme}>
        <>
          <GlobalStyle />
          <Main></Main>
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
