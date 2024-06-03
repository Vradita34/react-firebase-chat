import { useState } from 'react'
import './landingPage.css'
import Login from '../login/Login'
import Logo from './logo/Logo'

function LandingPage() {
    const [open, setOpen] = useState(false)

    return (
        <>
            {open ? (
                <Login />
            ) : (
                <div className='landingPage'>
                    <div className="container">
                        <div className="right-section">
                            <Logo />
                        </div>
                        <div className="left-section">
                            <h1>Welcome to My ChatCan</h1>
                            <button onClick={() => setOpen((prev) => !prev)}>
                                Get Started
                            </button>
                        </div>
                    </div>
                </div >
            )
            }
        </>
    )
}

export default LandingPage