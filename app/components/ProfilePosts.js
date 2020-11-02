import React, { useEffect, useState } from "react"
import Axios from "axios"
import { useParams, Link } from "react-router-dom"
import LoadingDotsIcon from "./LoadingDotsIcon"
import Post from "./Post"

function ProfilePosts(props) {
  const { username } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState([])

  useEffect(() => {
    const flowersRequest = Axios.CancelToken.source()
    async function fetchPosts() {
      try {
        const response = await Axios.get(`/profile/${username}/posts`, { cancelToken: flowersRequest.token })
        //console.log(response.data)
        setPosts(response.data)
        setIsLoading(false)
      } catch (e) {
        console.log("There was a problem or the request was camcelled.")
      }
    }
    fetchPosts()
    return () => {
      flowersRequest.cancel()
    }
  }, [])

  if (isLoading) return <LoadingDotsIcon />
  return (
    <div className="list-group">
      {posts.map(post => {
        return <Post noAuther={true} post={post} key={post._id} />
      })}
    </div>
  )
}

export default ProfilePosts
