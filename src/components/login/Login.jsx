import { useState } from 'react'
import './login.css'
import { toast } from 'react-toastify'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { auth, db } from '../../lib/firebase'
import { doc, setDoc } from 'firebase/firestore'
import upload from '../../lib/upload'
import SendEmail from './sendEmail/SendEmail'


const Login = () => {
    const [open, setOpen] = useState()
    const [addModal, setAddModal] = useState(false)

    const [avatar, setAvatar] = useState({
        file: null,
        url: ""
    })

    const [loading, setLoading] = useState(false)

    const handleAvatar = (e) => {
        if (e.target.files[0]) {
            setAvatar({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            })
        }
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.target);

        const { username, email, password } = Object.fromEntries(formData)

        try {
            const res = await createUserWithEmailAndPassword(auth, email, password)

            const imgUrl = await upload(avatar.file)

            await setDoc(doc(db, "users", res.user.uid), {
                username,
                email,
                info: null,
                avatar: imgUrl,
                id: res.user.uid,
                block: [],
            });

            await setDoc(doc(db, "userchats", res.user.uid), {
                chats: [],
            });
            toast.success("Account created!, You can login now!")
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }
    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.target);
        const { email, password } = Object.fromEntries(formData)

        try {
            await signInWithEmailAndPassword(auth, email, password)
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='auth'>
            {open ? (
                <div className="item">
                    <h2>Welcome back</h2>
                    <form onSubmit={handleLogin}>
                        <input type="text" placeholder='Email' name='email' />
                        <input type="password" placeholder='Pasword' name='password' />
                        <small onClick={() => setAddModal((prev) => !prev)}>Forgot password?</small>
                        <button disabled={loading}>{loading ? "is Loading" : "Sign In"}</button>
                    </form>
                </div>) : (
                <div className="item">
                    <h2>Create an Account</h2>
                    <form onSubmit={handleRegister}>
                        <label htmlFor="file">
                            <img src={avatar.url || "./avatar.png"} alt="" />
                            Upload an Image Avatar
                        </label>
                        <input type="file" id='file' style={{ display: "none" }} onChange={handleAvatar} />
                        <input type="text" placeholder='Username' name='username' />
                        <input type="text" placeholder='Email' name='email' />
                        <input type="password" placeholder='Pasword' name='password' />
                        <button disabled={loading}>{loading ? "is Loading" : "Sign Up"}</button>
                    </form>
                </div>
            )}
            <div className="footer">
                <p onClick={() => setOpen((prev) => !prev)}> {open ? "Don`t have an account? Register Here!" : "Already have an account?, Login Here!"}</p>
            </div>
            {addModal && <SendEmail onClose={() => setAddModal(false)} />}
        </div>
    )
}

export default Login