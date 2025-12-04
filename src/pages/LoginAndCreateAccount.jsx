import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios'
import { LogIn,LogOut,Send,UserPlus } from 'lucide-react';


//Include tokens every req

axios.defaults.withCredentials = true


const Login = () => {
  const navigate = useNavigate()

  const [isLoginPage,setIsLoginPage] = useState(true);

  //Holds data when the user login

  const [loginUsername,setLoginUsername] = useState("");
  const [loginPassword,setLoginPassword] = useState("");

  //Holds data for registration

  const [registerUsername,setRegisterUsername] = useState("");
  const [registerEmail,setRegisterEmail] = useState('')
  const [registerPassword,setRegisterPassword] = useState("");
  const [confirmPassword,setConfirmPassword] = useState("");
  const [age,setAge] = useState(0)
  const [gender,setGender] = useState('')
  const [selectedImage, setSelectedImage] = useState(null);
  const [profilePic, setProfilePic] = useState("");

  const [loading,setLoading] = useState(false)

  
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'; // Fallback for safety


const handleRegister = async (e) => {

    e.preventDefault();
    setLoading(true)

    if (!registerUsername || !registerPassword || !registerEmail || !age || !gender) {
      alert("Please fill all fields");
      return;
    }

    if (registerPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("username", registerUsername);
      formData.append("email", registerEmail);
      formData.append("password", registerPassword);
      formData.append("age", age);
      formData.append("gender", gender);
      if (selectedImage) formData.append("image", selectedImage);

      const response = await axios.post(
        "/register",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert("Registered Successfully!");
      
      navigate('/')

      setRegisterUsername("");
      setRegisterPassword("");
      setConfirmPassword("");
      setRegisterEmail("");
      setGender("");
      setAge(0);
      setSelectedImage(null);


    } catch (error) {
      console.error("Something went wrong", error);
      alert(error.response?.data?.message || "Something went wrong");
    }finally{
      setLoading(false)
    }
  };



  const handleLogin = async(e) =>{
    e.preventDefault()
    setLoading(true)

    try {

      if(!loginUsername || !loginPassword){
        alert('Please Enter you username and password')
        return
      }

      const response = await axios.post(`/login`,{
        username:loginUsername,
        password:loginPassword
      });

      setLoginUsername('')
      setLoginPassword('')

      console.log(response.data)
      if(response.data.user.isAdmin){

        navigate('/admin-dashboard')

      }else{
        
        navigate('/home')

      }

      


    } catch (error) { 
      console.log('Something went wrong',error);
      alert('Invalid credentials')
      
    }finally{
      setLoading(false)
    }

  }
  
  return (
    <>


    <div className='h-screen bg-gradient-to-b from-white via-[#e4e4eb] to-[#2d00c2] flex items-center justify-center w-screen rounded-xl '>
      
    {
      isLoginPage? (
        <>

        loading ? (

          <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#6f2db7] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#6f2db7] font-semibold">Loading...</p>
          </div>
          </div>

        ):(

        

        <div className='bg-transparent mx-auto  p-6 w-8/12 sm:w-2/4 md:w-1/3 lg:w-2/6 xl:w-2/6 2xl:w-[20%]  shadow-2xl'>
            <h1 className='text-4xl font-bold text-center text-[#6f2db7] mb-3 2xl:text-3xl'>Login</h1>
            {/* <p className='text-center text-[#6f2db7] text-sm mb-3 2xl:text-base 2xl:mb-4'>Don't have an account? <span className='text-yellow-500 cursor-pointer underline' onClick={() => setIsLoginPage(false)}>Create Account</span></p> */}

            <form className='flex flex-col'>

                <label className='text-[#6f2db7] mb-1 2xl:text-base 2xl:mb-2'>Username:</label>

                <input type="text" 
                name="login-username" 
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder='Enter your Username' 
                className='bg-transparent px-3 py-3 mb-3 border-purple-700 border-1 transition-all ease-in outline-none rounded-xl text-black 2xl:mb-4 2xl:py-3 2xl:text-sm'/>

                <label className='text-[#6f2db7] mb-1 2xl:text-base 2xl:mb-2.5'>Password:</label>

                <input type="password" 
                name="login-password" 
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}  
                placeholder='Enter your Password' 
                className='bg-transparent px-3 py-3 border-purple-700 border-1  transition-all ease-in outline-none rounded-xl text-black mb-4 2xl:py-3 2xl:mb-5 2xl:text-sm'/>

                <button className='py-1.5 rounded-lg hover:rounded-3xl font-semibold text-white bg-[#6f2db7] cursor-pointer 2xl:py-2 transition-all ease-in flex justify-center items-center gap-1' onClick={handleLogin}><LogIn size={20}/>Login</button>

                <div className='w-full  mt-4 mb-3 border-b-1 border-purple-700'></div>
                <p className='text-purple-700 mb-2.5 text-center font-semibold'>Don't have an account?</p>
                <button className='py-1.5 rounded-lg hover:rounded-3xl text-[#6f2db7] bg-white font-semibold cursor-pointer 2xl:py-2 transition-all ease-in gap-1 flex items-center justify-center' onClick={() => setIsLoginPage(false)}><UserPlus size={20}/>Create Account</button>
            </form>
            
        </div>
        )
        </>
      ):(

        loading ? (

          <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#6f2db7] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[#6f2db7] font-semibold">Loading...</p>
          </div>
          </div>

        ):(

         <div className='bg-transparent mx-auto  p-6 w-8/12 sm:w-2/4 md:w-1/3 lg:w-2/6 xl:w-2/6 2xl:w-[20%]  shadow-2xl shadow-2xl shadow-gray-700 rounded-xl'>

            <h1 className='text-4xl font-bold text-center text-[#6f2db7] mb-5 2xl:text-3xl'>Create Account</h1>

            <form className='flex flex-col'>

                    <label className='text-[#6f2db7] mb-1'>Username:</label>

                    <input type="text" 
                    name="registerUsername" 
                    value={registerUsername}
                    onChange={(e) => setRegisterUsername(e.target.value)}
                    placeholder='Enter your username' 
                    className='bg-transparent border-1 border-purple-700 placeholder-[#6f2db7] px-3 py-2.5 mb-3 outline-none rounded-xl text-black'/>

               

                <div className='flex flex-row justify-start gap-5'>

                  <div className='flex flex-col'>

                    <label className='text-[#6f2db7] mb-1'>Age:</label>

                    <input type='number' 
                    name="register-age" 
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    min="1"
                    placeholder='Enter your Age' 
                    className='bg-transparent border-1 border-purple-700  px-3 py-2.5 mb-3 placeholder-[#6f2db7] outline-none rounded-xl text-black w-full'/>

                  </div>
                  
                <div className="flex flex-col ">
                  <label className="text-[#6f2db7] mb-1">Gender:</label>
                  <div className="flex flex-row gap-4 text-white ">
                    <label className="flex items-center gap-1 text-[#6f2db7]">
                      <input
                        type="radio"
                        name="gender"
                        value="Male"
                        checked={gender === "Male"}
                        onChange={(e) => setGender(e.target.value)}
                      />
                      Male
                    </label>

                    <label className="flex items-center gap-1 text-[#6f2db7]">
                      <input
                        type="radio"
                        name="gender"
                        value="Female"
                        checked={gender === "Female"}
                        onChange={(e) => setGender(e.target.value)}
                      />
                      Female
                    </label>
                  </div>
                </div>

                </div>

                <label className='text-[#6f2db7] mb-1'>Profile Picture:</label>

                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedImage(e.target.files[0])}
                    className='bg-white mb-4 py-1 px-3 cursor-pointer text-[#6f2db7] border-purple-700 border-1 rounded-xl'
                  />
                
                <label className='text-[#6f2db7] mb-1'>Email:</label>

                <input type="email" 
                  name="register-email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}  
                  placeholder='Enter your Email' 
                  className='bg-transparent border-1 border-purple-700  px-3 py-2.5 outline-none rounded-xl text-black mb-4  placeholder-[#6f2db7]'/>

                <label className='text-[#6f2db7] mb-1'>Password:</label>

                <input type="password" 
                name="register-password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)} 
                placeholder='Enter your Password'   
                className='bg-transparent border-1 border-purple-700  px-3 py-2.5 outline-none rounded-xl text-black mb-4 placeholder-[#6f2db7]'/>


                <label className='text-[#6f2db7] mb-1'>Confirm Password:</label>

                <input type="password" 
                name="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} 
                placeholder='Confirm your password' 
                className='bg-transparent border-1 border-purple-700  px-3 py-2.5 outline-none rounded-xl text-black mb-4 placeholder-[#6f2db7]'/>

                <button className='py-2 rounded-lg hover:rounded-3xl transition-all font-semibold ease-in text-white cursor-pointer bg-[#6f2db7] mb-2 gap-1 flex items-center justify-center' onClick={handleRegister}><Send size={20}/>Submit</button>

                <div className='w-full  mt-4 mb-3 border-b-1 border-white'></div>
                <p className='text-white mb-2.5 text-center font-semibold'>Already have an account?</p>

                <button className='py-1.5 rounded-lg hover:rounded-3xl text-[#6f2db7] font-semibold  bg-white cursor-pointer 2xl:py-2 transition-all ease-in flex justify-center items-center gap-1' onClick={() => setIsLoginPage(true)}><LogIn size={20}/>Login</button>

            </form>
            
        

        </div>
      )
        
    )

    }
 

    </div>
    
    </>
  )
}

export default Login