import React from 'react'

const HighlightText = ({text}) => {
  return (
    <span className='bg-gradient-to-r from-[#9da0bb] via-[#8a7fd9] to-[#60519b] bg-clip-text text-transparent font-extrabold'>
        {" "}
        {text}
    </span>
  )
}

export default HighlightText
