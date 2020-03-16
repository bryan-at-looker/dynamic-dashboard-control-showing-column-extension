import React from 'react';
import { Card, CardMedia, CardContent, Text, Heading, Paragraph } from '@looker/components';
import { Link } from "react-router-dom"
import styled from 'styled-components'

export function Thumbnail({m, title, description, space_name, blob, dashboard}:any) {

  const url = URL.createObjectURL(blob)

  return (
    <Link to={`/dashboards/${dashboard}`}>
      <StyledRectCard raised>
        <CardMedia image={url} title={title}/>
        <CardContent>
        <Text
          fontSize="xsmall"
          textTransform="uppercase"
          fontWeight="semiBold"
          variant="subdued"
        >
          {space_name}
        </Text>
        <Heading as="h4" fontSize="medium" fontWeight="semiBold" truncate>
          {title}
        </Heading>
        <div>
          <StyledText color="darkgrey" truncateLines={3} fontSize="small">
            {description}
          </StyledText>
        </div>
        </CardContent>
      </StyledRectCard>
    </Link>
  );
}

const StyledRectCard = styled(Card)`
    height:300px;
    width: 300px;
    overflow: hidden;
`

const StyledText = styled(Paragraph)`
  text-decoration: none;
  &:focus,
  &:hover,
  &:visited,
  &:link,
  &:active {
    text-decoration: none;
  }
`