import EmojiPicker from 'emoji-picker-react'
import './chat.css'
import { useState } from 'react'


function Chat() {
    const [open, setOpen] = useState(false)
    const [text, setText] = useState("")

    const handleEmoji = (e) => {
        setText(prev => prev + e.emoji);
        setOpen(false)
    }

    return (
        <div className='chat'>
            <div className="top">
                <div className="user">
                    <img src="./avatar.png" alt="user" />
                    <div className="texts">
                        <span>Kusuma</span>
                        <p> Lorem ipsum dolor sit amet consectetur. </p>
                    </div>
                </div>
                <div className="icons">
                    <img src="./phone.png" alt="phone" />
                    <img src="./video.png" alt="video" />
                    <img src="./info.png" alt="info" />
                </div>
            </div>
            <div className="center">
                <div className="message">
                    <img src="./avatar.png" alt="avatar" />
                    <div className="texts">
                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit nobis consectetur sequi quasi velit eius, nemo commodi ad! Quaerat deserunt assumenda ratione voluptatibus autem at aut blanditiis, eum repellendus sint?</p>
                        <span>1 minutes ago</span>
                    </div>
                </div>
                <div className="message own">
                    <div className="texts">
                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit nobis consectetur sequi quasi velit eius, nemo commodi ad! Quaerat deserunt assumenda ratione voluptatibus autem at aut blanditiis, eum repellendus sint?</p>
                        <span>1 minutes ago</span>
                    </div>
                </div>
                <div className="message">
                    <img src="./avatar.png" alt="avatar" />
                    <div className="texts">
                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit nobis consectetur sequi quasi velit eius, nemo commodi ad! Quaerat deserunt assumenda ratione voluptatibus autem at aut blanditiis, eum repellendus sint?</p>
                        <span>1 minutes ago</span>
                    </div>
                </div>
                <div className="message own">
                    <div className="texts">
                        <img src="https://images.pexels.com/photos/1762851/pexels-photo-1762851.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="sendImage" />
                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit nobis consectetur sequi quasi velit eius, nemo commodi ad! Quaerat deserunt assumenda ratione voluptatibus autem at aut blanditiis, eum repellendus sint?</p>
                        <span>1 minutes ago</span>
                    </div>
                </div>
            </div>
            <div className="bottom">
                <div className="icons">
                    <img src="./img.png" alt="img" />
                    <img src="./camera.png" alt="camera" />
                    <img src="./mic.png" alt="mic" />
                </div>
                <input type="text" placeholder='Type a message...' value={text} onChange={(e) => setText(e.target.value)} />
                <div className="emoji" onClick={() => setOpen((prev) => !prev)}>
                    <img src="./emoji.png" alt="emoji" />
                    <div className="picker">
                        <EmojiPicker onEmojiClick={handleEmoji} open={open} />
                    </div>
                </div>
                <button className='sendButton'>Send</button>
            </div>
        </div>
    )
}

export default Chat