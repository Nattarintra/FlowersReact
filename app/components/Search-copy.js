import React, { useEffect, useContext } from "react"
import DispatchContext from "../DispatchContext"
import { useImmer } from "use-immer"
import Axios from "axios"

function Search() {
  const appDispatch = useContext(DispatchContext)

  const [state, setState] = useImmer({
    searchTerm: "",
    results: [],
    show: "neither",
    requestCount: 0
  })

  // search
  useEffect(() => {
    document.addEventListener("keyup", searchKeyPressHandle)

    return () => document.removeEventListener("keyup", searchKeyPressHandle)
  }, [])

  useEffect(() => {
    const delay = setTimeout(() => {
      //console.log(state.searchTerm)
      setState(draft => {
        draft.requestCount++
      })
    }, 3000)
    // if another key pressed before 3s. cancle setTimeout()
    return () => clearTimeout(delay)
  }, [state.searchTerm])

  useEffect(() => {
    if (state.requestCount) {
      // send Axios request
      const ourRequest = Axios.CancelToken.source()

      async function fetchResults() {
        try {
          const response = await Axios.post("/search", { searchTerm: state.searchTerm }, { cancelToken: ourRequest.token })
          // const response = await Axios.post("/search", { searchTerm: state.searchTerm, cancelToken: ourRequest.token })
          console.log(response.data)
        } catch (e) {
          //console.log("There was a problem or the request was cancelled.")
          console.log(e)
        }
      }
      fetchResults()
      return () => ourRequest.cancel()
    }
  }, [state.requestCount])

  // close search by press esc on keyboard
  function searchKeyPressHandle(e) {
    if (e.keyCode == 27) {
      appDispatch({ type: "closeSearch" })
    }
  }

  function handleInput(e) {
    const value = e.target.value
    setState(draft => {
      draft.searchTerm = value
    })
  }
  return (
    <>
      <div className="search-overlay-top shadow-sm">
        <div className="container container--narrow">
          <label htmlFor="live-search-field" className="search-overlay-icon">
            <i className="fas fa-search"></i>
          </label>
          <input onChange={handleInput} autoFocus type="text" autoComplete="off" id="live-search-field" className="live-search-field" placeholder="What are you interested in?" />
          <span onClick={() => appDispatch({ type: "closeSearch" })} className="close-live-search">
            <i className="fas fa-times-circle"></i>
          </span>
        </div>
      </div>

      <div className="search-overlay-bottom">
        <div className="container container--narrow py-3">
          <div className="live-search-results live-search-results--visible">
            <div className="list-group shadow-sm">
              <div className="list-group-item active">
                <strong>Search Results</strong> (3 items found)
              </div>
              <a href="#" className="list-group-item list-group-item-action">
                <img className="avatar-tiny" src="https://gravatar.com/avatar/b9408a09298632b5151200f3449434ef?s=128" /> <strong>Example Post #1</strong>
                <span className="text-muted small">by brad on 2/10/2020 </span>
              </a>
              <a href="#" className="list-group-item list-group-item-action">
                <img className="avatar-tiny" src="https://gravatar.com/avatar/b9216295c1e3931655bae6574ac0e4c2?s=128" /> <strong>Example Post #2</strong>
                <span className="text-muted small">by barksalot on 2/10/2020 </span>
              </a>
              <a href="#" className="list-group-item list-group-item-action">
                <img className="avatar-tiny" src="https://gravatar.com/avatar/b9408a09298632b5151200f3449434ef?s=128" /> <strong>Example Post #3</strong>
                <span className="text-muted small">by brad on 2/10/2020 </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Search
