import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/Auth.Context'
import toast from 'react-hot-toast'

export default function Register() {
  const [formData, setFormData] = useState({
    shopName: '',
    ownerName: '',
    email: '',
    password: '',
    phone: ''
  })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(formData)
      toast.success('Shop registered!')
      navigate('/login')
    } catch (err) {
      toast.error(
        err.response?.data?.message || 
        'Registration failed!'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🛒</div>
          <h1 className="text-2xl font-bold text-gray-800">
            Register Your Shop
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Start managing your shop today!
          </p>
        </div>

        <form onSubmit={handleSubmit} 
          className="space-y-4">

          {[
            { label: 'Shop Name', name: 'shopName', 
              type: 'text', placeholder: 'My Shop' },
            { label: 'Owner Name', name: 'ownerName', 
              type: 'text', placeholder: 'Prince Sahu' },
            { label: 'Email', name: 'email', 
              type: 'email', placeholder: 'your@email.com' },
            { label: 'Phone', name: 'phone', 
              type: 'tel', placeholder: '9999999999' },
            { label: 'Password', name: 'password', 
              type: 'password', placeholder: '••••••••' },
          ].map(field => (
            <div key={field.name}>
              <label className="block text-sm 
                font-medium text-gray-700 mb-1">
                {field.label}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                required
                className="w-full px-4 py-3 
                  border border-gray-300 
                  rounded-lg focus:outline-none 
                  focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 
              text-white py-3 rounded-lg 
              font-semibold hover:bg-blue-700 
              transition disabled:opacity-50"
          >
            {loading ? 
              'Registering...' : 
              'Register Shop'}
          </button>
        </form>

        <p className="text-center text-sm 
          text-gray-500 mt-6">
          Already registered?{' '}
          <Link to="/login" 
            className="text-blue-600 
            font-medium hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  )
}