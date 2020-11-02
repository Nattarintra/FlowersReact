import React, { useEffect } from "react"

function Container(props) {
  // container--narrow class will only add if wide=true we added props wide in HomeGuest #5
  return <div className={"container py-md-5 " + (props.wide ? "" : "container--narrow")}>{props.children}</div>
}

export default Container
