import { keysIn } from 'ramda'
import Images from './Images'
import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'

const BaseImage = styled.img`
  width: ${props => props.width};
  height: ${props => props.height};
  color: ${props => props.color};
`

const Image = props => {
  const { name, srcset, ...rest } = props
  const file = Images[name]
  const srcSet = srcset
    ? keysIn(srcset).map(name => `${Images[name]} ${srcset[name]}`)
    : []
  if (!file) {
    return <img />
  }
  return <BaseImage src={file} srcSet={srcSet.join(', ')} {...rest} />
}

Image.defaultProps = {
  width: 'auto',
  height: 'auto',
  color: 'auto'
}

Image.propTypes = {
  name: PropTypes.string.isRequired,
  width: PropTypes.string,
  height: PropTypes.string,
  color: PropTypes.string
}

export default Image
