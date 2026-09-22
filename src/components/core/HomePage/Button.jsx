import React from 'react'
import {Link} from "react-router-dom"

const Button = ({children, active, linkto}) => {
  return (
    <Link to={linkto}>

        <div className={`text-center text-[13px] px-6 py-3 rounded-md font-bold transition-all duration-200
        ${active ? "bg-yellow-50 text-white shadow-[0_4px_14px_0_rgba(96,81,155,0.35)] hover:bg-[#7364b3] hover:shadow-[0_6px_20px_0_rgba(96,81,155,0.5)]" : "bg-richblack-800 text-richblack-100 border border-richblack-700 hover:bg-richblack-700"}
        hover:scale-95
        `}>
            {children}
        </div>

    </Link>
  )
}

export default Button
