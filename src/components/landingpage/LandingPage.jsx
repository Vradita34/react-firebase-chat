import { useState } from 'react'
import './landingPage.css'
import Login from '../login/Login'

function LandingPage() {
    const [open, setOpen] = useState(false)

    return (
        <>
            {open ? (
                <Login />
            ) : (
                <div className='landingPage'>
                    <div className="container">
                        <div className="left-section">
                            <h1>Welcome to My Chat Application</h1>
                            <button className="button-85" role="button" onClick={() => setOpen((prev) => !prev)} >Get Started</button>
                        </div>
                        <div className="right-section">
                            <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaXhqM3Iyb3R3YW52cmRydTZsdGtpNDVtanhueTBia2ZtZHlicHRrbCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26FPJGjhefSJuaRhu/giphy.gif" alt="phoneChat" />
                        </div>
                    </div>
                </div>
            )
            }
        </>
    )
}

export default LandingPage