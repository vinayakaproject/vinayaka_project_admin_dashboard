import React from 'react'
import { Flex, Spinner } from '@chakra-ui/react'

function Loading(otherAttr, color = '#000') {
  return (
    <Flex flex={1} {...otherAttr} justifyContent={'center'} alignItems={'center'}>
        <Spinner size='lg' color={color} />
    </Flex>
  )
}

export default Loading