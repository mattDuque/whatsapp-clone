import React, { useState, useEffect } from 'react'
import Sidebar from './Components/Sidebar'
import Chat from './Components/Chat'
import Pusher from 'pusher-js'
import axios from './axios'
import './Styles/App.css'

function App() {
  
  const [messages, setMessages] = useState([])

  useEffect(()=>{
    axios.get('messages/sync')
         .then((response)=>{
            setMessages(response.data)
         })
    
  },[])

  useEffect(()=>{
    const pusher = new Pusher('573f89356e84997e6366', {
      cluster: 'us2'
    })

    const channel = pusher.subscribe('messages')
    channel.bind('inserted', (newData) => {
      setMessages([...messages, newData])
    })

    return () => {
      channel.unsubscribe()
      channel.unbind_all()
    }

  }, [messages])

  return (
    <div className="app">
      <div className="app__body">
        <Sidebar/>
        <Chat messages={messages}/>
      </div>
    </div>
  );
}

export default App;
