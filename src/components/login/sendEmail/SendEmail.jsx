import { useState } from 'react'
import './sendemail.css'
import { toast } from 'react-toastify'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../../../lib/firebase'

function SendEmail({ onClose }) {
    const [email, setEmail] = useState('')

    const handlePasswordReset = async (e) => {
        e.preventDefault()
        if (!email) {
            toast.error('Please insert your email in input!')
            return
        }
        try {
            await sendPasswordResetEmail(auth, email);
            toast.success("Password reset email sent!")
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    return (
        <div className='sendEmail'>
            <div className="close">
                <img src="./closered.png" alt="close" onClick={onClose} />
            </div>
            <form onSubmit={handlePasswordReset}>
                <input type="text" placeholder='Email' name='email' onChange={(e) => setEmail(e.target.value)} />
                <button>Send Request!</button>
            </form>
        </div>
    )
}

export default SendEmail