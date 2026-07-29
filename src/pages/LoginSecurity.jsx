import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchMe, updateProfile, changePassword } from '../api/users'

const REAUTH_VALID_MS = 10 * 60 * 1000

const LoginSecurity = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editingField, setEditingField] = useState(null) // "name" | "phone" | "password" | null
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")
  const [nameInput, setNameInput] = useState("")
  const [phoneInput, setPhoneInput] = useState("")
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("")
  const [newPasswordInput, setNewPasswordInput] = useState("")
  const [nameUpdateSuccess, setNameUpdateSuccess] = useState(false)
  const [phoneUpdateSuccess, setPhoneUpdateSuccess] = useState(false)
  const [passUpdateSuccess, setPassUpdateSuccess] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const reauthAt = Number(sessionStorage.getItem("reauth-login-security") || 0)
    const isFresh = Date.now() - reauthAt < REAUTH_VALID_MS
    if (!isFresh) {
      navigate('/account/reauth')
      return
    }

    async function loadUser() {
      try {
        const res = await fetchMe()
        setUser(res.data.data)
      } catch (err) {
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [navigate])

  function openEdit(field) {
    setFormError("")
    setEditingField(field)
    if (field === "name") setNameInput(user.name)
    if (field === "phone") setPhoneInput(user.phone || "")
    if (field === "password") {
      setConfirmPasswordInput("")
      setNewPasswordInput("")
    }
  }

  function closeEdit() {
    setEditingField(null)
    setFormError("")
  }

  async function handleSaveName(e) {
    e.preventDefault()
    setFormError("")
    setSaving(true)
    try {
      await updateProfile({ name: nameInput, phone: user.phone })
      setUser(prev => ({ ...prev, name: nameInput }))
      closeEdit()
      setNameUpdateSuccess(true)
    } catch (err) {
      setFormError(err.response?.data?.message || "Could not update name")
    } finally {

      setSaving(false)
      setTimeout(() => {
        setNameUpdateSuccess(false)
      }, 2000);
    }
  }

  async function handleSavePhone(e) {
    e.preventDefault()
    setFormError("")
    setSaving(true)
    try {
      await updateProfile({ name: user.name, phone: phoneInput })
      setUser(prev => ({ ...prev, phone: phoneInput }))
      closeEdit()
      setPhoneUpdateSuccess(true)
    } catch (err) {
      setFormError(err.response?.data?.message || "Could not update mobile number")
    } finally {
      setSaving(false)
      setTimeout(() => {
        setPhoneUpdateSuccess(false)
      }, 2000);
    }
  }

  async function handleSavePassword(e) {
  e.preventDefault()
  setFormError("")

  if (newPasswordInput !== confirmPasswordInput) {
    setFormError("New password and confirm password do not match")
    return
  }
  if(!/^(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])(?=.*[0-9]).{10,}/.test(newPasswordInput)){
      setFormError("Password must be 10 characters with 1 uppercase letter, 1 lowercase letter, 1 special character and 1 number")
      return
  }

  setSaving(true)
  try {
    await changePassword(newPasswordInput)
    closeEdit()
    setPassUpdateSuccess(true)
  } catch (err) {
    setFormError(err.response?.data?.message || "Could not change password")
  } finally {
    setSaving(false)
    setTimeout(() => {
       setPassUpdateSuccess(false) 
    }, 2000);
  }
}
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-slate-400">Loading...</p>
      </div>
    )
  }
  


  const rows = [
    { key: "name", label: "Name", value: user.name, editable: true },
    { key: "phone", label: "Mobile number", value: user.phone || "Not added", editable: true },
    { key: "email", label: "E-mail", value: user.email, editable: false },
    { key: "password", label: "Password", value: "••••••••", editable: true },
  ]

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        <div className="text-sm mb-4">
          <span onClick={() => navigate('/profile')} className="text-blue-600 hover:underline cursor-pointer">
            Your Account
          </span>
          <span className="text-slate-400 mx-2">›</span>
          <span className="text-orange-600">Login & Security</span>
        </div>

        <h1 className="text-3xl font-medium text-slate-900 mb-6">Login & Security</h1>

        <div className="border border-slate-200 rounded-md">
          {rows.map((row, i) => (
            <div key={row.key} className={i !== rows.length - 1 ? "border-b border-slate-200" : ""}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-5">
                <div>
                  <p className="font-semibold text-slate-900">{row.label}:</p>
                  <p className="text-slate-700 break-all">{row.value}</p>
                </div>
                {row.editable ? (
                  <button
                    onClick={() => openEdit(row.key)}
                    className="sm:w-auto border border-slate-400 rounded-full px-5 py-1.5 text-sm hover:bg-slate-50 transition cursor-pointer"
                  >
                    Edit
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 italic sm:self-center">Not editable yet</span>
                )}
              </div>

              {/* Inline edit forms */}
              {editingField === row.key && row.key === "name" && (
                <form onSubmit={handleSaveName} className="px-6 pb-5 space-y-3">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    required
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                  />
                  {formError && <p className="text-sm text-red-500">{formError}</p>}
                  <div className="flex flex-col-reverse sm:flex-row gap-2">
                    <button type="button" onClick={closeEdit} className="w-full sm:w-auto px-4 py-1.5 text-sm border border-slate-300 rounded-md hover:bg-slate-50 cursor-pointer">
                      Cancel
                    </button>
                    <button type="submit" disabled={saving} className="w-full sm:w-auto px-4 py-1.5 text-sm bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 text-white rounded-md cursor-pointer">
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </form>
              )}
            
  

              {editingField === row.key && row.key === "phone" && (
                <form onSubmit={handleSavePhone} className="px-6 pb-5 space-y-3">
                  <input
                    type="tel"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="Mobile number"
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                  />
                  {formError && <p className="text-sm text-red-500">{formError}</p>}
                  <div className="flex gap-2">
                    <button type="button" onClick={closeEdit} className="px-4 py-1.5 text-sm border border-slate-300 rounded-md hover:bg-slate-50 cursor-pointer">
                      Cancel
                    </button>
                    <button type="submit" disabled={saving} className="px-4 py-1.5 text-sm bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 text-white rounded-md cursor-pointer">
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </form>
              )}
             

              {editingField === row.key && row.key === "password" && (
                <form onSubmit={handleSavePassword} className="px-6 pb-5 space-y-3">
                  <input
                    type="password"
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="New password"
                    required
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                  />
                  <input
                    type="password"
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                  />
                  {formError && <p className="text-sm text-red-500">{formError}</p>}
                  <div className="flex gap-2">
                    <button type="button" onClick={closeEdit} className="px-4 py-1.5 text-sm border border-slate-300 rounded-md hover:bg-slate-50 cursor-pointer">
                      Cancel
                    </button>
                    <button type="submit" disabled={saving} className="px-4 py-1.5 text-sm bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 text-white rounded-md cursor-pointer">
                      {saving ? "Saving..." : "Change password"}
                    </button>
                  </div>
                </form>
              )}
             
            </div>
          ))}
        </div>

      </div>
      {(nameUpdateSuccess || phoneUpdateSuccess || passUpdateSuccess) && (
          <div className="mb-6 flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-md p-4">
            {/* <svg className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"> */}
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            {/* </svg> */}
            <div>
              <h4 className="text-sm font-semibold text-emerald-900">Success</h4>
              <p className="text-sm text-emerald-700 mt-0.5">
                {nameUpdateSuccess && "Your name has been updated successfully."}
                {phoneUpdateSuccess && "Your mobile number has been updated successfully."}
                {passUpdateSuccess && "Your password has been changed successfully."}
              </p>
            </div>
          </div>
        )}
    </div>
    
  )
}


export default LoginSecurity