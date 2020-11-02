import React, { useState, useReducer, useEffect, Suspense } from "react"
import ReactDOM from "react-dom"
import { useImmerReducer } from "use-immer"
import Axios from "axios"
import { CSSTransition } from "react-transition-group"
Axios.defaults.baseURL = process.env.BACKENDURL || "https://crudappreact.herokuapp.com"

import StateContext from "./StateContext"
import DispatchContext from "./DispatchContext"

// components
import Header from "./components/Header"
import HomeGuest from "./components/HomeGuest"
import Home from "./components/Home"
import Footer from "./components/Footer"
import About from "./components/About"
import Terms from "./components/Terms"

const CreatePost = React.lazy(() => import("./components/CreatePost"))
const ViewSinglePost = React.lazy(() => import("./components/ViewSinglePost"))
const Search = React.lazy(() => import("./components/Search"))
const Chat = React.lazy(() => import("./components/Chat"))

import { BrowserRouter, Switch, Route } from "react-router-dom"
import FlashMessages from "./components/FlashMessages"
import Profile from "./components/Profile"
import EditPost from "./components/EditPost"
import NotFound from "./components/NotFound"
import LoadingDotsIcon from "./components/LoadingDotsIcon"

function Main() {
  const initialState = {
    loggedIn: Boolean(localStorage.getItem("flowersappToken")),
    flashMessages: [],
    user: {
      token: localStorage.getItem("flowersappToken"),
      username: localStorage.getItem("flowersappUsername"),
      avatar: localStorage.getItem("flowersappAvatar")
    },
    isSearchOpen: false,
    isChatOpen: false,
    unReadChatCount: 0
  }

  function flowersReducer(draft, action) {
    switch (action.type) {
      case "login":
        draft.loggedIn = true
        draft.user = action.data
        return
      case "logout":
        draft.loggedIn = false
        return
      case "flashMessage":
        draft.flashMessages.push(action.value)
        return
      case "openSearch":
        draft.isSearchOpen = true
        return
      case "closeSearch":
        draft.isSearchOpen = false
        return
      case "toggleChat":
        // make chat display oposit
        draft.isChatOpen = !draft.isChatOpen
        return
      case "closeChat":
        draft.isChatOpen = false
        return
      case "increatmentUnreadChatCount":
        draft.unReadChatCount++
        return
      case "clearUnreadChatCount":
        draft.unReadChatCount = 0
        return
    }
  }

  const [state, dispatch] = useImmerReducer(flowersReducer, initialState)
  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem("flowersappToken", state.user.token)
      localStorage.setItem("flowersappUsername", state.user.username)
      localStorage.setItem("flowersappAvatar", state.user.avatar)
    } else {
      localStorage.removeItem("flowersappToken")
      localStorage.removeItem("flowersappUsername")
      localStorage.removeItem("flowersappAvatar")
    }
  }, [state.loggedIn])

  // check if token has expired or not on first render
  useEffect(() => {
    if (state.loggedIn) {
      // send Axios request
      const ourRequest = Axios.CancelToken.source()

      async function fetchResults() {
        try {
          const response = await Axios.post("/checkToken", { token: state.user.token }, { cancelToken: ourRequest.token })
          if (!response.data) {
            dispatch({ type: "logout" })
            dispatch({ type: "flashMessage", value: "Your session has expired. Please log in again." })
          }
        } catch (e) {
          console.log("There was a problem or the request was cancelled.")
          //console.log(e)
        }
      }
      fetchResults()
      return () => ourRequest.cancel()
    }
  }, [state.requestCount])

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} />
          <Header />
          <Suspense fallback={<LoadingDotsIcon />}>
            <Switch>
              <Route path="/profile/:username" exact>
                <Profile />
              </Route>
              <Route path="/" exact>
                {state.loggedIn ? <Home /> : <HomeGuest />}
              </Route>
              <Route path="/post/:id" exact>
                <ViewSinglePost />
              </Route>
              <Route path="/post/:id/edit" exact>
                <EditPost />
              </Route>
              <Route path="/about-us" exact>
                <About />
              </Route>
              <Route path="/create-post" exact>
                <CreatePost />
              </Route>
              <Route path="/terms" exact>
                <Terms />
              </Route>

              <Route path="/profile/:username/followers" component={Profile}></Route>
              <Route path="/profile/:username/following" component={Profile}></Route>
              <Route path="/doesUsernameExist" component={HomeGuest}></Route>

              <Route>
                <NotFound />
              </Route>
            </Switch>
          </Suspense>

          <CSSTransition timeout={330} in={state.isSearchOpen} classNames="search-overlay" unmountOnExit>
            <div className="search-overlay">
              <Suspense fallback="">
                <Search />
              </Suspense>
            </div>
          </CSSTransition>
          <Suspense fallback="">{state.loggedIn && <Chat />}</Suspense>
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}
ReactDOM.render(<Main />, document.querySelector("#app"))

if (module.hot) {
  module.hot.accept()
}
