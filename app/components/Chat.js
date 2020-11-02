import React, { useEffect, useContext, useRef } from "react"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"
import { Link } from "react-router-dom"
import { useImmer } from "use-immer"
import io from "socket.io-client"

function Chat() {
  const socket = useRef(null)
  const chatField = useRef(null)
  const chatLog = useRef(null)
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const [state, setState] = useImmer({
    fieldValue: "",
    chatMessages: []
  })

  // focus input field when chat is Open by useRef hook
  useEffect(() => {
    if (appState.isChatOpen) {
      chatField.current.focus()
      //if chat is alread seen then clear counting unread num.
      appDispatch({ type: "clearUnreadChatCount" })
    }
  }, [appState.isChatOpen])

  useEffect(() => {
    // connet socket chat
    socket.current = io(process.env.BACKENDURL || "https://crudappreact.herokuapp.com")

    socket.current.on("chatFromServer", message => {
      setState(draft => {
        draft.chatMessages.push(message)
      })
    })

    // when user logged out disconnect socket
    return () => socket.current.disconnect()
  }, [])
  useEffect(() => {
    // scroll to bottom in chatLog
    chatLog.current.scrollTop = chatLog.current.scrollHeight
    // Only display and count unread msg if chatMessages statt is changed and chat is not visible.
    if (state.chatMessages.length && !appState.isChatOpen) {
      appDispatch({ type: "increatmentUnreadChatCount" })
    }
  }, [state.chatMessages])

  function handleFieldChange(e) {
    const value = e.target.value
    setState(draft => {
      draft.fieldValue = value
    })

    function handleSubmit(e) {
      e.preventDefault()
      this.handleSubmit = this.handleSubmit.bind(this)
      alert(state.fieldValue)
    }
  }

  return (
    <div id="chat-wrapper" className={"chat-wrapper shadow border-top border-left border-right " + (appState.isChatOpen ? "chat-wrapper--is-visible" : "")}>
      <div className="chat-title-bar bg-primary">
        Chat
        <span onClick={() => appDispatch({ type: "closeChat" })} className="chat-title-bar-close">
          <i className="fas fa-times-circle"></i>
        </span>
      </div>
      <div id="chat" className="chat-log" ref={chatLog}>
        {state.chatMessages.map((message, index) => {
          if (message.username == appState.user.username) {
            return (
              <div key={index} className="chat-self">
                <div className="chat-message">
                  <div className="chat-message-inner">{message.message}</div>
                </div>
                <img className="chat-avatar avatar-tiny" src={message.avatar} />
              </div>
            )
          }
          return (
            <div key={index} className="chat-other">
              <Link to={`/profile/${message.username}`}>
                <img className="avatar-tiny" src={message.avatar} />
              </Link>
              <div className="chat-message">
                <div className="chat-message-inner">
                  <Link to={`/profile/${message.username}`}>
                    <strong>{message.username}: </strong>
                  </Link>
                  {message.message}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <form
        onSubmit={e => {
          e.preventDefault(),
            // send msg to chat server
            socket.current.emit("chatFromBrowser", { message: state.fieldValue, token: appState.user.token })
          //  alert(state.fieldValue),
          setState(draft => {
            // Add msg to state collection of msg
            draft.chatMessages.push({ message: draft.fieldValue, username: appState.user.username, avatar: appState.user.avatar })
            // empty string after submitted
            draft.fieldValue = ""
          })
        }}
        id="chatForm"
        className="chat-form border-top"
      >
        <input value={state.fieldValue} onChange={handleFieldChange} ref={chatField} type="text" className="chat-field" id="chatField" placeholder="Type a message…" autoComplete="off" />
      </form>
    </div>
  )
}

export default Chat
